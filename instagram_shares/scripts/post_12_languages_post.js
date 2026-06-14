import fs from "fs";
import path from "path";

// Configuration
const instagramId = "17841475472601731";
const fbPageId = "1217495374774391";
const pageToken = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

const postImagePath = path.join(process.cwd(), "instagram_shares", "images", "12_languages_feature_post.png");

// Uploads local file to tmpfiles.org and returns raw direct URL
async function uploadToTmpFiles(filePath) {
  const fileData = fs.readFileSync(filePath);
  
  const form = new FormData();
  form.append("file", new Blob([fileData]), path.basename(filePath));

  console.log("Uploading announcement image to public temp host...");
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
    if (!fs.existsSync(postImagePath)) {
      throw new Error(`Announcement image not found at: ${postImagePath}. Please generate it first.`);
    }

    // 1. Upload to public hosting
    const publicImageUrl = await uploadToTmpFiles(postImagePath);

    // 2. Caption text (Tailored for Google Play Store testing stage)
    const caption = `🌍 12 DİL DESTEĞİ EKLENDİ! 🌍\n\n` +
                    `İngilizce Öyküm uygulamamızın test sürümüne 12 farklı dil desteği eklendi! 🎉\n\n` +
                    `İngilizce hikayeleri okurken bilinmeyen kelimelerin üzerine dokunup kendi dilinizde anında öğrenin. Arayüz ve sözlük desteğimiz şimdi tam 12 farklı dilde hizmetinizde!\n\n` +
                    `Desteklenen Diller:\n` +
                    `🇹🇷 Türkçe  •  🇬🇧 English  •  🇪🇸 Español  •  🇫🇷 Français\n` +
                    `🇩🇪 Deutsch  •  🇮🇹 Italiano  •  🇵🇹 Português  •  🇷🇺 Русский\n` +
                    `🇸🇦 العربية  •  🇨🇳 中文  •  🇮🇳 हिन्दी  •  🇯🇵 日本語\n\n` +
                    `💡 Önemli Özellikler:\n` +
                    `👉 Hikayeleri kesintisiz, akıcı bir şekilde okuma\n` +
                    `👉 Kelimelere dokunarak anında detaylı çeviriler\n` +
                    `👉 Seviyelere göre gruplanmış zengin kelime kütüphanesi\n\n` +
                    `Uygulamamız şu an test aşamasındadır. Çok yakında Google Play Store'da yayında olacağız! Gelişmeleri takip etmeye devam edin. 📲\n\n` +
                    `#ingilizceoykum #ingilizceogren #ingilizceöğreniyorum #ingilizcekelime #dilogrenimi #playstore #googleplay #multilingual #educationapp #languagelearning`;

    // 3. Creating Instagram Media Container
    console.log("3. Creating Instagram Media Container...");
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

    // 4. Publishing to Instagram Profile
    console.log("4. Publishing to Instagram Profile...");
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

    // 5. Publishing to Facebook Page
    console.log("5. Publishing to Facebook Page...");
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

    console.log("\n🚀 DUAL ANNOUNCEMENT PUBLISHING SUCCESSFUL!");

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
