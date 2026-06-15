import sharp from "sharp";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

const FALLBACK_INSTAGRAM_BUSINESS_ACCOUNT_ID = "17841475472601731";
const FALLBACK_FACEBOOK_PAGE_ACCESS_TOKEN = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

// Interface for word structure
export interface InstagramWordInfo {
  word: string;
  translation: string;
  level: string;
  explanation: string;
  exampleEn: string;
  exampleTr: string;
}

// Interface for promotion templates
export interface PromoTemplate {
  title: string;
  highlight: string;
  subtitle: string;
  featurePoint: string;
  gradStart: string;
  gradEnd: string;
  caption: string;
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
  const instagramId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || FALLBACK_INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || FALLBACK_FACEBOOK_PAGE_ACCESS_TOKEN;

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

export async function publishToFacebookDirectly(imageUrl: string, caption: string): Promise<string> {
  const fbPageId = "1217495374774391";
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || FALLBACK_FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!fbPageId || !pageToken) {
    throw new Error("Facebook configuration parameters missing from environment variables.");
  }

  console.log(`[Facebook Service] Initiating photo upload for: ${imageUrl}`);
  const fbPhotoUrl = `https://graph.facebook.com/v20.0/${fbPageId}/photos`;
  const fbRes = await fetch(fbPhotoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl,
      caption: caption,
      access_token: pageToken
    })
  });

  const fbData = await fbRes.json();
  if (fbData.error) {
    console.error("[Facebook Service] Publication failed:", fbData.error);
    throw new Error(`Facebook publish error: ${fbData.error.message}`);
  }

  const postId = fbData.id || fbData.post_id;
  console.log(`[Facebook Service] Page post published successfully! Post ID: ${postId}`);
  return postId;
}

export const PROMO_TEMPLATES: PromoTemplate[] = [
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "KELİMENİN ANLAMINI GÖRME 📖",
    subtitle: "Bilinmeyen Kelimelere Dokun ve Öğren",
    featurePoint: "Dokunduğun her kelimenin Türkçe karşılığı anında karşında!",
    gradStart: "#8B5CF6",
    gradEnd: "#3B82F6",
    caption: `📖 KELİMENİN ANLAMINI GÖRME 📖\n\nHikaye okurken bilmediğiniz bir kelimeyle mi karşılaştınız? Sözlüğe bakmak için okumanızı bölmenize gerek yok! 💡\n\nİngilizce Öyküm'de bilinmeyen kelimelerin üzerine dokunarak Türkçe anlamlarını anında görebilir ve akıcı bir şekilde okumaya devam edebilirsiniz. 🚀\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #dilogrenimi #ingilizcekelime #playstore #googleplay #educationapp`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "DİNLEME PRATİĞİ 🔊",
    subtitle: "Ana Dili Konuşanlardan Akıcı Dinleme",
    featurePoint: "Okurken aynı zamanda doğru telaffuzları dinleyin.",
    gradStart: "#A855F7",
    gradEnd: "#6366F1",
    caption: `🔊 DİNLEME PRATİĞİ! 🔊\n\nİngilizceyi okumanın yanı sıra dinleyerek de pekiştirin! 🗣️\n\nİngilizce Öyküm'deki hikayeleri seslendirmeler eşliğinde dinleyebilir, kelimelerin doğru telaffuzlarını öğrenebilir ve kulak aşinalığı kazanabilirsiniz. 🚀\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #playstore #googleplay #educationapp`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "ZENGİN KÜTÜPHANE 📚",
    subtitle: "Her Seviyeye Uygun Yüzlerce Hikaye",
    featurePoint: "Dünya klasiklerinden macera ve gizem dolu öykülere.",
    gradStart: "#D946EF",
    gradEnd: "#7C3AED",
    caption: `📚 ZENGİN KÜTÜPHANE! 📚\n\nDünya Klasikleri, Korku, Gizem ve Günlük Yaşam gibi kategorilerde yüzlerce hikaye sizi bekliyor. A1'den C1 seviyesine kadar size en uygun hikayeyi seçin ve İngilizce okuma becerilerinizi geliştirin! 🚀\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #playstore #googleplay #educationapp`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "İNTERAKTİF TESTLER ✏️",
    subtitle: "Her Hikaye Sonunda Anlama Quizleri",
    featurePoint: "Okuduklarınızı pekiştirecek eğlenceli testler.",
    gradStart: "#2563EB",
    gradEnd: "#7C3AED",
    caption: `✏️ İNTERAKTİF QUİZLER! ✏️\n\nHikayeyi okuduktan sonra kendinizi test etmeye ne dersiniz? 🤔\n\nİngilizce Öyküm'de her hikayenin sonunda yer alan kelime ve okuduğunu anlama testleri ile öğrendiklerinizi pekiştirebilir, gelişiminizi anlık olarak takip edebilirsiniz! 🚀\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #playstore #googleplay #educationapp`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "KİŞİSEL SÖZLÜK 🗂️",
    subtitle: "Zorlandığın Kelimeleri Kaydet ve Çalış",
    featurePoint: "Kendi kelime listeni oluştur, dilediğin zaman tekrar et.",
    gradStart: "#6D28D9",
    gradEnd: "#0EA5E9",
    caption: `🗂️ KİŞİSEL KELİME DEFTERİNİZ! 🗂️\n\nOkurken bilmediğiniz kelimeleri tek dokunuşla kişisel sözlüğünüze ekleyin, daha sonra dilediğiniz zaman tekrar ederek kelime dağarcığınızı kalıcı hale getirin. 🚀\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #playstore #googleplay #educationapp`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "12 FARKLI DİL DESTEĞİ 🌍",
    subtitle: "Sözlük ve Çeviriler Kendi Dilinizde",
    featurePoint: "Türkçe dahil 12 dil seçeneğiyle kelime öğrenimi.",
    gradStart: "#4F46E5",
    gradEnd: "#C084FC",
    caption: `🌍 12 DİL DESTEĞİ! 🌍\n\nİngilizce hikayeleri okurken bilinmeyen kelimelerin üzerine dokunup kendi dilinizde anında öğrenin. Arayüz ve sözlük desteğimiz tam 12 farklı dilde hizmetinizde!\n\nUygulamamız çok yakında Google Play Store'da yayında! 📲\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #dilogrenimi #playstore #googleplay #multilingual #educationapp #languagelearning`
  },
  {
    title: "İNGİLİZCE ÖYKÜM",
    highlight: "YAKINDA PLAY STORE'DA! 📲",
    subtitle: "Hikayelerle İngilizceyi Akıcı Öğrenin",
    featurePoint: "Uygulamamız çok yakında Google Play Store'da yayında!",
    gradStart: "#7C3AED",
    gradEnd: "#8B5CF6",
    caption: `📲 HİKAYELERLE İNGİLİZCE ÖĞRENİN! 📲\n\nİngilizce Öyküm ile İngilizce öğrenmek artık çok daha kolay ve akıcı! 🎉\n\nUygulamamız çok yakında Google Play Store'da yayında olacaktır. Gelişmeleri kaçırmamak için bizi takip edin! 🚀\n\n#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcehikayeler #playstore #googleplay #educationapp`
  }
];

export function getPromoCardSvg(promo: PromoTemplate): string {
  return `
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
      <!-- Premium Glassmorphic Bottom Card Container -->
      <rect x="80" y="740" width="920" height="260" rx="36" fill="rgba(14, 8, 30, 0.9)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2" />
      
      <!-- Logo is at x=120, y=780, width=180, height=180 -->
      
      <!-- Text Block on the right side -->
      <text x="340" y="835" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF">${promo.highlight}</text>
      <text x="340" y="890" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="22" fill="#C7D2FE">${promo.subtitle}</text>
      <text x="340" y="940" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="13" fill="rgba(255, 255, 255, 0.4)" letter-spacing="1.5">GOOGLE PLAY STORE • YAKINDA YAYINDA 📲</text>
    </svg>
  `;
}

export async function runDailyAppPromotionFlow(): Promise<{ success: boolean; topic?: string; igPostId?: string; fbPostId?: string; error?: string }> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const imagePath = path.join(publicDir, "daily-instagram-post.png");
    
    // 1. Select template based on current day of week (0 = Sunday, 1 = Monday, etc.)
    const templateIndex = new Date().getDay();
    const promo = PROMO_TEMPLATES[templateIndex];
    console.log(`[Promo Flow] Selected template index ${templateIndex} for day of week: "${promo.highlight}"`);

    // 2. Generate SVG and Composite Logo on dynamic illustration background
    const svgString = getPromoCardSvg(promo);
    const logoPath = path.join(process.cwd(), "assets", "icon.png");
    const bgPath = path.join(process.cwd(), "instagram_shares", "images", "promo_bgs", `promo_bg_${templateIndex}.png`);
    
    let logoBuffer: Buffer | null = null;
    try {
      if (fs.existsSync(logoPath)) {
        logoBuffer = await sharp(logoPath)
          .resize(180, 180)
          .composite([{
            input: Buffer.from('<svg width="180" height="180"><rect x="0" y="0" width="180" height="180" rx="36" ry="36" fill="#ffffff"/></svg>'),
            blend: 'dest-in'
          }])
          .png()
          .toBuffer();
      }
    } catch (err: any) {
      console.warn("[Promo Flow] Could not load or resize app icon logo:", err.message);
    }

    // Ensure public folder exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    if (fs.existsSync(bgPath)) {
      console.log(`[Promo Flow] Loading background illustration: ${bgPath}`);
      const baseImg = await sharp(bgPath)
        .resize(1080, 1080)
        .toBuffer();

      const composites: any[] = [
        {
          input: Buffer.from(svgString),
          top: 0,
          left: 0
        }
      ];

      if (logoBuffer) {
        composites.push({
          input: logoBuffer,
          top: 780,
          left: 120
        });
      }

      await sharp(baseImg)
        .composite(composites)
        .png()
        .toFile(imagePath);
    } else {
      console.warn(`[Promo Flow] Background illustration not found at ${bgPath}. Falling back to plain gradient background.`);
      const fallbackSvg = `
        <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
          <rect width="1080" height="1080" fill="#120E28" />
        </svg>
      `;
      const baseImg = await sharp(Buffer.from(fallbackSvg))
        .png()
        .toBuffer();

      const composites: any[] = [
        {
          input: Buffer.from(svgString),
          top: 0,
          left: 0
        }
      ];

      if (logoBuffer) {
        composites.push({
          input: logoBuffer,
          top: 780,
          left: 120
        });
      }

      await sharp(baseImg)
        .composite(composites)
        .png()
        .toFile(imagePath);
    }

    console.log(`[Promo Flow] Successfully saved promo card image locally: ${imagePath}`);

    // 3. Get server public URL
    const serverUrl = process.env.SERVER_PUBLIC_URL || "https://ingilizce-oyk-m.onrender.com";
    const imageUrl = `${serverUrl}/api/instagram/daily-post.png`;

    // 4. Post to Instagram
    console.log("[Promo Flow] Publishing to Instagram...");
    const igPostId = await publishToInstagramDirectly(imageUrl, promo.caption);

    // 5. Post to Facebook Page (Skip if already scheduled on Meta for June 15-21, 2026)
    let fbPostId = "SKIPPED_SCHEDULED";
    const now = new Date();
    const isScheduledPeriod = now >= new Date("2026-06-15T00:00:00+03:00") && now <= new Date("2026-06-21T23:59:59+03:00");
    if (isScheduledPeriod) {
      console.log("[Promo Flow] Skipping Facebook publishing because it is already scheduled via Meta Page Planner for June 15-21.");
    } else {
      console.log("[Promo Flow] Publishing to Facebook...");
      fbPostId = await publishToFacebookDirectly(imageUrl, promo.caption);
    }

    // 6. Log success metadata
    const logEntry = `[${new Date().toISOString()}] Promo Post "${promo.highlight}" shared. IG ID: ${igPostId}, FB ID: ${fbPostId}\n`;
    fs.appendFileSync(path.join(process.cwd(), "instagram_posts.log"), logEntry, "utf8");

    return { success: true, topic: promo.highlight, igPostId, fbPostId };

  } catch (err: any) {
    console.error("[Promo Flow] Unhandled error during promo flow execution:", err);
    try {
      fs.appendFileSync(path.join(process.cwd(), "instagram_posts.log"), `[${new Date().toISOString()}] Promo Flow Error: ${err.message}\n`, "utf8");
    } catch {}
    return { success: false, error: err.message };
  }
}
