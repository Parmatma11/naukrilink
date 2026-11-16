const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Master SVG design for regular icon
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="180" fill="#991b1b" stroke="#fef08a" stroke-width="12"/>
  <path d="M256 120c-55 0-100 45-100 100v65l-25 25v15h250v-15l-25-25v-65c0-55-45-100-100-100z" fill="#fef08a"/>
  <circle cx="256" cy="365" r="25" fill="#fef08a"/>
  <text x="256" y="270" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="70" fill="#991b1b" text-anchor="middle">GJ</text>
</svg>
`;

// Maskable SVG design with safe margin (10% padding so nothing gets clipped)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#8b0000"/>
  <circle cx="256" cy="256" r="150" fill="#991b1b" stroke="#fef08a" stroke-width="10"/>
  <path d="M256 145c-45 0-80 35-80 80v55l-20 20v12h200v-12l-20-20v-55c0-45-35-80-80-80z" fill="#fef08a"/>
  <circle cx="256" cy="345" r="20" fill="#fef08a"/>
  <text x="256" y="265" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="56" fill="#991b1b" text-anchor="middle">GJ</text>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA Icons with sharp...');

  const standardBuf = Buffer.from(standardSvg);
  const maskableBuf = Buffer.from(maskableSvg);

  // 1. 192x192
  await sharp(standardBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(standardBuf).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));

  // 2. 512x512
  await sharp(standardBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(standardBuf).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // 3. Apple Touch Icon 180x180
  await sharp(standardBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(standardBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Maskable Icons (Android Adaptive Icons)
  await sharp(maskableBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-maskable-192.png'));
  await sharp(maskableBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  console.log('✅ All PWA Icons generated successfully in public/icons and public/ !');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
