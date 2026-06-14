import fs from "fs";
import path from "path";
import sharp from "sharp";

const rootDir = process.cwd();
const logoPath = path.join(rootDir, "assets", "icon.png");
const outputPath = path.join(rootDir, "instagram_shares", "images", "12_languages_feature_post.png");

function getPostSvg() {
  return `
    <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#07060f;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0d0a21;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16092e;stop-opacity:1" />
        </linearGradient>
        
        <!-- Glowing background blobs filter -->
        <filter id="glow-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="140" result="blur" />
        </filter>
      </defs>
      
      <!-- Base Background -->
      <rect width="1080" height="1080" fill="url(#bg-grad)" />
      
      <!-- Glowing colorful blobs (Glassmorphism look) -->
      <circle cx="900" cy="200" r="300" fill="#FF6B6B" opacity="0.18" filter="url(#glow-blur)" />
      <circle cx="150" cy="850" r="320" fill="#4ECDC4" opacity="0.18" filter="url(#glow-blur)" />
      <circle cx="540" cy="540" r="220" fill="#70A1FF" opacity="0.12" filter="url(#glow-blur)" />
      
      <!-- Header Header -->
      <text x="540" y="80" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="24" fill="#4ECDC4" letter-spacing="4" text-anchor="middle">İNGİLİZCE ÖYKÜM</text>
      
      <!-- (Logo will be composited here dynamically at x=430, y=120, width=220, height=220) -->
      
      <!-- Title & Subtitle -->
      <text x="540" y="420" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="900" font-size="56" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">12 DİL DESTEĞİ EKLENDİ! 🌍</text>
      <text x="540" y="468" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="26" fill="#FFE66D" text-anchor="middle">İngilizce Hikayeleri Kendi Dilinizde Okuyun!</text>
      
      <!-- Card Container (Glassmorphism card) -->
      <rect x="100" y="520" width="880" height="400" rx="32" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />
      
      <!-- Language Grid -->
      <!-- Row 1 -->
      <text x="220" y="595" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇹🇷 Türkçe</text>
      <text x="430" y="595" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇬🇧 English</text>
      <text x="650" y="595" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇪🇸 Español</text>
      <text x="860" y="595" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇫🇷 Français</text>
      
      <!-- Row 2 -->
      <text x="220" y="695" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇩🇪 Deutsch</text>
      <text x="430" y="695" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇮🇹 Italiano</text>
      <text x="650" y="695" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇵🇹 Português</text>
      <text x="860" y="695" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇷🇺 Русский</text>
      
      <!-- Row 3 -->
      <text x="220" y="795" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇸🇦 العربية</text>
      <text x="430" y="795" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇨🇳 中文</text>
      <text x="650" y="795" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇮🇳 हिन्दी</text>
      <text x="860" y="795" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="28" fill="#FFFFFF" text-anchor="middle">🇯🇵 日本語</text>
      
      <!-- Feature description text -->
      <text x="540" y="875" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="22" fill="rgba(255,255,255,0.6)" text-anchor="middle">Bilinmeyen kelimelere anında dokunun, kendi dilinizde öğrenin!</text>
      
      <!-- Divider Line -->
      <line x1="120" y1="965" x2="960" y2="965" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
      
      <!-- Footer Area -->
      <text x="120" y="1005" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="16" fill="rgba(255,255,255,0.3)">İngilizce Öyküm</text>
      <text x="960" y="1005" font-family="'Segoe UI', -apple-system, sans-serif" font-weight="700" font-size="16" fill="rgba(255,255,255,0.3)" text-anchor="end">Google Play Store Test Aşamasında! 📲</text>
    </svg>
  `;
}

async function run() {
  try {
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo file not found at: ${logoPath}`);
    }

    console.log("1. Resizing current App Logo to 220x220 with rounded corners...");
    const logoBuffer = await sharp(logoPath)
      .resize(220, 220)
      .composite([{
        input: Buffer.from('<svg width="220" height="220"><rect x="0" y="0" width="220" height="220" rx="48" ry="48" fill="#ffffff"/></svg>'),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    console.log("2. Generating SVG container...");
    const svgString = getPostSvg();

    console.log("3. Compositing current logo and rendering 1080x1080 PNG...");
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(Buffer.from(svgString))
      .composite([{
        input: logoBuffer,
        top: 120,
        left: 430
      }])
      .png()
      .toFile(outputPath);

    console.log("\n🚀 SUCCESS!");
    console.log("Announcement post image saved at:", outputPath);

  } catch (err) {
    console.error("\n❌ FAILED:");
    console.error(err);
  }
}

run();
