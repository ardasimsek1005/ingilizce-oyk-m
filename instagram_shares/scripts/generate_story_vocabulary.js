import fs from "fs";
import path from "path";
import sharp from "sharp";

const wordInfo = {
  word: "Serendipity",
  translation: "Mutlu Tesadüf",
  explanation: "Beklenmedik bir anda, şans eseri güzel şeylerle karşılaşma ve keşfetme durumu.",
  exampleEn: "Finding her old diary in the attic was a moment of pure serendipity.",
  exampleTr: "Eski günlüğünü bulması, tamamen mutlu bir tesadüf anıydı."
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
  // Wrap text (optimized char counts for extra large font sizes)
  const defLines = wrapText(wordInfo.explanation, 28);
  const exEnLines = wrapText(wordInfo.exampleEn, 23);
  const exTrLines = wrapText(wordInfo.exampleTr, 26);
  
  console.log("Wrapped DEF lines:", defLines);
  console.log("Wrapped EN lines:", exEnLines);
  console.log("Wrapped TR lines:", exTrLines);

  const canvasHeight = 1920;

  // Let's set dimensions and spacing
  const headerHeight = 50;
  const spaceAfterHeader = 100; // Large breath space
  const wordHeight = 150;
  const spaceAfterWord = 40;
  const translationHeight = 90;
  const spaceAfterTranslation = 70;
  
  const defLineHeight = 65;
  const defHeight = defLines.length * defLineHeight;
  const spaceAfterDef = 80;
  
  const spaceAfterDivider = 80;
  
  const exEnLineHeight = 78;
  const exEnHeight = exEnLines.length * exEnLineHeight;
  const spaceAfterExEn = 45;
  
  const exTrLineHeight = 62;
  const exTrHeight = exTrLines.length * exTrLineHeight;

  // Calculate total height of the content block
  const totalContentHeight = 
    headerHeight + spaceAfterHeader +
    wordHeight + spaceAfterWord +
    translationHeight + spaceAfterTranslation +
    defHeight + spaceAfterDef +
    spaceAfterDivider + // (divider has 0 height)
    exEnHeight + spaceAfterExEn +
    exTrHeight;

  // Start y position of content
  const startY = (canvasHeight - totalContentHeight) / 2;

  let currentY = startY;

  // 1. Header Area
  const headerY = currentY + 36; // baseline for size 36
  currentY += headerHeight + spaceAfterHeader;

  // 2. English Word
  const wordY = currentY + 115; // baseline for size 135 (based on 135px font-size)
  currentY += wordHeight + spaceAfterWord;

  // 3. Turkish Translation
  const translationY = currentY + 68; // baseline for size 80 (based on 80px font-size)
  currentY += translationHeight + spaceAfterTranslation;

  // 4. Definition Lines
  let defSvg = "";
  const defStartBaselineY = currentY + 38; // baseline for size 44
  defLines.forEach((line, idx) => {
    defSvg += `<text x="540" y="${defStartBaselineY + (idx * defLineHeight)}" font-family="'Segoe UI', -apple-system, sans-serif" font-size="44" fill="rgba(15,23,42,0.8)" font-style="italic" font-weight="700" text-anchor="middle">${line}</text>\n`;
  });
  currentY += defHeight + spaceAfterDef;

  // 5. Divider Line
  const dividerY = currentY;
  currentY += spaceAfterDivider;

  // 6. English Example Lines
  let exEnSvg = "";
  const exEnStartBaselineY = currentY + 48; // baseline for size 56
  exEnLines.forEach((line, idx) => {
    exEnSvg += `<text x="540" y="${exEnStartBaselineY + (idx * exEnLineHeight)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="56" fill="#0F172A" text-anchor="middle">"${line}"</text>\n`;
  });
  currentY += exEnHeight + spaceAfterExEn;

  // 7. Turkish Example Lines
  let exTrSvg = "";
  const exTrStartBaselineY = currentY + 38; // baseline for size 44
  exTrLines.forEach((line, idx) => {
    exTrSvg += `<text x="540" y="${exTrStartBaselineY + (idx * exTrLineHeight)}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="750" font-size="44" fill="#EA580C" font-style="italic" text-anchor="middle">"${line}"</text>\n`;
  });

  return `
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Glowing background blobs filter -->
        <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="160" result="blur" />
        </filter>
        
        <!-- Background sunset gradient -->
        <linearGradient id="sunset-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="60%" style="stop-color:#FF8E53;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFE66D;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Base Background (Vibrant Sunset) -->
      <rect width="1080" height="1920" fill="url(#sunset-grad)" />
      
      <!-- Glowing colorful blobs for rich vibrant aura background -->
      <circle cx="950" cy="400" r="380" fill="#4ECDC4" opacity="0.32" filter="url(#glow-blur)" />
      <circle cx="150" cy="1500" r="400" fill="#70A1FF" opacity="0.28" filter="url(#glow-blur)" />
      
      <!-- Full-bleed Soft Glass Overlay to make it pastel and extremely readable -->
      <rect width="1080" height="1920" fill="rgba(255, 255, 255, 0.85)" />
      
      <!-- Header Area -->
      <text x="540" y="${headerY}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="36" fill="#FF6B6B" letter-spacing="4" text-anchor="middle">İNGİLİZCE ÖYKÜM</text>
      
      <!-- Main Vocabulary Content -->
      <!-- English Word -->
      <text x="540" y="${wordY}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="135" fill="#0F172A" text-anchor="middle" letter-spacing="-2">${wordInfo.word}</text>
      
      <!-- Turkish Translation -->
      <text x="540" y="${translationY}" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="80" fill="#EA580C" text-anchor="middle">${wordInfo.translation}</text>
      
      <!-- Explanation/Definition -->
      ${defSvg}
      
      <!-- Divider Line -->
      <line x1="100" y1="${dividerY}" x2="980" y2="${dividerY}" stroke="rgba(15,23,42,0.08)" stroke-width="2.5" />
      
      <!-- English Example -->
      ${exEnSvg}
      
      <!-- Turkish Example -->
      ${exTrSvg}
    </svg>
  `;
}

async function run() {
  try {
    const svg = getStoryCardSvg();
    const outputPath = path.join(process.cwd(), "instagram_shares", "images", "daily_word_story.png");

    console.log("Rendering 1080x1920 Instagram Story card...");
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log("\n🚀 SUCCESS!");
    console.log("Centered and enlarged Story card saved at:", outputPath);

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
