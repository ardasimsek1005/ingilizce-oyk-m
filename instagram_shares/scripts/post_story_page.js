import fs from "fs";
import path from "path";
import sharp from "sharp";

// Configuration
const instagramId = "17841475472601731";
const pageToken = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

const story = {
  title: "Chicken Little",
  level: "A1",
  coverFile: "chicken_little.webp",
  en: "Chicken Little is a small chicken. He lives on a farm with many friends. Suddenly, something falls from the tree and hits him on his head.",
  tr: "Küçük Tavuk küçük bir tavuktur. Bir çiftlikte arkadaşlarıyla yaşar. Aniden, ağaçtan bir şey düşer ve kafasına çarpar."
};

// Simple text wrapping helper
function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
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

function getStoryCardSvg() {
  const levelColor = "#22C55E"; // green for A1
  
  // Wrap text
  const enLines = wrapText(story.en, 50);
  const trLines = wrapText(story.tr, 55);
  
  // Print wrapped lines for debugging
  console.log("Wrapped EN lines:", enLines);
  console.log("Wrapped TR lines:", trLines);
  
  // Generate SVG text elements dynamically
  let enSvgText = "";
  let startEnY = 660;
  enLines.forEach((line, index) => {
    enSvgText += `<text x="540" y="${startEnY + (index * 42)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="30" fill="#FFFFFF" text-anchor="middle">${line}</text>\n`;
  });

  let trSvgText = "";
  let startTrY = 825;
  trLines.forEach((line, index) => {
    trSvgText += `<text x="540" y="${startTrY + (index * 32)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="22" fill="#FFE66D" font-style="italic" text-anchor="middle">${line}</text>\n`;
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
      <text x="385" y="145" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="bold" font-size="14" fill="rgba(255,255,255,0.4)" letter-spacing="1">|  ÇOCUK MASALLARI</text>
      
      <rect x="760" y="117" width="160" height="32" rx="16" fill="rgba(255,107,107,0.1)" stroke="rgba(255,107,107,0.2)" stroke-width="1" />
      <text x="840" y="137" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="11" fill="#FF6B6B" text-anchor="middle" dominant-baseline="middle">ÖYKÜ SAYFASI</text>

      <!-- Story Title & Level -->
      <text x="540" y="215" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle">"${story.title}"</text>
      
      <rect x="470" y="235" width="140" height="26" rx="13" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" stroke-width="1" />
      <text x="540" y="252" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="11" fill="${levelColor}" text-anchor="middle" dominant-baseline="middle">${story.level} SEVİYESİ</text>

      <!-- Cover Image Border (Image is composited exactly here) -->
      <rect x="370" y="270" width="340" height="340" rx="28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

      <!-- English Story Text -->
      ${enSvgText}

      <!-- Divider Line -->
      <line x1="200" y1="780" x2="880" y2="780" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
      
      <!-- Turkish Translation -->
      ${trSvgText}
      
      <!-- Footer Area -->
      <line x1="120" y1="940" x2="960" y2="940" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
      <text x="120" y="970" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.25)">ingilizceoykum.com</text>
      <text x="960" y="970" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="12" fill="rgba(255,255,255,0.25)" text-anchor="end">Hikayenin devamını okumak için İngilizce Öyküm'ü indirin! 🚀</text>
    </svg>
  `;
}

// Uploads local file to tmpfiles.org and returns raw direct URL
async function uploadToTmpFiles(filePath) {
  const fileData = fs.readFileSync(filePath);
  
  const form = new FormData();
  form.append("file", new Blob([fileData]), path.basename(filePath));

  console.log("Uploading generated image to public temp host...");
  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form
  });

  const resJSON = await res.json();
  if (resJSON.status !== "success" || !resJSON.data || !resJSON.data.url) {
    throw new Error("Temporary file upload failed: " + JSON.stringify(resJSON));
  }

  const downloadUrl = resJSON.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  console.log("Uploaded successfully. Public direct URL:", downloadUrl);
  return downloadUrl;
}

async function run() {
  try {
    console.log("1. Checking Cover Image file path...");
    const coverPath = path.join(process.cwd(), "public", "covers", story.coverFile);
    if (!fs.existsSync(coverPath)) {
      throw new Error(`Cover file not found: ${coverPath}`);
    }

    console.log("2. Generating Story Card SVG...");
    const svg = getStoryCardSvg();
    const outputPath = path.join(process.cwd(), "scratch", "daily-instagram-story.png");

    console.log("3. Creating rounded resized cover image buffer...");
    const roundedCornerResizedCover = await sharp(coverPath)
      .resize(340, 340)
      .composite([{
        input: Buffer.from('<svg width="340" height="340"><rect x="0" y="0" width="340" height="340" rx="28" ry="28" fill="#ffffff"/></svg>'),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    console.log("4. Rendering SVG card and compositing the cover image...");
    await sharp(Buffer.from(svg))
      .png()
      .composite([
        {
          input: roundedCornerResizedCover,
          top: 270,
          left: 370
        }
      ])
      .toFile(outputPath);
    console.log("Rendered card saved at:", outputPath);

    // 5. Upload to public hosting
    const publicImageUrl = await uploadToTmpFiles(outputPath);

    // 6. Instagram Caption
    const caption = `📚 Çocuk Masalları: "Küçük Tavuk" (Chicken Little) - A1 Seviyesi\n\n` +
                    `İngilizce öğrenmeye yeni başlayanlar için harika bir çocuk masalı! Bugün meşhur 'Küçük Tavuk' hikayesinin başlangıcını paylaşıyoruz. Kafasına düşen minik bir palamut yüzünden gökyüzünün yıkıldığını sanan kahramanımızın serüveni... 🐤🌳\n\n` +
                    `📖 Çocuk masallarının tamamını sesli dinlemek, bilmediğiniz kelimelerin anlamlarına tek dokunuşla ulaşmak ve interaktif quizi çözmek için profilimizdeki linkten İngilizce Öyküm uygulamasını indirin! ✨\n\n` +
                    `#ingilizce #masal #cocukmasallari #tavuk #ingilizcehikaye #ingilizceokuma #ingilizceöğreniyorum #ingilizceogren #ingilizcekelime #kitapoku #yds #yokdil #dilogrenimi #ingilizceoykum`;

    console.log("7. Creating Instagram Media Container...");
    const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: publicImageUrl,
        caption: caption,
        access_token: pageToken
      })
    });

    const containerData = await containerRes.json();
    if (containerData.error) {
      throw new Error(`Media container error: ${containerData.error.message}`);
    }

    const containerId = containerData.id;
    console.log(`Container created. ID: ${containerId}. Waiting 10 seconds for Instagram processing...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log("8. Publishing Media to Instagram Profile...");
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
      throw new Error(`Publication error: ${publishData.error.message}`);
    }

    console.log("\n🚀 SUCCESS!");
    console.log("Post published live on Instagram!");
    console.log("Post Media ID:", publishData.id);

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
