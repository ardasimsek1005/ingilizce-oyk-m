import express from "express";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import { OFFLINE_DICTIONARY } from "./src/dictionary";
import { GLOBAL_DICTIONARY } from "./src/data";

// Secure cryptographic password hashing (PBKDF2)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(":");
  const salt = parts[0];
  const originalHash = parts[1];
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

// Hash email using SHA-256 for secure database keys
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}
// STORIES_PART1 ve STORIES_PART2 server'a import edilmiyor
// (600KB+783KB = çok büyük, Render free tier 512MB RAM'i aşıyor)
// Çeviri için offline dictionary ve CEFR levels kullanılıyor

dotenv.config();

const isCommonEnglishWord = (w: string): boolean => {
  if (!w) return false;
  const clean = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
  const commonWords = [
    "the", "a", "an", "and", "but", "or", "if", "because", "although", "while", "though",
    "every", "each", "some", "any", "no", "all", "both", "either", "neither",
    "once", "then", "there", "here", "now", "today", "yesterday", "tomorrow",
    "they", "them", "their", "theirs", "he", "him", "his", "she", "her", "hers", "it", "its",
    "we", "us", "our", "ours", "you", "your", "yours", "i", "me", "my", "mine",
    "who", "whom", "whose", "what", "which", "when", "where", "why", "how",
    "always", "never", "sometimes", "usually", "often", "rarely", "seldom",
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
  ];
  return commonWords.includes(clean) || !!OFFLINE_DICTIONARY[clean] || !!GLOBAL_DICTIONARY[clean];
};

const looksLikeProperNoun = (w: string): boolean => {
  if (!w) return false;
  const trimmed = w.trim();
  if (!/^[A-Z]/.test(trimmed)) return false;
  return !isCommonEnglishWord(trimmed);
};

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Use JSON parsing middleware with a larger body limit for base64 photo uploads
  app.use(express.json({ limit: "15mb" }));

  // Enable CORS middleware for Capacitor / cross-origin requests
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Load pre-calculated CEFR levels
  const cefrLevelsPath = path.join(process.cwd(), "src", "word_cefr_levels.json");
  let wordCefrLevels: Record<string, { base: string; tr: string; level: string; pos: string; explanation: string }> = {};

  const loadCefrLevels = () => {
    if (fs.existsSync(cefrLevelsPath)) {
      try {
        wordCefrLevels = JSON.parse(fs.readFileSync(cefrLevelsPath, "utf8"));
        console.log(`Loaded ${Object.keys(wordCefrLevels).length} pre-calculated CEFR levels from ${cefrLevelsPath}`);
      } catch (err) {
        console.error("Failed to load CEFR levels:", err);
      }
    }
  };

  loadCefrLevels();


  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Server-side database: persistent dynamic dictionary file cache in a location that is NOT watched by the dev server
  const DYNAMIC_DICT_PATH = path.join(os.tmpdir(), "dynamic_dictionary_cache.json");
  let dynamicDict: Record<string, { translation: string; isName: boolean; partOfSpeech: string; wordLevel: string; explanation: string }> = {};

  const GRAMMAR_FALLBACKS: Record<string, string> = {
    "were": "idiler / -di (geçmiş zaman çoğul)",
    "was": "idi / -di (geçmiş zaman tekil)",
    "am": "yim / am (olmak yardımcı fiili)",
    "is": "dir / -dir (olmak yardımcı fiili)",
    "are": "dirler / -dirler (olmak yardımcı fiili)",
    "been": "olmuş / bulunmuş",
    "had": "sahipti / vardı / yapmıştı",
    "has": "sahip / var",
    "have": "sahip olmak / var",
    "did": "yaptı / etti",
    "does": "yapar",
    "do": "yapmak",
    "an": "bir",
    "a": "bir",
    "the": "[belirli tanımlayıcı]",
    "and": "ve",
    "brother": "erkek kardeş",
    "sister": "kız kardeş"
  };

  const getPredefinedStoryTranslation = (_w: string): string | null => {
    // Hikaye tabanlı arama production'da devre dışı (bellek optimizasyonu)
    return null;
  };

  // Pre-population of the JSON dynamic cache from all story key vocabs
  const prePopulateDictionary = () => {
    try {
      let count = 0;
      const addWord = (en: string, tr: string) => {
        const clean = en.toLowerCase().trim();
        if (!clean) return;
        if (!dynamicDict[clean] || dynamicDict[clean].translation.toLowerCase().trim() === clean) {
          dynamicDict[clean] = {
            translation: tr,
            isName: /^[A-Z]/.test(en),
            partOfSpeech: "Kelime",
            wordLevel: "A1",
            explanation: "Sözlük Temel Karşılığı"
          };
          count++;
        }
      };
      // Sadece grammar core kelimelerini ekle (hikaye dosyaları server'a import edilmiyor)
      for (const [en, tr] of Object.entries(GRAMMAR_FALLBACKS)) {
        addWord(en, tr);
      }
      if (count > 0) {
        fs.writeFileSync(DYNAMIC_DICT_PATH, JSON.stringify(dynamicDict, null, 2), "utf8");
        console.log(`[Linguist DB] Pre-populated cache with ${count} grammar words.`);
      }
    } catch (populateErr) {
      console.error("Failed executing background pre-population logic:", populateErr);
    }
  };

  try {
    if (fs.existsSync(DYNAMIC_DICT_PATH)) {
      const raw = fs.readFileSync(DYNAMIC_DICT_PATH, "utf8");
      dynamicDict = JSON.parse(raw);
    } else {
      fs.writeFileSync(DYNAMIC_DICT_PATH, JSON.stringify({}, null, 2), "utf8");
    }
    // Run pre-population
    prePopulateDictionary();
  } catch (err) {
    console.error("Failed to load server-side dynamic dictionary:", err);
  }

  const saveToDynamicDict = (w: string, val: any) => {
    try {
      dynamicDict[w.toLowerCase().trim()] = val;
      fs.writeFileSync(DYNAMIC_DICT_PATH, JSON.stringify(dynamicDict, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to write to server-side dynamic dictionary:", err);
    }
  };

  const translateWithGoogle = async (text: string): Promise<string> => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google Translate HTTP ${response.status}`);
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0].trim();
      }
      throw new Error("Unrecognized formats from Google Translate");
    } catch (err) {
      console.error("Google Translate error:", err);
      throw err;
    }
  };

  // Automated translation and story parsing API
  app.post("/api/translate", async (req, res) => {
    const { title, text, level } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Lütfen geçerli bir hikaye içeriği girin." });
    }

    const sysInstruction = `You are a professional kids literary translator and English curriculum developer.
Your job is to translate an English story or reading practice text into Turkish. The target difficulty of the text is: ${level || "A1"}.

Follow these rules with extreme high quality:
1. Translate the story title: "${title || "Untitled"}" into Turkish.
2. Structure the entire text into page-by-page paragraph segments. You MUST divide the segments ONLY by the existing double-newlines (\n\n) present in the original input text. Keep the paragraphs exactly as they were pasted by the user without splitting them further.
3. For each paragraph segment:
   - Provide "textEn" (English paragraph text).
   - Provide "textTr" (The accurate, beautiful Turkish context translation of that paragraph).
   - Provide "words" array: identifying 4 to 8 key vocabulary words or idioms from this specific paragraph, particularly those aligned with language learning at difficulty level: ${level || "A1"}. Support clickable interactive bubbles: for each word, state the clean lowercase base form "en" without punctuation, and its Turkish definition "tr" in context. Do not include boring common words like 'the', 'is', 'a' unless they form a specific idiom.

Return a valid JSON output matching the requested schema exactly.`;

    try {
      const gResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Translate and structure this story into paragraph chunks with translated keywords:\n\nTitle: ${title || "Untitled"}\n\nStory Text:\n${text}`,
        config: {
          systemInstruction: sysInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleTr: {
                type: Type.STRING,
                description: "Turkish translation of the main story title."
              },
              paragraphs: {
                type: Type.ARRAY,
                description: "A list of structured pages or paragraph blocks.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    textEn: {
                      type: Type.STRING,
                      description: "Original English paragraph text."
                    },
                    textTr: {
                      type: Type.STRING,
                      description: "Turkish translation of this paragraph."
                    },
                    words: {
                      type: Type.ARRAY,
                      description: "Key vocabularies or idioms found in this paragraph text.",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          en: {
                            type: Type.STRING,
                            description: "English word (lowercase clean)"
                          },
                          tr: {
                            type: Type.STRING,
                            description: "Turkish translation"
                          }
                        },
                        required: ["en", "tr"]
                      }
                    }
                  },
                  required: ["textEn", "textTr", "words"]
                }
              }
            },
            required: ["titleTr", "paragraphs"]
          }
        }
      });

      const parsedJSON = JSON.parse(gResponse.text.trim());
      return res.json(parsedJSON);
    } catch (gErr: any) {
      console.error("Gemini automatic translation helper failed:", gErr);
      return res.status(500).json({ error: "Yapay zeka otomatik çeviri sistemi başarısız oldu: " + gErr.message });
    }
  });

  // Detailed contextual word translation and proper name detection API
  app.post("/api/translate-word", async (req, res) => {
    const { word, context, level } = req.body || {};
    try {
      if (!word || !word.trim() || typeof word !== "string") {
        return res.status(400).json({ error: "Lütfen geçerli bir kelime girin." });
      }

      const cleanW = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim().toLowerCase();
      if (!cleanW) {
        return res.json({
          translation: word,
          isName: false,
          partOfSpeech: "Kelime",
          wordLevel: level || "A1",
          explanation: "Özel karakter / Sembol"
        });
      }

      // Suffix and lemma-stripping offline translator helper
      const getOfflineTranslation = (w: string): { translation: string; isName: boolean; partOfSpeech: string; wordLevel: string; explanation: string } | null => {
        if (!w) return null;

        // 0. Check pre-calculated CEFR levels database first
        if (wordCefrLevels[w]) {
          const item = wordCefrLevels[w];
          return {
            translation: item.tr,
            isName: item.level === "Özel İsim" || item.pos === "Özel İsim",
            partOfSpeech: item.pos,
            wordLevel: item.level,
            explanation: item.explanation
          };
        }

        // 1. Direct offline dictionary match
        if (OFFLINE_DICTIONARY[w]) {
          const item = OFFLINE_DICTIONARY[w];
          return {
            translation: item.tr,
            isName: item.level === 'Özel İsim',
            partOfSpeech: item.notes.split(' • ')[0] || "Kelime",
            wordLevel: item.level,
            explanation: item.notes
          };
        }

        // 2. Direct global fallback dictionary match
        if (GLOBAL_DICTIONARY[w]) {
          return {
            translation: GLOBAL_DICTIONARY[w],
            isName: /^[A-Z]/.test(w),
            partOfSpeech: "Kelime",
            wordLevel: "A1",
            explanation: "Temel ortak kelime"
          };
        }

        // 3. Suffix heuristics to decompose derivatives
        // plural and third-person "s" (e.g. apples -> apple)
        if (w.endsWith("s") && w.length > 3) {
          const stem = w.slice(0, -1);
          const match = getOfflineTranslation(stem);
          if (match) return match;
        }
        if (w.endsWith("es") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return match;
        }

        // past tense "ed" (e.g. loved -> love, yelled -> yell)
        if (w.endsWith("ed") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return match;

          const stemE = w.slice(0, -1); // e.g., baked -> bake
          const matchE = getOfflineTranslation(stemE);
          if (matchE) return matchE;
        }

        // continuous "ing" (e.g. running -> run, smiling -> smile)
        if (w.endsWith("ing") && w.length > 5) {
          const stem = w.slice(0, -3);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: match.translation + " (Şimdiki Zaman)" };

          const stemE = w.slice(0, -3) + "e"; // e.g. dancing -> dance
          const matchE = getOfflineTranslation(stemE);
          if (matchE) return { ...matchE, translation: matchE.translation + " (Şimdiki Zaman)" };

          // check double consonant: e.g. running -> run
          if (stem.length > 1 && stem[stem.length - 1] === stem[stem.length - 2]) {
            const stemSingle = stem.slice(0, -1);
            const matchS = getOfflineTranslation(stemSingle);
            if (matchS) return { ...matchS, translation: matchS.translation + " (Şimdiki Zaman)" };
          }
        }

        // adverbs (e.g. happily -> happy)
        if (w.endsWith("ly") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: match.translation + " (-ly eki ile)" };
        }

        // comparatives and superlatives
        if (w.endsWith("er") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: "daha " + match.translation };
        }
        if (w.endsWith("est") && w.length > 5) {
          const stem = w.slice(0, -3);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: "en " + match.translation };
        }

        return null;
      };

      // 1. Check server-side persistent database cache first (saved lookups to avoid wasting time)
      if (dynamicDict[cleanW]) {
        const cachedItem = dynamicDict[cleanW];
        // Ensure cached translation is not stale English/itself
        if (cachedItem && cachedItem.translation && cachedItem.translation.toLowerCase().trim() !== cleanW) {
          return res.json(cachedItem);
        } else {
          delete dynamicDict[cleanW];
        }
      }

      // 1.5 Check offline dictionary/CEFR levels database first (super-fast, accurate offline lookup)
      const offlineMatch = getOfflineTranslation(cleanW);
      if (offlineMatch) {
        if (offlineMatch.translation && offlineMatch.translation.toLowerCase().trim() !== cleanW) {
          // If the original input word looks like a proper name, force isName properties
          if (looksLikeProperNoun(word)) {
            offlineMatch.isName = true;
            offlineMatch.wordLevel = "Özel İsim";
            offlineMatch.partOfSpeech = "Özel İsim";
            offlineMatch.explanation = "Özel İsim • Doğrulanmış Karşılık";
          }
          return res.json(offlineMatch);
        }
      }
 
      // 2. Translate using Gemini API as absolute premium option
      let result: any = null;
 
      if (process.env.GEMINI_API_KEY) {
        const sysInstruction = `You are an expert bilingual English-to-Turkish kids translator and dictionary helper.
Your absolute goal is to translate English terms into clean, elegant, and standard Turkish.
- Word/Phrase: "${word}"
- Context sentence/paragraph: "${context || ""}"
- Reading level of the book: "${level || "General"}"
 
RULES FOR MAXIMUM TURKISH COHERENCE:
1. The 'translation' field MUST be written in TURKISH. Under absolutely no circumstances should you put an English word or an English phrase inside the 'translation' field!
2. Determine if the word is a proper name, character name, or specific location in the story (e.g. Cinderella, Gepetto, Aladdin, etc.).
   - If it is a proper name, set 'isName' to true, and set 'translation' to the Turkish or adapted version with '(Özel İsim)', e.g. 'Külkedisi (Özel İsim)' or 'Jack (Özel İsim)'.
3. The 'explanation' field MUST ALSO be written entirely in Turkish (e.g., brief Turkish hint or grammar tip under 12 words, like: 'Fiil • Ormanda gezinmek veya dolaşmak anlamına gelir'). No English in explanation fields whatsoever!
4. The CEFR level should be clearly set as A1, A2, B1, B2, C1, or C2. Return a valid JSON output matching requested schema exactly.`;
 
        try {
          const gResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Translate the English word "${word}" in context: "${context || ""}" into Turkish.`,
            config: {
              systemInstruction: sysInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  translation: {
                    type: Type.STRING,
                    description: "The beautiful Turkish translation in context. MUST be purely in Turkish words."
                  },
                  isName: {
                    type: Type.BOOLEAN,
                    description: "True if the word represents a proper noun, character name, or place name."
                  },
                  partOfSpeech: {
                    type: Type.STRING,
                    description: "Part of speech in Turkish (e.g. İsim, Fiil, Sıfat, Zarf, Özel İsim)"
                  },
                  wordLevel: {
                    type: Type.STRING,
                    description: "The exact vocabulary level (e.g., A1, A2, B1, B2, C1, C2)"
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Optional grammar tip or lookup hint written entirely in Turkish under 15 words."
                  }
                },
                required: ["translation", "isName", "partOfSpeech", "wordLevel"]
              }
            }
          });
 
          const parsedJSON = JSON.parse(gResponse.text.trim());
          if (parsedJSON && parsedJSON.translation && parsedJSON.translation.toLowerCase().trim() !== cleanW) {
            result = parsedJSON;
          }
        } catch (gErr: any) {
          console.error("Gemini context translation errored or returned invalid response, using Google Translate fallback:", gErr);
        }
      }
 
      // 3. Fallback to Google Translate free API
      if (!result) {
        try {
          const googleTranslation = await translateWithGoogle(word);
          if (googleTranslation && googleTranslation.toLowerCase().trim() !== cleanW) {
            const looksLikePropName = looksLikeProperNoun(word);
            result = {
              translation: looksLikePropName ? `${googleTranslation} (Özel İsim)` : googleTranslation,
              isName: looksLikePropName,
              partOfSpeech: looksLikePropName ? "Özel İsim" : "Kelime",
              wordLevel: looksLikePropName ? "Özel İsim" : `${level || "A1"}`,
              explanation: looksLikePropName ? "Özel İsim • Google Çeviri Destekli" : "Google Çeviri Destekli Kelime"
            };
          }
        } catch (googleErr) {
          console.error("All high-speed word translators failed, resorting to structural recovery:", googleErr);
        }
      }
 
      // 4. Try story-book / grammar fallback
      if (!result) {
        const storyFallbackTranslation = getPredefinedStoryTranslation(cleanW);
        if (storyFallbackTranslation) {
          result = {
            translation: storyFallbackTranslation,
            isName: looksLikeProperNoun(word),
            partOfSpeech: "Kelime",
            wordLevel: `${level || "A1"}`,
            explanation: "Doğrulanmış Karşılık"
          };
        }
      }
 
      // 5. Deepest offline recovery fallback
      if (!result) {
        const looksLikePropName = /^[A-Z]/.test(word);
        result = {
          translation: looksLikePropName ? `${word} (Özel İsim)` : word,
          isName: looksLikePropName,
          partOfSpeech: looksLikePropName ? "Özel İsim" : "Kelime",
          wordLevel: looksLikePropName ? "Özel İsim" : `${level || "A1"}`,
          explanation: "Çevrimdışı Sözlük Çevirisi"
        };
      }
 
      // 6. Save newly resolved word & Turkish pair into the server-side persistent dictionary database file for future rapid O(1) matching
      if (result && result.translation && result.translation.toLowerCase().trim() !== cleanW) {
        saveToDynamicDict(cleanW, result);
      }
 
      return res.json(result);
    } catch (err: any) {
      console.error("Unhandled exception in translate-word server endpoint:", err);
      // Fallback rescue response to client so frontend never breaks
      return res.json({
        translation: word,
        isName: false,
        partOfSpeech: "Bilgisi Yok",
        wordLevel: level || "A1",
        explanation: "Sistem Meşgul (Geçici Fallback Çevirisi)"
      });
    }
  });

  // User synchronization file database
  const USERS_DATA_PATH = path.join(process.cwd(), "users_data.json");
  let usersData: Record<string, any> = {};

  const loadUsersData = () => {
    if (fs.existsSync(USERS_DATA_PATH)) {
      try {
        usersData = JSON.parse(fs.readFileSync(USERS_DATA_PATH, "utf8"));
        console.log(`[Linguist Sync] Loaded dynamic users database with ${Object.keys(usersData).length} accounts.`);
        
        // Migrate legacy plain text email keys to hashed keys
        let migrated = false;
        for (const key of Object.keys(usersData)) {
          if (key.includes("@")) {
            const hashedKey = hashEmail(key);
            usersData[hashedKey] = usersData[key];
            delete usersData[key];
            migrated = true;
          }
        }
        if (migrated) {
          console.log("[Linguist Security] Upgraded legacy plain-text email database keys to SHA-256 hashes.");
          saveUsersData();
        }
      } catch (err) {
        console.error("Failed to load users data:", err);
      }
    }
  };

  const saveUsersData = () => {
    try {
      fs.writeFileSync(USERS_DATA_PATH, JSON.stringify(usersData, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save users data:", err);
    }
  };

  loadUsersData();

  // Get config for client-side API/Keys
  app.get("/api/config", (req, res) => {
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || ""
    });
  });

  // Sync endpoint - Save progress
  app.post("/api/sync", (req, res) => {
    const { email, data } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Geçersiz email adresi." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedEmail = hashEmail(cleanEmail);
    const userRecord = usersData[hashedEmail];
    
    if (userRecord) {
      // Authenticate token for existing users
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
      const validTokens = userRecord.tokens || [];

      if (!token || !validTokens.includes(token)) {
        return res.status(401).json({ error: "Oturumunuz geçersiz veya sonlandırılmış. Lütfen tekrar giriş yapın. ⚠️" });
      }

      userRecord.data = data;
      userRecord.updatedAt = new Date().toISOString();
    } else {
      // If user does not exist at all, we require them to go through /api/auth first
      return res.status(401).json({ error: "Öncelikle kayıt olmanız gerekmektedir. ⚠️" });
    }

    saveUsersData();
    return res.json({ success: true, message: "İlerleme başarıyla senkronize edildi." });
  });

  // Sync endpoint - Fetch progress
  app.get("/api/sync", (req, res) => {
    const email = req.query.email;
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Geçersiz email adresi." });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    const hashedEmail = hashEmail(cleanEmail);
    const userRecord = usersData[hashedEmail];
    if (!userRecord) {
      return res.json({ found: false, data: null });
    }

    // Authenticate token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const validTokens = userRecord.tokens || [];

    if (!token || !validTokens.includes(token)) {
      return res.status(401).json({ error: "Oturumunuz geçersiz veya sonlandırılmış. Lütfen tekrar giriş yapın. ⚠️" });
    }
    
    return res.json({ found: true, data: userRecord.data });
  });

  // Auth endpoint - Register or login user with password or token
  app.post("/api/auth", (req, res) => {
    try {
      const { email, password, token, provider, isExternal } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Geçersiz e-posta adresi. ⚠️" });
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedEmail = hashEmail(cleanEmail);
      let userRecord = usersData[hashedEmail];

      // Case 1: Token verification (auto-login/linking)
      if (token) {
        if (!userRecord || !userRecord.tokens || !userRecord.tokens.includes(token)) {
          return res.status(401).json({ error: "Kayıtlı oturum anahtarı geçersiz veya süresi dolmuş. ⚠️" });
        }
        return res.json({ success: true, token, isNew: false, message: "Kayıtlı oturum doğrulandı." });
      }

      // Case 2: External provider login (trusted auth)
      if (isExternal) {
        const sessionToken = crypto.randomBytes(32).toString("hex");
        if (!userRecord) {
          // Create new account for this external provider
          usersData[hashedEmail] = {
            password: "", // empty password for external signups
            tokens: [sessionToken],
            data: {},
            updatedAt: new Date().toISOString()
          };
          saveUsersData();
          return res.json({ success: true, token: sessionToken, isNew: true, message: "Yeni hesap başarıyla oluşturuldu." });
        } else {
          // Initialize tokens array if it doesn't exist
          userRecord.tokens = userRecord.tokens || [];
          userRecord.tokens.push(sessionToken);
          if (userRecord.tokens.length > 5) {
            userRecord.tokens.shift();
          }
          userRecord.updatedAt = new Date().toISOString();
          saveUsersData();
          return res.json({ success: true, token: sessionToken, isNew: false, message: "Giriş başarılı." });
        }
      }

      // Case 3: Password verification
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır. ⚠️" });
      }

      const sessionToken = crypto.randomBytes(32).toString("hex");

      if (!userRecord) {
        // Create new account with hashed password
        usersData[hashedEmail] = {
          password: hashPassword(password),
          tokens: [sessionToken],
          data: {},
          updatedAt: new Date().toISOString()
        };
        saveUsersData();
        return res.json({ success: true, token: sessionToken, isNew: true, message: "Yeni hesap başarıyla oluşturuldu." });
      } else {
        // Initialize tokens array if it doesn't exist
        userRecord.tokens = userRecord.tokens || [];

        // Check if legacy password is plain text
        if (!userRecord.password) {
          // If account exists but has no password field, set hashed password
          userRecord.password = hashPassword(password);
          saveUsersData();
        } else if (!userRecord.password.includes(":")) {
          // Plain text legacy password check
          if (userRecord.password !== password) {
            return res.status(401).json({ error: "Girdiğiniz şifre bu hesapla eşleşmiyor. Lütfen doğru şifreyi girin. ⚠️" });
          }
          // Upgrade legacy plain text password to hashed format
          userRecord.password = hashPassword(password);
          saveUsersData();
        } else {
          // Hashed password check
          if (!verifyPassword(password, userRecord.password)) {
            return res.status(401).json({ error: "Girdiğiniz şifre bu hesapla eşleşmiyor. Lütfen doğru şifreyi girin. ⚠️" });
          }
        }

        // Add the new session token
        userRecord.tokens.push(sessionToken);
        // Limit active tokens count per user to 5 to prevent bloating
        if (userRecord.tokens.length > 5) {
          userRecord.tokens.shift();
        }
        userRecord.updatedAt = new Date().toISOString();
        saveUsersData();

        return res.json({ success: true, token: sessionToken, isNew: false, message: "Giriş başarılı." });
      }
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(500).json({ error: "Kimlik doğrulaması sırasında sunucu hatası oluştu." });
    }
  });

  // Register endpoint - Create a new user with validation, unique username, and IP logging
  app.post("/api/register", (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || typeof username !== "string") {
        return res.status(400).json({ error: "Lütfen geçerli bir isim girin. ⚠️" });
      }
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Geçersiz e-posta adresi. ⚠️" });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır. ⚠️" });
      }

      const cleanUsername = username.trim();
      const lowerUsername = cleanUsername.toLowerCase();

      // Username length and character check
      if (cleanUsername.length < 3 || cleanUsername.length > 25) {
        return res.status(400).json({ error: "Kullanıcı adı 3-25 karakter arasında olmalıdır. ⚠️" });
      }
      const validNameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]+$/;
      if (!validNameRegex.test(cleanUsername)) {
        return res.status(400).json({ error: "Kullanıcı adı sadece harf, sayı ve boşluk içerebilir. ⚠️" });
      }

      // Profanity Filter (Küfür Filtresi)
      const badWords = [
        "orospu", "siktir", "sikti", "siker", "amcik", "amcık", "yarrak", "yarak", 
        "göt", "got", "pezevenk", "kahpe", "pic", "piç", "dalyarak", "meme", 
        "fuck", "bitch", "asshole", "fucker", "amına", "amina", "koyayım", "koyayim"
      ];
      // strip spaces and check
      const normalizedForProfanity = lowerUsername.replace(/\s+/g, "");
      const hasProfanity = badWords.some(word => normalizedForProfanity.includes(word));
      if (hasProfanity) {
        return res.status(400).json({ error: "Kullanıcı adı uygunsuz veya küfürlü kelimeler içeremez. ⚠️" });
      }

      // Unique Username check
      const usernameExists = Object.values(usersData).some(user => 
        user && user.username && user.username.toLowerCase() === lowerUsername
      );
      if (usernameExists) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten başka bir üye tarafından alınmış. ⚠️" });
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedEmail = hashEmail(cleanEmail);
      let userRecord = usersData[hashedEmail];

      if (userRecord) {
        return res.status(400).json({ error: "Bu e-posta adresiyle zaten kayıtlı bir hesap var. ⚠️" });
      }

      // Record client IP Address
      const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();

      const sessionToken = crypto.randomBytes(32).toString("hex");

      // Save user record
      usersData[hashedEmail] = {
        username: cleanUsername,
        password: hashPassword(password),
        tokens: [sessionToken],
        ipAddress: clientIp,
        data: {
          userName: cleanUsername,
          stats: {
            learnedWordsCount: 0,
            completedBooksCount: 0,
            dailyStreak: 1,
            totalTimeMinutes: 0,
            readingGoalPercent: 0,
            wordGoalPercent: 0,
            timeGoalPercent: 0,
            hearts: 5,
            isPremium: false,
            weeklyWords: [0, 0, 0, 0, 0, 0, 0],
            weeklyMins: [0, 0, 0, 0, 0, 0, 0],
            lastActiveDate: new Date().toISOString().split("T")[0]
          },
          books: [],
          vocabulary: [],
          badges: [],
          loginProvider: "email",
          linkedProviders: ["email"]
        },
        updatedAt: new Date().toISOString()
      };

      saveUsersData();

      return res.json({ 
        success: true, 
        token: sessionToken, 
        isNew: true, 
        username: cleanUsername,
        message: "Hesap başarıyla oluşturuldu." 
      });

    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ error: "Kayıt sırasında sunucu hatası oluştu." });
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Serve Vite frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Linguist Server] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
