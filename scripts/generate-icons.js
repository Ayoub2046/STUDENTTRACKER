const sharp = require('sharp');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs>
  <rect width="512" height="512" rx="80" fill="#0a0a12"/>
  <rect x="20" y="20" width="472" height="472" rx="70" fill="url(#g)" opacity="0.15"/>
  <g transform="translate(256,256)">
    <rect x="-80" y="-55" width="160" height="25" rx="4" fill="white"/>
    <rect x="-80" y="-25" width="160" height="25" rx="4" fill="white" opacity="0.9"/>
    <rect x="-80" y="5" width="160" height="25" rx="4" fill="white" opacity="0.8"/>
    <rect x="-80" y="35" width="160" height="25" rx="4" fill="white" opacity="0.7"/>
    <circle cx="-25" cy="-15" r="16" fill="#8b5cf6"/>
    <circle cx="15" cy="40" r="10" fill="#10b981"/>
  </g>
</svg>`;

async function main() {
  const dir = path.join(__dirname, '..', 'client', 'public', 'icons');
  await Promise.all([
    sharp(Buffer.from(svg)).resize(192, 192).png().toFile(path.join(dir, 'icon-192.png')),
    sharp(Buffer.from(svg)).resize(512, 512).png().toFile(path.join(dir, 'icon-512.png'))
  ]);
  console.log('Icons generated successfully');
}

main().catch(console.error);
