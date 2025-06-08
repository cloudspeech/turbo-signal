import { compress } from 'brotli';
import { readFileSync, writeFileSync } from 'fs';

console.log('index.js:\n');

let minified = readFileSync('dist/index.min.js');

console.log(
  'dist/index.min.js -',
  'Uncompressed, minified:',
  minified.length,
  'Bytes'
);

let brotliCompressed = compress(minified);

console.log('Brotli -11:', brotliCompressed.length, 'Bytes');
