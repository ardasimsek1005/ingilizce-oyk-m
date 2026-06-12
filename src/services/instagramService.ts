import sharp from "sharp";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

// Interface for word structure
export interface InstagramWordInfo {
  word: string;
  translation: string;
  level: string;
  explanation: string;
  exampleEn: string;
  exampleTr: string;
}

// Fallback high-quality vocabulary words in case Gemini API is down/overloaded
const FALLBACK_WORDS: InstagramWordInfo[] = [
  {
    word: "Resilient",
    translation: "dirençli, kendini çabuk toparlayan",
    level: "B2",
    explanation: "Zor durumlar karşısında hızlıca eski haline dönebilen ve pes etmeyen.",
    exampleEn: "She is highly resilient and always recovers quickly from life's setbacks.",
    exampleTr: "O son derece dirençlidir ve hayatın aksiliklerinden sonra her zaman çabucak toparlanır."
  },
  {
    word: "Inevitable",
    translation: "kaçınılmaz",
    level: "B2",
    explanation: "Gerçekleşmesi kesin olan, engellenemez durum.",
    exampleEn: "Change is an inevitable part of career growth and progress.",
    exampleTr: "Değişim, kariyer gelişiminin ve ilerlemenin kaçınılmaz bir parçasıdır."
  },
  {
    word: "Scrutinize",
    translation: "dikkatle incelemek",
    level: "C1",
    explanation: "Bir şeyi çok titiz, ayrıntılı ve dikkatli bir biçimde gözden geçirmek.",
    exampleEn: "The lawyers had to scrutinize every detail of the agreement.",
    exampleTr: "Avukatlar anlaşmanın her detayını dikkatle incelemek zorunda kaldı."
  },
  {
    word: "Adversity",
    translation: "sıkıntı, zorluk, talihsizlik",
    level: "C1",
    explanation: "Yaşam boyu karşılaşılan büyük güçlükler ve şanssız durumlar.",
    exampleEn: "He showed great courage and strength in the face of adversity.",
    exampleTr: "Zorluklar karşısında büyük bir cesaret ve güç gösterdi."
  },
  {
    word: "Diligent",
    translation: "çalışkan, gayretli, özenli",
    level: "B1",
    explanation: "İşini büyük bir dikkat, kararlılık ve özenle yapan kimse.",
    exampleEn: "A diligent student will always review notes after class.",
    exampleTr: "Çalışkan bir öğrenci dersten sonra her zaman notlarını gözden geçirir."
  },
  {
    word: "Relentless",
    translation: "amansız, kararlı, dur durak bilmeyen",
    level: "B2",
    explanation: "Hızı kesilmeyen, pes etmeden kararlılıkla devam eden.",
    exampleEn: "Their relentless efforts eventually led to a major scientific breakthrough.",
    exampleTr: "Dur durak bilmeyen çabaları sonunda büyük bir bilimsel buluşa yol açtı."
  },
  {
    word: "Ambiguous",
    translation: "belirsiz, çift anlamlı",
    level: "C1",
    explanation: "Birden fazla şekilde yorumlanabilen, netliği olmayan durum.",
    exampleEn: "The feedback we received from the client was slightly ambiguous.",
    exampleTr: "Müşteriden aldığımız geri bildirim biraz belirsizdi."
  },
  {
    word: "Meticulous",
    translation: "titiz, aşırı özenli",
    level: "B2",
    explanation: "Her ayrıntıya son derece dikkat eden, özen gösteren.",
    exampleEn: "The researcher kept meticulous records of all the experiments.",
    exampleTr: "Araştırmacı, tüm deneylerin titiz kayıtlarını tuttu."
  }
];

// Simple text wrapping helper
function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += " " + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines;
}

// Generates the SVG card string with standard sans-serif system fonts
function getCardSvg(wordInfo: InstagramWordInfo): string {
  const { word, translation, level, explanation, exampleEn, exampleTr } = wordInfo;
  
  // Clean CEFR level string
  const cleanLevel = (level || "B1").toUpperCase().trim();
  
  // Select color for level badge
  let levelColor = "#22C55E"; // green for A1/A2
  if (cleanLevel.startsWith("B1")) levelColor = "#EAB308"; // amber
  if (cleanLevel.startsWith("B2")) levelColor = "#F97316"; // orange
  if (cleanLevel.startsWith("C1")) levelColor = "#EF4444"; // red
  if (cleanLevel.startsWith("C2")) levelColor = "#B91C1C"; // crimson

  // Wrap text fields
  const explanationLines = wrapText(explanation, 65);
  const exampleEnLines = wrapText(exampleEn, 60);
  const exampleTrLines = wrapText(exampleTr, 62);

  let explanationSvg = "";
  explanationLines.forEach((line, idx) => {
    explanationSvg += `<text x="540" y="${490 + (idx * 30)}" font-family="'Segoe UI', -apple-system, sans-serif" font-size="18" fill="rgba(255,255,255,0.6)" font-style="italic" text-anchor="middle">${line}</text>\n`;
  });

  let exampleEnSvg = "";
  exampleEnLines.forEach((line, idx) => {
    exampleEnSvg += `<text x="540" y="${770 + (idx * 36)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="600" font-size="24" fill="#FFFFFF" text-anchor="middle">"${line}"</text>\n`;
  });

  let exampleTrSvg = "";
  exampleTrLines.forEach((line, idx) => {
    exampleTrSvg += `<text x="540" y="${860 + (idx * 30)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="500" font-size="19" fill="#FF6B6B" text-anchor="middle">"${line}"</text>\n`;
  });

  return `
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0b0a12;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#141124;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d1233;stop-opacity:1" />
        </linearGradient>
        
        <!-- Glowing background blobs -->
        <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="130" result="blur" />
        </filter>
      </defs>
      
      <!-- Base Background -->
      <rect width="1080" height="1080" fill="url(#bg-grad)" />
      
      <!-- Glowing colorful background blobs (Glassmorphism aura) -->
      <circle cx="850" cy="250" r="250" fill="#FF6B6B" opacity="0.12" filter="url(#glow-blur)" />
      <circle cx="200" cy="850" r="280" fill="#4ECDC4" opacity="0.12" filter="url(#glow-blur)" />
      
      <!-- Card Container (Glassmorphism look) -->
      <rect x="80" y="80" width="920" height="920" rx="40" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.07)" stroke-width="2" />
      
      <!-- Header Area -->
      <text x="120" y="145" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="24" fill="#4ECDC4" letter-spacing="2">İNGİLİZCE ÖYKÜM</text>
      <text x="385" y="145" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="bold" font-size="14" fill="rgba(255,255,255,0.4)" letter-spacing="1">|  GÜNÜN KELİMESİ</text>
      
      <rect x="760" y="117" width="160" height="32" rx="16" fill="rgba(255,107,107,0.1)" stroke="rgba(255,107,107,0.2)" stroke-width="1" />
      <text x="840" y="137" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="11" fill="#FF6B6B" text-anchor="middle" dominant-baseline="middle">GÜNLÜK PAYLAŞIM</text>

      <!-- Main Vocabulary Content -->
      <!-- English Word -->
      <text x="540" y="270" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="72" fill="#FFFFFF" text-anchor="middle" letter-spacing="-2">${word}</text>
      
      <!-- Level Badge -->
      <rect x="470" y="295" width="140" height="30" rx="15" fill="${levelColor}15" stroke="${levelColor}30" stroke-width="1" />
      <text x="540" y="314" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="12" fill="${levelColor}" text-anchor="middle" dominant-baseline="middle">${cleanLevel} SEVİYESİ</text>
      
      <!-- Turkish Translation -->
      <text x="540" y="420" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="36" fill="#FFE66D" text-anchor="middle">${translation}</text>
      
      <!-- Brief Definition -->
      ${explanationSvg}
      
      <!-- Divider Line -->
      <line x1="200" y1="675" x2="880" y2="675" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
      
      <!-- Example Sentence Area -->
      <text x="540" y="720" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="14" fill="rgba(255, 255, 255, 0.3)" letter-spacing="2" text-anchor="middle">ÖRNEK CÜMLE • EXAMPLE SENTENCE</text>
      
      <!-- English Example -->
      ${exampleEnSvg}
      
      <!-- Turkish Example -->
      ${exampleTrSvg}
      
      <!-- Footer Area -->
      <line x1="120" y1="940" x2="960" y2="940" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      <text x="120" y="970" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.25)">ingilizceoykum.com</text>
      <text x="960" y="970" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.25)" text-anchor="end">App Store &amp; Play Store'da Ücretsiz İndirin! 📚</text>
    </svg>
  `;
}

// Fetches word info from Gemini or falls back to standard array
export async function fetchDailyWordFromGemini(): Promise<InstagramWordInfo> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[Instagram Service] GEMINI_API_KEY missing, using local fallback vocabulary.");
    return getRandomFallbackWord();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const sysInstruction = `You are an English language teacher and social media content creator.
Your job is to select an interesting, useful, and slightly advanced English vocabulary word (CEFR levels B1, B2, or C1) for Turkish learners.
The word should be commonly used, practical, but not overly basic (avoid words like 'apple', 'go', 'happy').

Generate a JSON object matching this schema exactly:
- word: The English word (e.g. "relentless").
- translation: The Turkish translation (e.g. "amansız, acımasız, dur durak bilmeyen").
- level: The CEFR level (B1, B2, or C1).
- explanation: A brief Turkish definition under 12 words (e.g. "Kararlılıkla devam eden, pes etmeyen veya hızı kesilmeyen.").
- exampleEn: A natural example sentence in English using this word.
- exampleTr: The natural Turkish translation of the example sentence.

Return a valid JSON output matching the requested schema exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate a Word of the Day vocabulary card details for intermediate/advanced learners.",
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            translation: { type: Type.STRING },
            level: { type: Type.STRING },
            explanation: { type: Type.STRING },
            exampleEn: { type: Type.STRING },
            exampleTr: { type: Type.STRING }
          },
          required: ["word", "translation", "level", "explanation", "exampleEn", "exampleTr"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    console.log(`[Instagram Service] Word fetched from Gemini successfully: ${result.word}`);
    return result;
  } catch (err) {
    console.error("[Instagram Service] Failed to fetch daily word from Gemini, using local fallback:", err);
    return getRandomFallbackWord();
  }
}

function getRandomFallbackWord(): InstagramWordInfo {
  const randomIndex = Math.floor(Math.random() * FALLBACK_WORDS.length);
  return FALLBACK_WORDS[randomIndex];
}

// Renders the SVG image to local PNG file using sharp
export async function saveDailyWordCardImage(wordInfo: InstagramWordInfo, outputPath: string): Promise<void> {
  const svgString = getCardSvg(wordInfo);
  
  // Ensure output folder exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await sharp(Buffer.from(svgString))
    .png()
    .toFile(outputPath);
    
  console.log(`[Instagram Service] Successfully saved daily word card image to: ${outputPath}`);
}

// Publishes image to Instagram account via Facebook Graph API
export async function publishToInstagramDirectly(imageUrl: string, caption: string): Promise<string> {
  const instagramId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!instagramId || !pageToken) {
    throw new Error("Instagram configuration parameters missing from environment variables (.env).");
  }

  console.log(`[Instagram Service] Initiating media container creation for: ${imageUrl}`);
  const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
  
  const containerRes = await fetch(containerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption,
      access_token: pageToken
    })
  });

  const containerData = await containerRes.json();
  if (containerData.error) {
    console.error("[Instagram Service] Media container creation failed:", containerData.error);
    throw new Error(`Instagram container error: ${containerData.error.message}`);
  }

  const containerId = containerData.id;
  console.log(`[Instagram Service] Container created successfully. ID: ${containerId}. Waiting 10 seconds for Instagram processing...`);
  
  // Wait for 10 seconds to allow Meta to download and process the image
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("[Instagram Service] Publishing media container...");
  const publishUrl = `https://graph.facebook.com/v20.0/${instagramId}/media_publish`;
  
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: pageToken
    })
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    console.error("[Instagram Service] Media publication failed:", publishData.error);
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  console.log(`[Instagram Service] Post published successfully! Media ID: ${publishData.id}`);
  return publishData.id;
}

// Main runner flow
export async function runDailyInstagramFlow(): Promise<{ success: boolean; word?: string; postId?: string; error?: string }> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const imagePath = path.join(publicDir, "daily-instagram-post.png");
    
    // 1. Fetch word
    const wordInfo = await fetchDailyWordFromGemini();
    
    // 2. Generate and save card image
    await saveDailyWordCardImage(wordInfo, imagePath);

    // 3. Get server public URL
    const serverUrl = process.env.SERVER_PUBLIC_URL || "https://ingilizce-oyk-m.onrender.com";
    const imageUrl = `${serverUrl}/api/instagram/daily-post.png`;

    // 4. Construct Instagram Caption
    const caption = `Günün İngilizce Kelimesi: ${wordInfo.word} (${wordInfo.level} Seviyesi)\n\n` + 
                    `💡 Anlamı: ${wordInfo.translation}\n` +
                    `📝 Tanım: ${wordInfo.explanation}\n\n` +
                    `📖 Örnek Cümle:\n` +
                    `"${wordInfo.exampleEn}"\n` +
                    `👉 Çevirisi:\n` +
                    `"${wordInfo.exampleTr}"\n\n` +
                    `📚 İngilizce Öyküm ile her gün yeni bir kelime öğren ve hikayelerle dilini geliştir! Detaylar profilimizdeki linkte.\n\n` +
                    `#ingilizce #ingilizcekelime #ingilizceogren #ingilizceöğreniyorum #ingilizceogreniyorum #gununkelimesi #yokdil #yds #ingilizceoykum`;

    // 5. Post to Instagram
    const postId = await publishToInstagramDirectly(imageUrl, caption);

    // 6. Log success metadata
    const logEntry = `[${new Date().toISOString()}] Posted word "${wordInfo.word}" to Instagram. Post ID: ${postId}\n`;
    fs.appendFileSync(path.join(process.cwd(), "instagram_posts.log"), logEntry, "utf8");

    return { success: true, word: wordInfo.word, postId };
  } catch (err: any) {
    console.error("[Instagram Service] Unhandled error during flow execution:", err);
    try {
      fs.appendFileSync(path.join(process.cwd(), "instagram_posts.log"), `[${new Date().toISOString()}] Error: ${err.message}\n`, "utf8");
    } catch {}
    return { success: false, error: err.message };
  }
}
