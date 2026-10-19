import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const usage =
  'node .agents/skills/add-scale-object/scripts/convert-to-webp.mjs [--overwrite] input.png output.webp';

try {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  const files = args.filter((arg) => arg !== '--overwrite');
  if (files.length !== 2 || files.some((arg) => arg.startsWith('--'))) {
    throw new Error(`Использование: ${usage}`);
  }

  const [inputPath, outputPath] = files.map((file) => path.resolve(file));
  if (!['.png', '.webp'].includes(path.extname(inputPath).toLowerCase())) {
    throw new Error('Ожидается исходник PNG или WebP');
  }
  if (path.extname(outputPath).toLowerCase() !== '.webp') {
    throw new Error('Выходной файл должен иметь расширение .webp');
  }
  if (inputPath === outputPath) {
    throw new Error('Входной и выходной файл должны различаться');
  }

  const outputStat = await stat(outputPath).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (outputStat) {
    const inputStat = await stat(inputPath);
    if (inputStat.dev === outputStat.dev && inputStat.ino === outputStat.ino) {
      throw new Error('Выходной файл ссылается на исходник');
    }
    if (!overwrite) {
      throw new Error('Выходной файл уже существует; для согласованной замены используйте --overwrite');
    }
  }

  const input = await readFile(inputPath);
  const image = sharp(input);
  const metadata = await image.metadata();
  if (!['png', 'webp'].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
    throw new Error('Ожидается статическое изображение PNG или WebP');
  }
  const { data, info } = await image
    .rotate()
    .resize({ width: 350, height: 350, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  if ((await sharp(data).stats()).isOpaque) {
    throw new Error('Изображение непрозрачно: сначала удалите фон');
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, data, { flag: overwrite ? 'w' : 'wx' });
  process.stdout.write(
    `${inputPath} → ${outputPath}\n` +
      `  ${metadata.width}×${metadata.height} → ${info.width}×${info.height} px; ` +
      `${input.length} → ${data.length} байт; прозрачность сохранена\n`,
  );
} catch (error) {
  process.stderr.write(`Ошибка: ${error.message}\n`);
  process.exitCode = 1;
}
