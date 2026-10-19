import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const converter = fileURLToPath(new URL('./convert-to-webp.mjs', import.meta.url));

test('конвертация текстур с сохранением прозрачности и исходника', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'scale-texture-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const run = (...args) => spawnSync(process.execPath, [converter, ...args], { encoding: 'utf8' });
  const input = path.join(dir, 'source.png');
  const output = path.join(dir, 'nested', 'result.webp');
  await sharp({ create: { width: 700, height: 350, channels: 4, background: '#ff000080' } })
    .png()
    .toFile(input);
  const source = await readFile(input);

  await t.test('уменьшает прямоугольник, сохраняет альфу и исходник', async () => {
    const result = run(input, output);
    assert.equal(result.status, 0, result.stderr);
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, 350);
    assert.equal(metadata.height, 175);
    assert.equal((await sharp(output).stats()).isOpaque, false);
    assert.deepEqual(await readFile(input), source);
  });

  await t.test('не увеличивает маленький WebP', async () => {
    const small = path.join(dir, 'small.webp');
    const converted = path.join(dir, 'small-result.webp');
    await sharp(source).resize(40, 20).webp().toFile(small);
    const result = run(small, converted);
    assert.equal(result.status, 0, result.stderr);
    const metadata = await sharp(converted).metadata();
    assert.equal(metadata.width, 40);
    assert.equal(metadata.height, 20);
  });

  await t.test('защищает существующий файл, разрешает явную перезапись', async () => {
    const target = path.join(dir, 'existing.webp');
    await writeFile(target, 'existing content');
    const refused = run(input, target);
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /уже существует/);
    assert.equal(await readFile(target, 'utf8'), 'existing content');
    const result = run('--overwrite', input, target);
    assert.equal(result.status, 0, result.stderr);
    assert.equal((await sharp(target).metadata()).format, 'webp');
  });

  await t.test('отклоняет неверный вход, непрозрачный фон и совпадающие пути', async () => {
    const bad = path.join(dir, 'bad.png');
    const opaque = path.join(dir, 'opaque.png');
    await writeFile(bad, 'not an image');
    await sharp({ create: { width: 20, height: 20, channels: 4, background: '#ffffff' } })
      .png()
      .toFile(opaque);
    const target = path.join(dir, 'protected.webp');
    await writeFile(target, 'keep');
    for (const [file, message] of [[bad, /unsupported image format/i], [opaque, /непрозрачно/]]) {
      const refused = run('--overwrite', file, target);
      assert.notEqual(refused.status, 0);
      assert.match(refused.stderr, message);
      assert.equal(await readFile(target, 'utf8'), 'keep');
    }
    const samePath = run('--overwrite', target, target);
    assert.notEqual(samePath.status, 0);
    assert.match(samePath.stderr, /должны различаться/);
    assert.equal(await readFile(target, 'utf8'), 'keep');
    assert.notEqual(run().status, 0);
  });
});
