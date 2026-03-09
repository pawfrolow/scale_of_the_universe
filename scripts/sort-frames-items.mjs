import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('public/data/items.json');

const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

if (!data.frames || typeof data.frames !== 'object') {
  throw new Error('В файле нет объекта frames');
}

const sortedEntries = Object.entries(data.frames)
  .map(([key, value]) => [String(Number(key)).padStart(3, '0'), value])
  .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB));

const framesJson = sortedEntries
  .map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n    ')}`)
  .join(',\n');

const result = `{
  "frames": {
${framesJson}
  },
  "meta": ${JSON.stringify(data.meta, null, 2).replace(/\n/g, '\n  ')}
}
`;

fs.writeFileSync(filePath, result, 'utf8');

console.log(`Frames in ${filePath} sorted successfully.`);