// Render the existing site's vector brand mark into crawler/browser formats.
// Requires sharp; run with the project tooling runtime.
const fs = require('node:fs');
const sharp = require('sharp');
const source = fs.readFileSync('src/images/icons/Icon.js', 'utf8');
const mark = source.match(/<path d="([^"]+)"/)[1];
const hanger = `<path fill="#5F4A40" d="${mark}"/>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="104" fill="#F5EEEA"/><svg x="56" y="114" width="400" height="280" viewBox="88 -4 165 110">${hanger}</svg></svg>`;
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FAF8F6"/><rect x="32" y="32" width="1136" height="566" rx="12" fill="#F5EEEA"/><svg x="500" y="94" width="200" height="134" viewBox="88 -4 165 110">${hanger}</svg><text x="600" y="344" text-anchor="middle" font-family="DejaVu Serif,serif" font-size="94" fill="#292522">AniraKids</text><text x="600" y="421" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="30" fill="#655D58">Půjčovna šatů a obleků pro výjimečné chvíle</text><text x="600" y="528" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="24" letter-spacing="3" fill="#7A6254">anirakids.cz</text></svg>`;
(async()=>{
 fs.writeFileSync('public/favicon.svg',icon);
 fs.writeFileSync('public/social-preview.svg',card);
 for(const [name,size] of [['logo192.png',192],['logo512.png',512],['apple-touch-icon.png',180]]) await sharp(Buffer.from(icon)).resize(size,size).png().toFile('public/'+name);
 await sharp(Buffer.from(card)).jpeg({quality:90}).toFile('public/anirakids-social-v1.jpg');
 const png=await sharp(Buffer.from(icon)).resize(48,48).png().toBuffer();
 const header=Buffer.alloc(22); header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=48;header[7]=48;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
 fs.writeFileSync('public/favicon.ico',Buffer.concat([header,png]));
})();
