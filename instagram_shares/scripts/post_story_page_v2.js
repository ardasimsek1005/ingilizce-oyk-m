import fs from "fs";
import path from "path";
import sharp from "sharp";

// Configuration
const instagramId = "17841475472601731";
const fbPageId = "1217495374774391";
const pageToken = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

const story = {
  title: "Chicken Little",
  coverFile: "chicken_little.webp",
  en: "Suddenly, something falls from the tree and hits Chicken Little on his head!",
  tr: "Aniden, ağaçtan bir şey düşer ve Küçük Tavuk'un kafasına çarpar!"
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
  const enLines = wrapText(story.en, 44);
  const trLines = wrapText(story.tr, 46);
  
  // Generate SVG text elements dynamically
  let enSvgText = "";
  let startEnY = 755;
  enLines.forEach((line, index) => {
    enSvgText += `<text x="540" y="${startEnY + (index * 52)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="38" fill="#0F172A" text-anchor="middle">${line}</text>\n`;
  });

  let trSvgText = "";
  let startTrY = 905;
  trLines.forEach((line, index) => {
    trSvgText += `<text x="540" y="${startTrY + (index * 40)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#EA580C" font-style="italic" text-anchor="middle">${line}</text>\n`;
  });

  return `
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
      <!-- Base Background (Pure White) - Full Screen -->
      <rect width="1080" height="1080" fill="#FFFFFF" />
      
      <!-- Header Area (Wider margins) -->
      <text x="80" y="95" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="26" fill="#FF6B6B" letter-spacing="2">İNGİLİZCE ÖYKÜM</text>
      <text x="355" y="95" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="800" font-size="15" fill="rgba(15,23,42,0.4)" letter-spacing="1">|  ÇOCUK MASALLARI</text>
      
      <!-- Story Title -->
      <text x="540" y="155" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="38" fill="#0F172A" text-anchor="middle">"${story.title}"</text>

      <!-- Cover Image Border -->
      <rect x="280" y="190" width="520" height="520" rx="40" fill="none" stroke="rgba(15,23,42,0.06)" stroke-width="2.5" />

      <!-- English Story Text -->
      ${enSvgText}

      <!-- Divider Line -->
      <line x1="80" y1="855" x2="1000" y2="855" stroke="rgba(15,23,42,0.06)" stroke-width="2" />
      
      <!-- Turkish Translation -->
      ${trSvgText}
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
    const outputPath = path.join(process.cwd(), "instagram_shares", "images", "chicken_little_post_v2.png");

    console.log("3. Creating rounded resized cover image buffer (520x520)...");
    const roundedCornerResizedCover = await sharp(coverPath)
      .resize(520, 520)
      .composite([{
        input: Buffer.from('<svg width="520" height="520"><rect x="0" y="0" width="520" height="520" rx="40" ry="40" fill="#ffffff"/></svg>'),
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
          top: 190,
          left: 280
        }
      ])
      .toFile(outputPath);
    console.log("Rendered card saved locally.");

    // 5. Upload to public hosting
    const publicImageUrl = await uploadToTmpFiles(outputPath);

    // 6. Instagram & Facebook Caption
    const caption = `📚 Çocuk Masalları: "Küçük Tavuk" (Chicken Little) - A1 Seviyesi\n\n` +
                    `İngilizce öğrenmeye yeni başlayanlar için harika bir çocuk masalı! Kafasına düşen minik bir palamut yüzünden gökyüzünün yıkıldığını sanan kahramanımızın serüveni... 🐤🌳\n\n` +
                    `📖 Çocuk masallarının tamamını sesli dinlemek, bilmediğiniz kelimelerin anlamlarına tek dokunuşla ulaşmak ve interaktif quizi çözmek için profilimizdeki linkten İngilizce Öyküm uygulamasını indirin! ✨\n\n` +
                    `#ingilizceöyküm #ingilizceöykü #ingilizceöyküler #ingilizcehikayeler #ingilizceöğren`;

    // 7. Creating Instagram Media Container
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
      throw new Error(`Instagram container error: ${containerData.error.message}`);
    }

    const containerId = containerData.id;
    console.log(`Instagram container created. ID: ${containerId}. Waiting 10 seconds for processing...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 8. Publishing to Instagram Profile
    console.log("8. Publishing to Instagram Profile...");
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
      throw new Error(`Instagram publication error: ${publishData.error.message}`);
    }
    console.log("🚀 Instagram post published! ID:", publishData.id);

    // 9. Publishing to Facebook Page
    console.log("9. Publishing to Facebook Page...");
    const fbPhotoUrl = `https://graph.facebook.com/v20.0/${fbPageId}/photos`;
    const fbRes = await fetch(fbPhotoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: publicImageUrl,
        caption: caption,
        access_token: pageToken
      })
    });

    const fbData = await fbRes.json();
    if (fbData.error) {
      throw new Error(`Facebook publication error: ${fbData.error.message}`);
    }
    console.log("🚀 Facebook Page post published! ID:", fbData.id || fbData.post_id);

    console.log("\n🚀 DUAL PUBLISHING SUCCESSFUL!");

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
