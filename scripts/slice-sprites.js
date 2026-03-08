#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const WORK_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : process.cwd();

const OUTPUT_MODE = process.argv.includes('--full') ? 'full' : 'trimmed';
const OUTPUT_ROOT = path.join(WORK_DIR, 'extracted');

// Для TexturePacker обычно подходит именно -90.
// Если вдруг часть окажется перевернутой не туда, поменяй на 90.
const ROTATE_BACK_DEG = -90;

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function getAtlasPairs(dir) {
  const entries = await fs.readdir(dir);
  const jsonFiles = entries
    .filter((name) => /^new_items_\d+\.json$/i.test(name))
    .sort(naturalSort);

  const pairs = [];

  for (const jsonFile of jsonFiles) {
    const base = jsonFile.replace(/\.json$/i, '');
    const pngFile = `${base}.png`;
    const pngPath = path.join(dir, pngFile);

    try {
      await fs.access(pngPath);
      pairs.push({
        base,
        jsonPath: path.join(dir, jsonFile),
        pngPath,
      });
    } catch {
      console.warn(`⚠️ PNG не найден для ${jsonFile}: ожидался ${pngFile}`);
    }
  }

  return pairs;
}

function getExtractRect(frameMeta, atlasSize) {
  const { frame, rotated } = frameMeta;

  const width = rotated ? frame.h : frame.w;
  const height = rotated ? frame.w : frame.h;

  if (
    frame.x < 0 ||
    frame.y < 0 ||
    frame.x + width > atlasSize.w ||
    frame.y + height > atlasSize.h
  ) {
    throw new Error(
      `bad extract area: x=${frame.x}, y=${frame.y}, w=${width}, h=${height}, atlas=${atlasSize.w}x${atlasSize.h}`
    );
  }

  return {
    left: frame.x,
    top: frame.y,
    width,
    height,
  };
}

async function extractFrame(sheetPath, frameMeta, atlasSize) {
  const extractRect = getExtractRect(frameMeta, atlasSize);

  let image = sharp(sheetPath).extract(extractRect);

  if (frameMeta.rotated) {
    image = image.rotate(ROTATE_BACK_DEG);
  }

  return image.png().toBuffer();
}

async function saveTrimmedSprite(outputPath, spriteBuffer) {
  await sharp(spriteBuffer).png().toFile(outputPath);
}

async function saveFullSprite(outputPath, spriteBuffer, frameMeta) {
  const { spriteSourceSize, sourceSize } = frameMeta;

  await sharp({
    create: {
      width: sourceSize.w,
      height: sourceSize.h,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: spriteBuffer,
        left: spriteSourceSize.x,
        top: spriteSourceSize.y,
      },
    ])
    .png()
    .toFile(outputPath);
}

async function processAtlas({ base, jsonPath, pngPath }) {
  const jsonRaw = await fs.readFile(jsonPath, 'utf8');
  const atlas = JSON.parse(jsonRaw);

  if (!atlas.frames || typeof atlas.frames !== 'object') {
    console.warn(`⚠️ В ${path.basename(jsonPath)} нет frames`);
    return;
  }

  const atlasSize = atlas.meta?.size;
  if (!atlasSize?.w || !atlasSize?.h) {
    throw new Error(`В ${path.basename(jsonPath)} отсутствует meta.size`);
  }

  const outDir = path.join(OUTPUT_ROOT, base);
  await ensureDir(outDir);

  const frameNames = Object.keys(atlas.frames).sort(naturalSort);

  console.log(`\n📦 ${base}: ${frameNames.length} спрайтов`);

  for (const frameName of frameNames) {
    const frameMeta = atlas.frames[frameName];
    const outputPath = path.join(outDir, `${frameName}.png`);

    try {
      const spriteBuffer = await extractFrame(pngPath, frameMeta, atlasSize);

      if (OUTPUT_MODE === 'full') {
        await saveFullSprite(outputPath, spriteBuffer, frameMeta);
      } else {
        await saveTrimmedSprite(outputPath, spriteBuffer);
      }

      console.log(`  ✅ ${frameName}.png`);
    } catch (error) {
      console.error(`  ❌ Ошибка на ${frameName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log(`Рабочая директория: ${WORK_DIR}`);
  console.log(`Режим: ${OUTPUT_MODE}`);
  console.log(`Выходная папка: ${OUTPUT_ROOT}`);

  await ensureDir(OUTPUT_ROOT);

  const pairs = await getAtlasPairs(WORK_DIR);

  if (!pairs.length) {
    console.log('Не найдены пары new_items_*.json + new_items_*.png');
    process.exit(0);
  }

  for (const pair of pairs) {
    await processAtlas(pair);
  }

  console.log('\n🎉 Готово');
}

main().catch((error) => {
  console.error('Фатальная ошибка:', error);
  process.exit(1);
});