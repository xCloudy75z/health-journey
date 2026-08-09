// scripts/make-icon.js — writes a flat 180x180 teal PNG (no deps). Run once.
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const W = 180, H = 180, R = 0x2f, G = 0x9e, B = 0x8f;
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0);
  return Buffer.concat([len, td, crc]);
}
function crc32(buf){let c=~0;for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1));}return ~c;}
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=2;
const row = Buffer.concat([Buffer.from([0]), Buffer.concat(Array.from({length:W},()=>Buffer.from([R,G,B])))]);
const raw = Buffer.concat(Array.from({length:H},()=>row));
const png = Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))
]);
fs.writeFileSync(path.resolve(__dirname,'..','icons','apple-touch-icon-180.png'), png);
console.log('OK wrote apple-touch-icon-180.png');
