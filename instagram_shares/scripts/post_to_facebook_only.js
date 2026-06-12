import fs from "fs";
import path from "path";

const fbPageId = "1217495374774391";
const pageToken = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

async function uploadToTmpFiles(filePath) {
  const fileData = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileData]), path.basename(filePath));

  console.log("Uploading image to temp host...");
  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: form
  });

  const resJSON = await res.json();
  if (resJSON.status !== "success" || !resJSON.data || !resJSON.data.url) {
    throw new Error("Temporary file upload failed: " + JSON.stringify(resJSON));
  }

  return resJSON.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function run() {
  try {
    const postImagePath = path.join(process.cwd(), "instagram_shares", "images", "app_coming_soon.png");
    if (!fs.existsSync(postImagePath)) {
      throw new Error(`Announcement image not found at: ${postImagePath}`);
    }

    const publicImageUrl = await uploadToTmpFiles(postImagePath);
    console.log("Public direct URL:", publicImageUrl);

    const caption = `📢 Müjde! İngilizce Öyküm Çok Yakında Google Play Store'da! 🚀\n\n` +
                    `İngilizce okuma, dinleme ve anlama becerilerinizi geliştirecek yepyeni bir deneyim için gün sayıyoruz! İngilizce Öyküm uygulamamız çok yakında sadece Google Play Store'da yerini alacak. 📱✨\n\n` +
                    `📖 Kitap okurken tek dokunuşla kelime çevirisi, profesyonel seslendirmeler ve interaktif quizler ile İngilizce öğrenmek artık çok daha eğlenceli ve kolay olacak!\n\n` +
                    `Gelişmeler, lansman tarihi ve erken erişim detayları için sayfamızı takip etmeye devam edin! 🔔\n\n` +
                    `#ingilizceöyküm #ingilizceöykü #ingilizceöyküler #ingilizcehikayeler #ingilizceöğren`;

    console.log("Publishing to Facebook Page (via URLSearchParams)...");
    const fbPhotoUrl = `https://graph.facebook.com/v20.0/${fbPageId}/photos`;
    
    const params = new URLSearchParams();
    params.append("url", publicImageUrl);
    params.append("caption", caption);
    params.append("access_token", pageToken);

    const fbRes = await fetch(fbPhotoUrl, {
      method: "POST",
      body: params
    });

    const fbData = await fbRes.json();
    if (fbData.error) {
      throw new Error(`Facebook publication error: ${fbData.error.message}`);
    }
    
    console.log("\n🚀 SUCCESS!");
    console.log("Facebook Page post published! ID:", fbData.id || fbData.post_id);

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
