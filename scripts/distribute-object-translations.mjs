import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const translationsPath = path.resolve(
  root,
  'scripts/objects-329.translations.json'
)

const localesRoot = path.resolve(root, 'public/locales')

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const translations = readJson(translationsPath)

if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
  throw new Error('Файл переводов должен быть объектом формата { "<lang>": { "<id>": {...} } }')
}

for (const [langCode, langItems] of Object.entries(translations)) {
  if (!langItems || typeof langItems !== 'object' || Array.isArray(langItems)) {
    console.warn(`[skip] Некорректные данные для языка "${langCode}"`)
    continue
  }

  const localeDir = path.resolve(localesRoot, langCode)
  const objectsPath = path.resolve(localeDir, 'objects.json')

  if (!fs.existsSync(localeDir)) {
    console.warn(`[skip] Папка языка не найдена: ${localeDir}`)
    continue
  }

  if (!fs.existsSync(objectsPath)) {
    console.warn(`[skip] Файл не найден: ${objectsPath}`)
    continue
  }

  const objectsJson = readJson(objectsPath)

  if (!objectsJson.items || typeof objectsJson.items !== 'object' || Array.isArray(objectsJson.items)) {
    console.warn(`[skip] В ${objectsPath} нет объекта items`)
    continue
  }

  let addedCount = 0
  let skippedCount = 0

  for (const [objectId, objectTranslation] of Object.entries(langItems)) {
    if (objectsJson.items[objectId]) {
      skippedCount += 1
      continue
    }

    objectsJson.items[objectId] = objectTranslation
    addedCount += 1
  }

  writeJson(objectsPath, objectsJson)

  console.log(
    `[${langCode}] added=${addedCount}, skipped=${skippedCount}, file=${path.relative(root, objectsPath)}`
  )
}

console.log('Готово')
