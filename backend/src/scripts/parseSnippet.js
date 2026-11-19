import fs from 'fs';

const html = fs.readFileSync('backend/src/scripts/maps_sample.html', 'utf8');
const idx = html.indexOf('Speed Bike rental');
console.log(html.substring(idx, idx + 4000));
