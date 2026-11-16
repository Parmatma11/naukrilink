const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');
const svgPath = path.resolve(publicDir, 'logo.svg');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function buildLogos() {
  console.log('Rendering circular logos across all resolutions...');
  const svgBuf = fs.readFileSync(svgPath);

  // Copy logo.svg to icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgBuf);

  // 1. High-res logo.png 512x512
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));

  // 2. 192x192 PNGs
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));

  // 3. 512x512 PNGs
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));

  // 4. Apple Touch Icon 180x180
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  // 5. Maskable Icons (Android Adaptive padding)
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-maskable-192.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  // 6. Favicon 48x48
  await sharp(svgBuf).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ All circular logos and favicons built successfully!');
}

buildLogos().catch(err => {
  console.error('Error building logos:', err);
  process.exit(1);
});
