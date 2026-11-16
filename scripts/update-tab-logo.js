const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
const appDir = path.resolve(__dirname, '../src/app');
const iconsDir = path.resolve(publicDir, 'icons');
const svgPath = path.resolve(publicDir, 'logo.svg');

async function updateAllTabLogos() {
  console.log('Updating tab logos & favicons across src/app and public...');
  const svgBuf = fs.readFileSync(svgPath);

  // 1. Generate 48x48 PNG buffer for favicon
  const favBuf = await sharp(svgBuf).resize(48, 48).png().toBuffer();
  const icon32Buf = await sharp(svgBuf).resize(32, 32).png().toBuffer();

  // Next.js App Router uses src/app/favicon.ico directly for browser tabs!
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), favBuf);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favBuf);

  // Also Next.js App Router supports src/app/icon.png and src/app/apple-icon.png
  await sharp(svgBuf).resize(96, 96).png().toFile(path.join(appDir, 'icon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));

  // Also copy svg to src/app/icon.svg
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgBuf);

  // Public icons
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  console.log('✅ Browser tab logos (src/app/favicon.ico, src/app/icon.png, public/favicon.ico) successfully updated!');
}

updateAllTabLogos().catch(err => {
  console.error('Error updating tab logos:', err);
  process.exit(1);
});
