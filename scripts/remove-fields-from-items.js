import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('public/data/items.json');

const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

if (!data.frames || typeof data.frames !== 'object') {
  throw new Error('В файле нет объекта frames');
}

let updatedCount = 0;

for (const frame of Object.values(data.frames)) {
  /* if (!frame.frame || typeof frame.frame !== 'object') {
    continue;
  } */
  if(frame.size) {
    delete frame.size.objectID;
  }
  if(frame.visualLocation) {
    delete frame.visualLocation.objectID;
  }

  updatedCount += 1;
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`Updated ${updatedCount} frame(s) in ${filePath}`);