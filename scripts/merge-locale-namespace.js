import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const [, , namespace, translationsFileArg] = process.argv;

if (!namespace) {
  throw new Error(
    'Укажи namespace, например: node scripts/merge-locale-namespace.js ui scripts/donate.ui.translations.json',
  );
}

if (!translationsFileArg) {
  throw new Error(
    'Укажи путь к json с переводами, например: node scripts/merge-locale-namespace.js ui scripts/donate.ui.translations.json',
  );
}

const translationsPath = path.resolve(root, translationsFileArg);
const localesRoot = path.resolve(root, 'public/locales');

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
};

const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const deepMerge = (target, source) => {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

const countLeafKeys = (obj) => {
  if (!isPlainObject(obj)) {
    return 1;
  }

  return Object.values(obj).reduce((sum, value) => sum + countLeafKeys(value), 0);
};

if (!fs.existsSync(translationsPath)) {
  throw new Error(`Файл переводов не найден: ${translationsPath}`);
}

const translations = readJson(translationsPath);

if (!isPlainObject(translations)) {
  throw new Error(
    'Файл переводов должен быть объектом формата { "<lang>": { ...namespaceData } }',
  );
}

for (const [langCode, namespacePatch] of Object.entries(translations)) {
  if (!isPlainObject(namespacePatch)) {
    console.warn(`[skip] Некорректные данные для языка "${langCode}"`);
    continue;
  }

  const localeDir = path.resolve(localesRoot, langCode);
  const namespacePath = path.resolve(localeDir, `${namespace}.json`);

  if (!fs.existsSync(localeDir)) {
    console.warn(`[skip] Папка языка не найдена: ${localeDir}`);
    continue;
  }

  const existingJson = fs.existsSync(namespacePath) ? readJson(namespacePath) : {};
  const mergedJson = deepMerge(existingJson, namespacePatch);

  writeJson(namespacePath, mergedJson);

  console.log(
    `[${langCode}] mergedKeys=${countLeafKeys(namespacePatch)}, file=${path.relative(root, namespacePath)}`,
  );
}

console.log('Готово');