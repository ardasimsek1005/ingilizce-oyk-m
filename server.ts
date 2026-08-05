import express from "express";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OFFLINE_DICTIONARY } from "./src/dictionary";
import { GLOBAL_DICTIONARY } from "./src/data";
import { runDailyInstagramFlow, fetchDailyWordFromGemini, saveDailyWordCardImage, runDailyAppPromotionFlow, runDailyReelFlow } from "./src/services/instagramService";

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

// Robust Profanity and Argo detection helper
function checkIsProfane(name: string): boolean {
  if (!name) return false;
  
  const text = name.toLowerCase().trim();
  
  const replacements: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
    'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g',
    'â': 'a', 'î': 'i', 'û': 'u', 'é': 'e'
  };
  
  let normalized = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    normalized += replacements[char] || char;
  }
  
  // Remove non-alphanumeric character sequences and repeated characters
  let cleanText = '';
  for (let i = 0; i < normalized.length; i++) {
    if (i === 0 || normalized[i] !== normalized[i - 1]) {
      cleanText += normalized[i];
    }
  }
  
  const noSpaces = normalized.replace(/[^a-z0-9]/g, '');
  const cleanNoSpaces = cleanText.replace(/[^a-z0-9]/g, '');
  
  const badWords = [
    // Severe Turkish profanity & argo
    "orospu", "siktir", "sikti", "siker", "amcik", "yarrak", "yarak", "pezevenk",
    "kahpe", "pic", "dalyarak", "amına", "amina", "amını", "amini", "ibne",
    "tassak", "taşşak", "yarag", "yarağ", "göt", "got", "gote", "göte", "gotu",
    "götü", "götlek", "gotlek", "yavsak", "yavşak", "pust", "puşt", "amk", "aq",
    "sik", "siki", "sikiş", "sikis", "koyayim", "koyayım", "koyarim", "koyarım",
    "meme", "gogus", "göğüs", "kalta", "kaltak", "osur", "osurd", "osuruk",
    "bok", "boki", "boku", "bokye", "boklu", "dild", "dildo", "seks", "sex",
    "porno", "pipi", "vagina", "vajin", "vajina", "penis", "hıyar", "hiyar",
    "aptal", "salak", "gerizekali", "gerizekalı", "gerizek", "manyak", "kopek", "köpek",
    // English profanity
    "fuck", "bitch", "asshole", "fucker", "cunt", "dick", "cock", "pussy", "bastard",
    "slut", "whore", "nigga", "nigger",
    // System words
    "admin", "yonetici", "moderator", "destek", "support", "sistem", "system",
    "kurucu", "owner", "staff", "ekip", "team", "yetkili", "developer", "gelistirici"
  ];
  
  // Check substrings for longer bad words
  const hasLongWord = badWords.some(word => {
    if (word.length <= 3) return false;
    return noSpaces.includes(word) || cleanNoSpaces.includes(word);
  });
  if (hasLongWord) return true;
  
  // Check exact words for short words (with boundaries)
  const words = normalized.split(/[^a-z0-9]+/);
  const cleanWords = cleanText.split(/[^a-z0-9]+/);
  
  const hasShortWord = badWords.some(word => {
    if (word.length > 3) return false;
    return words.includes(word) || cleanWords.includes(word) || noSpaces === word || cleanNoSpaces === word;
  });
  
  return hasShortWord;
}
// STORIES_PART1 ve STORIES_PART2 server'a import edilmiyor
// (600KB+783KB = çok büyük, Render free tier 512MB RAM'i aşıyor)
// Çeviri için offline dictionary ve CEFR levels kullanılıyor

dotenv.config();

// Configure email SMTP transporter using environment variables
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@ingilizceoykum.com";

let transporter: any = null;

if (smtpHost && smtpUser && smtpPass) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log("[Mail] SMTP transporter configured successfully.");
  } catch (err) {
    console.error("[Mail] Failed to configure SMTP transporter:", err);
  }
} else {
  console.log("[Mail] SMTP configuration missing. Emails will be logged to sent_emails.log.");
}

// Function to send login success email notification
function sendLoginNotificationEmail(email: string, userName: string, provider: string) {
  const cleanEmail = email.toLowerCase().trim();
  
  // Skip if not a valid looking email address
  if (!cleanEmail.includes("@")) {
    console.log(`[Mail] Skip sending email to username/local account key: ${email}`);
    return;
  }

  const subject = "İngilizce Öyküm - Giriş Başarılı 🚀";
  const providerText = provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "E-posta / Şifre";
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e5; border-radius: 12px; background-color: #ffffff; color: #2d3436;">
      <div style="text-align: center; border-bottom: 2px solid #f1f3f5; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #4ECDC4; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">İngilizce Öyküm</h2>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #495057;">Merhaba <strong>${userName}</strong>,</p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #495057;">
        Hesabınıza <strong>${providerText}</strong> aracılığıyla başarıyla giriş yapıldı. Tüm okuma ilerlemeniz, istatistikleriniz ve kelime kütüphaneniz cihazlarınızla senkronize edildi.
      </p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #4ECDC4; padding: 12px 18px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; color: #6c757d; font-family: monospace;">
          <strong>E-posta:</strong> ${cleanEmail}<br>
          <strong>Yöntem:</strong> ${providerText}<br>
          <strong>Tarih:</strong> ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
        </p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #495057;">
        İyi okumalar ve keyifli öğrenmeler dileriz! 📚✨
      </p>
      
      <div style="text-align: center; border-top: 1px solid #eee; padding-top: 15px; margin-top: 25px; font-size: 11px; color: #adb5bd;">
        Bu e-posta İngilizce Öyküm güvenlik bilgilendirmesi kapsamında gönderilmiştir.
      </div>
    </div>
  `;

  if (transporter) {
    const mailOptions = {
      from: `"İngilizce Öyküm" <${smtpFrom}>`,
      to: cleanEmail,
      subject: subject,
      html: htmlContent
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error(`[Mail] Error sending login email to ${cleanEmail}:`, error);
      } else {
        console.log(`[Mail] Login email successfully sent to ${cleanEmail}:`, info.messageId);
      }
    });
  } else {
    // Write simulated email to logs/sent_emails.log
    const mailLogEntry = `
[${new Date().toISOString()}] EMAIL SENT
To: ${cleanEmail}
Subject: ${subject}
Provider: ${providerText}
User: ${userName}
--------------------------------------------------
`;
    try {
      fs.appendFileSync("sent_emails.log", mailLogEntry, "utf-8");
      console.log(`[Mail Simulator] Email simulated for ${cleanEmail}. Saved to sent_emails.log`);
    } catch (err) {
      console.error("[Mail Simulator] Failed to write email simulation log:", err);
    }
  }
}

let wordCefrLevels: Record<string, { base: string; tr: string; level: string; pos: string; explanation: string }> = {};

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
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "hello", "hi", "ok", "okay", "yes", "no", "please", "thank", "thanks"
  ];
  return commonWords.includes(clean) || !!OFFLINE_DICTIONARY[clean] || !!GLOBAL_DICTIONARY[clean] || !!wordCefrLevels[clean];
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
  // assigned to module-scope wordCefrLevels
  
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

  const translateWithGoogle = async (text: string, targetLang: string = "tr"): Promise<string> => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
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

  const getLanguageName = (code: string): string => {
    const mapping: Record<string, string> = {
      tr: "Turkish",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
      zh: "Chinese",
      hi: "Hindi",
      ja: "Japanese",
      en: "English"
    };
    return mapping[code] || "Turkish";
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
    const { word, context, level, targetLang } = req.body || {};
    try {
      if (!word || !word.trim() || typeof word !== "string") {
        return res.status(400).json({ error: "Lütfen geçerli bir kelime girin." });
      }

      const langCode = targetLang || "tr";
      const targetLangName = getLanguageName(langCode);

      const cleanW = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim().toLowerCase();
      if (!cleanW) {
        return res.json({
          translation: word,
          isName: false,
          partOfSpeech: "Word",
          wordLevel: level || "A1",
          explanation: "Symbol / Special Character"
        });
      }

      // Suffix and lemma-stripping offline translator helper (only for Turkish)
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

        if (w.endsWith("ed") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return match;

          const stemE = w.slice(0, -1);
          const matchE = getOfflineTranslation(stemE);
          if (matchE) return matchE;
        }

        if (w.endsWith("ing") && w.length > 5) {
          const stem = w.slice(0, -3);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: match.translation + " (Şimdiki Zaman)" };

          const stemE = w.slice(0, -3) + "e";
          const matchE = getOfflineTranslation(stemE);
          if (matchE) return { ...matchE, translation: matchE.translation + " (Şimdiki Zaman)" };

          if (stem.length > 1 && stem[stem.length - 1] === stem[stem.length - 2]) {
            const stemSingle = stem.slice(0, -1);
            const matchS = getOfflineTranslation(stemSingle);
            if (matchS) return { ...matchS, translation: matchS.translation + " (Şimdiki Zaman)" };
          }
        }

        if (w.endsWith("ly") && w.length > 4) {
          const stem = w.slice(0, -2);
          const match = getOfflineTranslation(stem);
          if (match) return { ...match, translation: match.translation + " (-ly eki ile)" };
        }

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

      const cacheKey = `${langCode}_${cleanW}`;

      // 1. Check server-side persistent database cache first (saved lookups to avoid wasting time)
      if (dynamicDict[cacheKey]) {
        const cachedItem = dynamicDict[cacheKey];
        if (cachedItem && cachedItem.translation && cachedItem.translation.toLowerCase().trim() !== cleanW) {
          return res.json(cachedItem);
        } else {
          delete dynamicDict[cacheKey];
        }
      }

      // 1.5 Check offline dictionary/CEFR levels database first (only if target language is Turkish)
      if (langCode === "tr") {
        const offlineMatch = getOfflineTranslation(cleanW);
        if (offlineMatch) {
          if (offlineMatch.translation && offlineMatch.translation.toLowerCase().trim() !== cleanW) {
            if (looksLikeProperNoun(word)) {
              offlineMatch.isName = true;
              offlineMatch.wordLevel = "Özel İsim";
              offlineMatch.partOfSpeech = "Özel İsim";
              offlineMatch.explanation = "Özel İsim • Doğrulanmış Karşılık";
            }
            return res.json(offlineMatch);
          }
        }
      }
 
      // 2. Translate using Gemini API
      let result: any = null;
 
      if (process.env.GEMINI_API_KEY) {
        const sysInstruction = `You are an expert bilingual English-to-${targetLangName} kids translator and dictionary helper.
Your absolute goal is to translate English terms into clean, elegant, and standard ${targetLangName}.
- Word/Phrase: "${word}"
- Context sentence/paragraph: "${context || ""}"
- Reading level of the book: "${level || "General"}"
 
RULES FOR MAXIMUM ${targetLangName.toUpperCase()} COHERENCE:
1. The 'translation' field MUST be written in ${targetLangName}. Under absolutely no circumstances should you put an English word or an English phrase inside the 'translation' field!
2. Determine if the word is a proper name, character name, or specific location in the story (e.g. Cinderella, Gepetto, Aladdin, etc.).
   - If it is a proper name, set 'isName' to true, and set 'translation' to the ${targetLangName} or adapted version with indicators, e.g. 'Jack (Özel İsim)' or translated equivalents.
3. The 'explanation' field MUST ALSO be written entirely in ${targetLangName} (e.g., brief hint or grammar tip under 12 words). No English in explanation fields whatsoever!
4. The CEFR level should be clearly set as A1, A2, B1, B2, C1, or C2. Return a valid JSON output matching requested schema exactly.`;
 
        try {
          const gResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Translate the English word "${word}" in context: "${context || ""}" into ${targetLangName}.`,
            config: {
              systemInstruction: sysInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  translation: {
                    type: Type.STRING,
                    description: `The beautiful ${targetLangName} translation in context. MUST be purely in ${targetLangName} words.`
                  },
                  isName: {
                    type: Type.BOOLEAN,
                    description: "True if the word represents a proper noun, character name, or place name."
                  },
                  partOfSpeech: {
                    type: Type.STRING,
                    description: "Part of speech (e.g. Noun, Verb, Adjective, Adverb, Proper Noun)"
                  },
                  wordLevel: {
                    type: Type.STRING,
                    description: "The exact vocabulary level (e.g., A1, A2, B1, B2, C1, C2)"
                  },
                  explanation: {
                    type: Type.STRING,
                    description: `Optional grammar tip or lookup hint written entirely in ${targetLangName} under 15 words.`
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
          console.error("Gemini context translation errored, using Google Translate fallback:", gErr);
        }
      }
 
      // 3. Fallback to Google Translate free API
      if (!result) {
        try {
          const googleTranslation = await translateWithGoogle(word, langCode);
          if (googleTranslation && googleTranslation.toLowerCase().trim() !== cleanW) {
            const looksLikePropName = looksLikeProperNoun(word);
            result = {
              translation: looksLikePropName ? `${googleTranslation} (${langCode === 'tr' ? 'Özel İsim' : 'Proper Noun'})` : googleTranslation,
              isName: looksLikePropName,
              partOfSpeech: looksLikePropName ? (langCode === 'tr' ? "Özel İsim" : "Proper Noun") : "Word",
              wordLevel: looksLikePropName ? "Proper Noun" : `${level || "A1"}`,
              explanation: looksLikePropName ? "Google Translate Support" : "Google Translate Word"
            };
          }
        } catch (googleErr) {
          console.error("All high-speed word translators failed, resorting to structural recovery:", googleErr);
        }
      }
 
      // 4. Try story-book / grammar fallback (only if target language is Turkish)
      if (!result && langCode === "tr") {
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
          translation: looksLikePropName ? `${word} (${langCode === 'tr' ? 'Özel İsim' : 'Proper Noun'})` : word,
          isName: looksLikePropName,
          partOfSpeech: looksLikePropName ? (langCode === 'tr' ? "Özel İsim" : "Proper Noun") : "Word",
          wordLevel: looksLikePropName ? "Proper Noun" : `${level || "A1"}`,
          explanation: "Offline Word Rescue"
        };
      }
 
      // 6. Save newly resolved word into dynamic cache database
      if (result && result.translation && result.translation.toLowerCase().trim() !== cleanW) {
        saveToDynamicDict(cacheKey, result);
      }
 
      return res.json(result);
    } catch (err: any) {
      console.error("Unhandled exception in translate-word server endpoint:", err);
      return res.json({
        translation: word,
        isName: false,
        partOfSpeech: "Unknown",
        wordLevel: level || "A1",
        explanation: "System Busy Fallback"
      });
    }
  });

  // Dynamic sentence translation endpoint
  app.post("/api/translate-sentence", async (req, res) => {
    const { text, targetLang } = req.body || {};
    try {
      if (!text || !text.trim() || typeof text !== "string") {
        return res.status(400).json({ error: "Lütfen geçerli bir metin girin." });
      }

      const langCode = targetLang || "tr";
      const targetLangName = getLanguageName(langCode);
      const textHash = crypto.createHash("sha256").update(text).digest("hex");
      const cacheKey = `${langCode}_sent_${textHash}`;

      if (dynamicDict[cacheKey]) {
        return res.json({ translation: dynamicDict[cacheKey].translation });
      }

      let translation = "";

      // 1. Try Gemini API
      if (process.env.GEMINI_API_KEY) {
        try {
          const sysInstruction = `You are a professional children's book translator. Translate the given English sentence or paragraph into natural, simple, and clean ${targetLangName}. Do not add any annotations, extra text, or keep English words unless they are proper names that are not translatable. Your response MUST contain ONLY the translation text.`;
          const gResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: text,
            config: {
              systemInstruction: sysInstruction,
            }
          });
          const resultText = gResponse.text.trim();
          if (resultText) {
            translation = resultText;
          }
        } catch (gErr: any) {
          console.error("Gemini sentence translation failed:", gErr);
        }
      }

      // 2. Fallback to Google Translate
      if (!translation) {
        try {
          translation = await translateWithGoogle(text, langCode);
        } catch (googleErr) {
          console.error("Google sentence translation fallback failed:", googleErr);
        }
      }

      // 3. Last resort fallback
      if (!translation) {
        translation = text;
      }

      // Cache it
      saveToDynamicDict(cacheKey, { translation });

      return res.json({ translation });
    } catch (err: any) {
      console.error("Unhandled exception in translate-sentence server endpoint:", err);
      return res.json({ translation: text });
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
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
      minVersionCode: 16
    });
  });

  // Auto-login endpoint based on Device UUID
  app.post("/api/auto-login", (req, res) => {
    try {
      const { deviceUuid } = req.body;
      if (!deviceUuid || typeof deviceUuid !== "string" || deviceUuid.trim().length < 5) {
        return res.status(400).json({ error: "Geçersiz cihaz kimliği." });
      }

      const cleanUuid = deviceUuid.trim();

      // 1. Search database for an existing user record matching this deviceUuid
      let matchedUserKey: string | null = null;
      for (const [key, record] of Object.entries(usersData)) {
        if (record && record.deviceUuid === cleanUuid) {
          matchedUserKey = key;
          break;
        }
      }

      const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();

      if (matchedUserKey) {
        // User found! Generate a new session token and return the account
        const record = usersData[matchedUserKey];
        const sessionToken = crypto.randomBytes(32).toString("hex");
        
        record.tokens = record.tokens || [];
        record.tokens.push(sessionToken);
        if (record.tokens.length > 5) {
          record.tokens.shift();
        }
        record.ipAddress = clientIp;
        record.updatedAt = new Date().toISOString();
        saveUsersData();
        console.log(`[Linguist Auth] Otomatik giriş başarılı: ${record.username || record.data?.userName || "Okur"} (IP: ${clientIp})`);

        return res.json({
          success: true,
          token: sessionToken,
          username: record.username || record.data?.userName || "Okur",
          email: record.username?.toLowerCase() || matchedUserKey,
          data: record.data || {}
        });
      } else {
        // 2. No matching user found. Automatically register a new guest account using UUID as the key!
        const guestEmail = `device-${cleanUuid.toLowerCase()}`;
        const hashedKey = hashEmail(guestEmail);
        const sessionToken = crypto.randomBytes(32).toString("hex");

        // Generate cosmetic default name (no uniqueness check needed anymore)
        const guestNumber = Math.floor(1000 + Math.random() * 9000);
        const guestName = `Okur-${guestNumber}`;

        usersData[hashedKey] = {
          username: guestName,
          password: "", // empty password for auto-login guest accounts
          tokens: [sessionToken],
          ipAddress: clientIp,
          deviceUuid: cleanUuid,
          data: {
            userName: guestName,
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
            loginProvider: "device_uuid",
            linkedProviders: ["device_uuid"]
          },
          updatedAt: new Date().toISOString()
        };

        saveUsersData();
        console.log(`[Linguist Auth] Yeni misafir kullanıcı oluşturuldu: ${guestName} (IP: ${clientIp})`);

        return res.json({
          success: true,
          token: sessionToken,
          username: guestName,
          email: guestEmail,
          data: usersData[hashedKey].data
        });
      }
    } catch (err) {
      console.error("Auto-login error:", err);
      return res.status(500).json({ error: "Otomatik giriş sırasında sunucu hatası oluştu." });
    }
  });


  // Delete account and all associated data endpoint
  app.post("/api/delete-account", (req, res) => {
    try {
      const { email } = req.body;
      if (!email || email.trim().length < 3) {
        return res.status(400).json({ error: "Geçersiz email veya kullanıcı adı." });
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedEmail = hashEmail(cleanEmail);
      const userRecord = usersData[hashedEmail];

      if (!userRecord) {
        return res.status(404).json({ error: "Kullanıcı kaydı bulunamadı." });
      }

      // Authenticate token to ensure the request is authorized
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
      const validTokens = userRecord.tokens || [];

      if (!token || !validTokens.includes(token)) {
        return res.status(401).json({ error: "Oturumunuz geçersiz veya sonlandırılmış. ⚠️" });
      }

      // Delete user record from database
      delete usersData[hashedEmail];

      // Also delete any associated guest account linked to the same deviceUuid
      if (userRecord.deviceUuid) {
        const guestEmail = `device-${userRecord.deviceUuid.toLowerCase()}`;
        const hashedGuestEmail = hashEmail(guestEmail);
        if (usersData[hashedGuestEmail]) {
          delete usersData[hashedGuestEmail];
          console.log(`[Linguist Sync] Deleted linked guest account for device: ${userRecord.deviceUuid}`);
        }
      }

      saveUsersData();

      console.log(`[Linguist Sync] Deleted user account: ${cleanEmail}`);

      return res.json({ success: true, message: "Hesap ve tüm veriler başarıyla silindi." });
    } catch (err) {
      console.error("Delete account error:", err);
      return res.status(500).json({ error: "Hesap silme işlemi sırasında sunucu hatası oluştu." });
    }
  });

  // Account Deletion Web Request endpoints for Google Play Console compatibility
  const pendingDeletions: Record<string, { code: string; expires: number; key: string }> = {};

  app.get("/delete-account-web", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İngilizce Öyküm - Hesabımı Sil</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(17, 24, 39, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-color: #f3f4f6;
            --text-muted: #9ca3af;
            --primary: #4ECDC4;
            --primary-hover: #3cacb0;
            --error: #ff6b6b;
            --success: #10b981;
            --input-bg: rgba(31, 41, 55, 0.5);
            --input-border: rgba(255, 255, 255, 0.1);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        
        body {
            background-color: var(--bg-color);
            background-image: radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.12) 0%, transparent 50%),
                              radial-gradient(circle at 100% 100%, rgba(255, 107, 107, 0.05) 0%, transparent 40%);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 480px;
            perspective: 1000px;
        }
        
        .card {
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 40px 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 100px rgba(78, 205, 196, 0.05);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 28px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            font-size: 14px;
            color: var(--text-muted);
            text-align: center;
            margin-bottom: 32px;
            line-height: 1.5;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            color: var(--primary);
        }
        
        input, select {
            width: 100%;
            padding: 14px 16px;
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            border-radius: 12px;
            color: var(--text-color);
            font-size: 15px;
            transition: all 0.3s ease;
            outline: none;
        }
        
        input:focus, select:focus {
            border-color: var(--primary);
            box-shadow: 0 0 12px rgba(78, 205, 196, 0.2);
            background: rgba(31, 41, 55, 0.8);
        }
        
        .btn {
            width: 100%;
            padding: 16px;
            background: var(--primary);
            color: #0b0f19;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
        }
        
        .btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(78, 205, 196, 0.3);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .checkbox-container {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-top: 10px;
            cursor: pointer;
        }
        
        .checkbox-container input {
            width: auto;
            margin-top: 3px;
            cursor: pointer;
        }
        
        .checkbox-label {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.4;
        }
        
        .alert {
            padding: 16px;
            border-radius: 12px;
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
            display: none;
        }
        
        .alert-error {
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.2);
            color: var(--error);
        }
        
        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: var(--success);
        }
        
        .alert-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: #60a5fa;
        }
        
        .step-hidden {
            display: none;
        }
        
        .loader {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(11, 15, 25, 0.3);
            border-top: 3px solid #0b0f19;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card" id="card">
            <h1>İngilizce Öyküm</h1>
            <p class="subtitle" id="form-subtitle">Hesabınızı ve tüm kayıtlı ilerlemelerinizi silmek için aşağıdaki formu doldurun.</p>
            
            <div id="alert-box" class="alert"></div>
            
            <!-- Step 1: Request Deletion -->
            <form id="request-form">
                <div class="form-group">
                    <label for="account-type">Hesap Türü</label>
                    <select id="account-type" required>
                        <option value="email">Google / E-posta Hesabı</option>
                        <option value="uuid">Cihaz UUID (Misafir Girişi)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="identifier" id="identifier-label">E-Posta Adresiniz</label>
                    <input type="text" id="identifier" placeholder="ornek@gmail.com" required>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" id="confirm-check" required>
                        <span class="checkbox-label">Tüm okuma istatistiklerimin, kelimelerimin ve rozetlerimin kalıcı olarak silinmesini ve bu işlemin geri alınamayacağını kabul ediyorum.</span>
                    </label>
                </div>
                
                <button type="submit" class="btn" id="submit-btn">
                    <span class="loader" id="submit-loader"></span>
                    <span id="submit-text">Silme Talebi Gönder</span>
                </button>
            </form>
            
            <!-- Step 2: Verification -->
            <form id="confirm-form" class="step-hidden">
                <div id="simulated-code-box" class="alert alert-info"></div>
                
                <div class="form-group">
                    <label for="verification-code">Doğrulama Kodu</label>
                    <input type="text" id="verification-code" placeholder="6 Haneli Kod" maxlength="6" required>
                </div>
                
                <button type="submit" class="btn" id="confirm-btn" style="background: var(--error); box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);">
                    <span class="loader" id="confirm-loader"></span>
                    <span id="confirm-text" style="color: #ffffff;">Hesabı Kalıcı Olarak Sil</span>
                </button>
            </form>
            
            <!-- Step 3: Success -->
            <div id="success-screen" class="step-hidden" style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 24px;">🎉</div>
                <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; margin-bottom: 12px; color: var(--success);">Hesabınız Başarıyla Silindi</h2>
                <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Hesabınız, istatistikleriniz ve tüm kişisel verileriniz sunucumuzdan kalıcı olarak kaldırılmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.</p>
                <a href="/" style="display: inline-block; padding: 14px 28px; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: var(--text-color); text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">Ana Sayfaya Git</a>
            </div>
        </div>
    </div>

    <script>
        const accountTypeSelect = document.getElementById('account-type');
        const identifierLabel = document.getElementById('identifier-label');
        const identifierInput = document.getElementById('identifier');
        const requestForm = document.getElementById('request-form');
        const confirmForm = document.getElementById('confirm-form');
        const successScreen = document.getElementById('success-screen');
        const alertBox = document.getElementById('alert-box');
        const card = document.getElementById('card');
        const formSubtitle = document.getElementById('form-subtitle');
        const simulatedCodeBox = document.getElementById('simulated-code-box');
        
        let savedIdentifier = '';
        
        function showAlert(message, type) {
            alertBox.style.display = 'block';
            alertBox.className = 'alert ' + (type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info');
            alertBox.innerText = message;
        }
        
        function hideAlert() {
            alertBox.style.display = 'none';
        }
        
        accountTypeSelect.addEventListener('change', () => {
            if (accountTypeSelect.value === 'email') {
                identifierLabel.innerText = 'E-Posta Adresiniz';
                identifierInput.placeholder = 'ornek@gmail.com';
                identifierInput.type = 'email';
            } else {
                identifierLabel.innerText = 'Cihaz UUID (Cihaz Kimliği)';
                identifierInput.placeholder = 'Cihaz kimliğini profil sayfasından kopyalayabilirsiniz';
                identifierInput.type = 'text';
            }
        });
        
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            const submitBtn = document.getElementById('submit-btn');
            const submitLoader = document.getElementById('submit-loader');
            const submitText = document.getElementById('submit-text');
            
            submitBtn.disabled = true;
            submitLoader.style.display = 'inline-block';
            submitText.innerText = 'İşleniyor...';
            
            const identifier = identifierInput.value.trim();
            const accountType = accountTypeSelect.value;
            
            try {
                const response = await fetch('/api/delete-account-web-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, accountType })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'İstek gönderilirken bir hata oluştu.');
                }
                
                savedIdentifier = identifier;
                
                if (data.requiresVerification) {
                    // Show step 2
                    requestForm.className = 'step-hidden';
                    confirmForm.className = '';
                    formSubtitle.innerText = 'Doğrulama kodunu girerek silme işlemini onaylayın.';
                    
                    if (data.simulatedCode) {
                        simulatedCodeBox.style.display = 'block';
                        simulatedCodeBox.innerHTML = '⚠️ <strong>Test Modu:</strong> Doğrulama kodunuz: <strong style="font-size: 16px; color: #ffffff;">' + data.simulatedCode + '</strong>';
                    } else {
                        simulatedCodeBox.style.display = 'none';
                    }
                } else {
                    // Directly successful
                    requestForm.className = 'step-hidden';
                    successScreen.className = '';
                    formSubtitle.style.display = 'none';
                }
            } catch (err) {
                showAlert(err.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitLoader.style.display = 'none';
                submitText.innerText = 'Silme Talebi Gönder';
            }
        });
        
        confirmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert();
            
            const confirmBtn = document.getElementById('confirm-btn');
            const confirmLoader = document.getElementById('confirm-loader');
            const confirmText = document.getElementById('confirm-text');
            
            confirmBtn.disabled = true;
            confirmLoader.style.display = 'inline-block';
            confirmText.innerText = 'Hesap Siliniyor...';
            
            const code = document.getElementById('verification-code').value.trim();
            
            try {
                const response = await fetch('/api/delete-account-web-confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: savedIdentifier, code })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Kod doğrulanamadı.');
                }
                
                confirmForm.className = 'step-hidden';
                successScreen.className = '';
                formSubtitle.style.display = 'none';
                simulatedCodeBox.style.display = 'none';
            } catch (err) {
                showAlert(err.message, 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmLoader.style.display = 'none';
                confirmText.innerText = 'Hesabı Kalıcı Olarak Sil';
            }
        });
    </script>
</body>
</html>
    `);
  });

  // Helper to find account database key by various inputs
  function findUserKey(input: string): string | null {
    const cleanInput = input.trim().toLowerCase();
    
    // 1. Check direct hash (e.g. if input is username or email)
    const hashedEmail = hashEmail(cleanInput);
    if (usersData[hashedEmail]) {
      return hashedEmail;
    }
    
    // 2. Check if input is a device UUID
    const deviceEmail = `device-${cleanInput}`;
    const hashedDeviceEmail = hashEmail(deviceEmail);
    if (usersData[hashedDeviceEmail]) {
      return hashedDeviceEmail;
    }
    
    // 3. Search by record properties (fallback)
    for (const [key, record] of Object.entries(usersData)) {
      if (record) {
        if (record.deviceUuid && record.deviceUuid.toLowerCase() === cleanInput) {
          return key;
        }
        if (record.username && record.username.toLowerCase() === cleanInput) {
          return key;
        }
      }
    }
    
    return null;
  }

  // Handle deletion request (generates verification code)
  app.post("/api/delete-account-web-request", (req, res) => {
    try {
      const { identifier, accountType } = req.body;
      if (!identifier || typeof identifier !== "string" || identifier.trim().length < 3) {
        return res.status(400).json({ error: "Lütfen geçerli bir e-posta adresi veya cihaz kimliği girin." });
      }

      const cleanIdentifier = identifier.trim();
      const userKey = findUserKey(cleanIdentifier);

      if (!userKey) {
        return res.status(404).json({ error: "Belirtilen bilgilere ait bir kullanıcı kaydı bulunamadı. Lütfen kontrol edip tekrar deneyin." });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      pendingDeletions[cleanIdentifier.toLowerCase()] = { code, expires, key: userKey };

      // If it's a device UUID, we can just display the code on the screen directly since the UUID itself is proof of access.
      const isUuid = accountType === "uuid" || !cleanIdentifier.includes("@");
      
      if (isUuid) {
        return res.json({
          success: true,
          requiresVerification: true,
          simulatedCode: code // Display code on screen
        });
      }

      // If email, send confirmation code
      const emailContent = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e5; border-radius: 12px;">
          <h2 style="color: #ff6b6b; margin-top: 0;">Hesap Silme Onayı</h2>
          <p>Merhaba,</p>
          <p>İngilizce Öyküm hesabınızı ve tüm verilerinizi kalıcı olarak silmek için bir talepte bulundunuz.</p>
          <p>Silme işlemini onaylamak için kullanacağınız tek kullanımlık doğrulama kodunuz:</p>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; margin: 20px 0; color: #2d3436; border: 1px solid #eee;">
            ${code}
          </div>
          <p style="color: #6c757d; font-size: 13px;">Bu kod 10 dakika süreyle geçerlidir. Talebi siz yapmadıysanız bu e-postayı dikkate almayınız.</p>
        </div>
      `;

      if (transporter) {
        const mailOptions = {
          from: '"İngilizce Öyküm" <' + smtpFrom + '>',
          to: cleanIdentifier.toLowerCase(),
          subject: "Hesap Silme Doğrulama Kodu ⚠️",
          html: emailContent
        };

        transporter.sendMail(mailOptions, (error: any) => {
          if (error) {
            console.error(`[Mail] Error sending deletion code to ${cleanIdentifier}:`, error);
            // Fallback: return code on screen if mail delivery fails
            return res.json({
              success: true,
              requiresVerification: true,
              simulatedCode: code
            });
          }
          return res.json({ success: true, requiresVerification: true });
        });
      } else {
        // Fallback for local testing (No SMTP configured)
        console.log(`[Simulated Mail] Deletion verification code for ${cleanIdentifier}: ${code}`);
        return res.json({
          success: true,
          requiresVerification: true,
          simulatedCode: code
        });
      }
    } catch (err: any) {
      console.error("Delete web request error:", err);
      return res.status(500).json({ error: "İşlem sırasında sunucu hatası oluştu." });
    }
  });

  // Verify and confirm deletion
  app.post("/api/delete-account-web-confirm", (req, res) => {
    try {
      const { identifier, code } = req.body;
      if (!identifier || !code) {
        return res.status(400).json({ error: "Eksik parametreler." });
      }

      const cleanIdentifier = identifier.trim().toLowerCase();
      const pending = pendingDeletions[cleanIdentifier];

      if (!pending || Date.now() > pending.expires) {
        return res.status(400).json({ error: "Silme talebiniz bulunamadı veya süresi dolmuş. Lütfen sayfayı yenileyip tekrar talep gönderin." });
      }

      if (pending.code !== code.trim()) {
        return res.status(400).json({ error: "Girdiğiniz doğrulama kodu hatalı. Lütfen kontrol edip tekrar deneyin." });
      }

      // Perform deletion
      const userRecord = usersData[pending.key];
      if (userRecord && userRecord.deviceUuid) {
        const guestEmail = `device-${userRecord.deviceUuid.toLowerCase()}`;
        const hashedGuestEmail = hashEmail(guestEmail);
        if (usersData[hashedGuestEmail]) {
          delete usersData[hashedGuestEmail];
          console.log(`[Linguist Sync] Deleted linked guest account for device: ${userRecord.deviceUuid}`);
        }
      }

      delete usersData[pending.key];
      saveUsersData();
      delete pendingDeletions[cleanIdentifier];

      console.log(`[Linguist Sync] Permanent account deletion via Web request: ${pending.key}`);
      return res.json({ success: true, message: "Hesabınız ve tüm verileriniz başarıyla silindi." });
    } catch (err) {
      console.error("Delete web confirm error:", err);
      return res.status(500).json({ error: "Onaylama işlemi sırasında sunucu hatası oluştu." });
    }
  });

  // Sync endpoint - Save progress
  app.post("/api/sync", (req, res) => {
    const { email, data } = req.body;
    if (!email || email.trim().length < 3) {
      return res.status(400).json({ error: "Geçersiz email veya kullanıcı adı." });
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
      console.log(`[Linguist Sync] İlerleme başarıyla kaydedildi: ${userRecord.username || cleanEmail}`);
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
    if (typeof email !== "string" || email.trim().length < 3) {
      return res.status(400).json({ error: "Geçersiz email veya kullanıcı adı." });
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
    
    console.log(`[Linguist Sync] İlerleme başarıyla çekildi: ${userRecord.username || cleanEmail}`);
    return res.json({ found: true, data: userRecord.data });
  });

  // Auth endpoint - Register or login user with password or token
  app.post("/api/auth", (req, res) => {
    try {
      const { email, password, token, provider, isExternal, name, deviceUuid } = req.body;
      if (!email || email.trim().length < 3) {
        return res.status(400).json({ error: "Geçersiz e-posta veya kullanıcı adı. ⚠️" });
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedEmail = hashEmail(cleanEmail);
      let userRecord = usersData[hashedEmail];

      // Case 1: Token verification (auto-login/linking)
      if (token) {
        if (!userRecord || !userRecord.tokens || !userRecord.tokens.includes(token)) {
          return res.status(401).json({ error: "Kayıtlı oturum anahtarı geçersiz veya süresi dolmuş. ⚠️" });
        }
        if (deviceUuid && !userRecord.deviceUuid) {
          userRecord.deviceUuid = deviceUuid.trim();
          saveUsersData();
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
            deviceUuid: deviceUuid ? deviceUuid.trim() : "",
            data: {},
            updatedAt: new Date().toISOString()
          };
          saveUsersData();
          console.log(`[Linguist Auth] Yeni harici hesap oluşturuldu (Google/FB): ${cleanEmail}`);
          
          sendLoginNotificationEmail(cleanEmail, name || cleanEmail.split("@")[0], provider || "google");
          
          return res.json({ success: true, token: sessionToken, isNew: true, message: "Yeni hesap başarıyla oluşturuldu." });
        } else {
          // Initialize tokens array if it doesn't exist
          userRecord.tokens = userRecord.tokens || [];
          userRecord.tokens.push(sessionToken);
          if (userRecord.tokens.length > 5) {
            userRecord.tokens.shift();
          }
          if (deviceUuid) {
            userRecord.deviceUuid = deviceUuid.trim();
          }
          userRecord.updatedAt = new Date().toISOString();
          saveUsersData();
          console.log(`[Linguist Auth] Harici giriş başarılı: ${cleanEmail}`);
          
          sendLoginNotificationEmail(cleanEmail, name || cleanEmail.split("@")[0], provider || "google");
          
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
          deviceUuid: deviceUuid ? deviceUuid.trim() : "",
          data: {},
          updatedAt: new Date().toISOString()
        };
        saveUsersData();
        console.log(`[Linguist Auth] Yeni e-posta hesabı oluşturuldu: ${cleanEmail}`);
        
        sendLoginNotificationEmail(cleanEmail, name || cleanEmail.split("@")[0], provider || "email");
        
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
        if (deviceUuid) {
          userRecord.deviceUuid = deviceUuid.trim();
        }
        userRecord.updatedAt = new Date().toISOString();
        saveUsersData();
        console.log(`[Linguist Auth] E-posta/Şifre ile giriş başarılı: ${cleanEmail}`);

        sendLoginNotificationEmail(cleanEmail, name || cleanEmail.split("@")[0], provider || "email");

        return res.json({ success: true, token: sessionToken, isNew: false, message: "Giriş başarılı." });
      }
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(500).json({ error: "Kimlik doğrulaması sırasında sunucu hatası oluştu." });
    }
  });

  app.post("/api/register", (req, res) => {
    try {
      const { username, password, deviceUuid } = req.body;
      if (!username || typeof username !== "string") {
        return res.status(400).json({ error: "Lütfen geçerli bir isim girin. ⚠️" });
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
      if (checkIsProfane(cleanUsername)) {
        return res.status(400).json({ error: "Kullanıcı adı uygunsuz veya sistem tarafından ayrılmış kelimeler içeremez. ⚠️" });
      }

      // Generate the unique hash key for this username
      const hashedKey = hashEmail(lowerUsername);

      // Check if username is already taken
      const usernameExists = Object.values(usersData).some(user => 
        user && user.username && user.username.toLowerCase() === lowerUsername
      ) || !!usersData[hashedKey];

      if (usernameExists) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten başka bir üye tarafından alınmış. ⚠️" });
      }

      // Record client IP Address
      const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();

      const sessionToken = crypto.randomBytes(32).toString("hex");

      // Save user record
      usersData[hashedKey] = {
        username: cleanUsername,
        password: hashPassword(password),
        tokens: [sessionToken],
        ipAddress: clientIp,
        deviceUuid: deviceUuid ? deviceUuid.trim() : "",
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
          loginProvider: "username",
          linkedProviders: ["username"]
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

  // Serve public directory statically
  app.use("/public", express.static(path.join(process.cwd(), "public")));

  // Serve daily Instagram image statically
  app.get("/api/instagram/daily-post.png", (req, res) => {
    const imagePath = path.join(process.cwd(), "public", "daily-instagram-post.png");
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send("Daily card image not generated yet. Trigger it first.");
    }
  });

  // Serve daily Instagram story page image statically
  app.get("/api/instagram/daily-story.png", (req, res) => {
    const imagePath = path.join(process.cwd(), "public", "daily-instagram-story.png");
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send("Daily story image not generated yet. Trigger it first.");
    }
  });

  // Manual Trigger Endpoint for Daily Post (Supports ?type=promo or ?type=word)
  app.post("/api/instagram/trigger-post", async (req, res) => {
    console.log("[Server API] trigger-post hit but endpoint is DISABLED.");
    return res.status(403).json({ error: "Trigger post endpoint is disabled." });
  });

  // Manual Trigger Endpoint for Daily Reel
  app.post("/api/instagram/trigger-reel", async (req, res) => {
    console.log("[Server API] trigger-reel hit but endpoint is DISABLED.");
    return res.status(403).json({ error: "Trigger reel endpoint is disabled." });
  });

  // Preview Endpoint (generates a live card without publishing)
  app.get("/api/instagram/preview", async (req, res) => {
    try {
      const wordInfo = await fetchDailyWordFromGemini();
      const previewPath = path.join(process.cwd(), "public", "preview-instagram-post.png");
      await saveDailyWordCardImage(wordInfo, previewPath);
      res.sendFile(previewPath);
    } catch (err: any) {
      res.status(500).send(`Önizleme görseli oluşturulamadı: ${err.message}`);
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Google Play Store App Redirection
  app.get("/indir", (req, res) => {
    res.redirect("https://play.google.com/store/apps/details?id=com.ingilizceoykum.app");
  });

  app.get("/app", (req, res) => {
    res.redirect("https://play.google.com/store/apps/details?id=com.ingilizceoykum.app");
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
