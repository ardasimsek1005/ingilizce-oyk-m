import fs from "fs";
import path from "path";

// Configuration
const instagramId = "17841475472601731";
const pageToken = "EAAS6ZCrSpGJUBRkrjMPwvp6aI4BY1WwEAr4mexJwVfN5DdZCUIbIzWoZBOlQKUER0k1g6bZBLmYQA7j4h5fZBlhSaivpDSzNGY2qxwXaTOmbX7YVunGKCZCZBZCKWZBSWBV0DdLWi4QCzQzsAWS7pvr64wkE5MlGuo6zJtlAbRwCqALEpVLWOplTJIBf6iNqWYWcXQCeReMkUU01LZBKb4G4siDgZDZD";

async function uploadToTmpFiles(filePath) {
  const fileData = fs.readFileSync(filePath);
  
  const form = new FormData();
  form.append("file", new Blob([fileData]), path.basename(filePath));

  console.log("Uploading Story image to temp host...");
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
    const storyImagePath = path.join(process.cwd(), "instagram_shares", "images", "daily_word_story.png");
    if (!fs.existsSync(storyImagePath)) {
      throw new Error(`Story image not found at: ${storyImagePath}`);
    }

    // 1. Upload to public hosting
    const publicImageUrl = await uploadToTmpFiles(storyImagePath);
    console.log("Public direct URL:", publicImageUrl);

    // 2. Creating Instagram Media Container for STORIES
    console.log("2. Creating Instagram Media Container for STORIES...");
    const containerUrl = `https://graph.facebook.com/v20.0/${instagramId}/media`;
    
    // Note: We set media_type to "STORIES" and do not pass a caption since stories do not have comments/captions.
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: publicImageUrl,
        media_type: "STORIES",
        access_token: pageToken
      })
    });

    const containerData = await containerRes.json();
    if (containerData.error) {
      throw new Error(`Instagram Story container error: ${containerData.error.message}`);
    }

    const containerId = containerData.id;
    console.log(`Instagram Story container created. ID: ${containerId}. Waiting 12 seconds for processing...`);
    await new Promise(resolve => setTimeout(resolve, 12000));

    // 3. Publishing the Story Container
    console.log("3. Publishing Story Container...");
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
      throw new Error(`Instagram Story publication error: ${publishData.error.message}`);
    }
    
    console.log("\n🚀 SUCCESS!");
    console.log("Instagram Story published automatically! ID:", publishData.id);

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
