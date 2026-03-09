import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const localesRoot = path.resolve(root, 'src/i18n/locales')

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const isDirectory = (filePath) => {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
}

const sortEntriesNumeric = (obj) => {
  return Object.entries(obj).sort(([a], [b]) => Number(a) - Number(b))
}

const indentBlock = (text, spaces) => {
  const pad = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n')
}

const stringifyObjectsFile = (json) => {
  const result = []
  result.push('{')

  const topLevelEntries = Object.entries(json)
  const nonItemsEntries = topLevelEntries.filter(([key]) => key !== 'items')
  const itemsEntry = topLevelEntries.find(([key]) => key === 'items')

  for (let i = 0; i < nonItemsEntries.length; i += 1) {
    const [key, value] = nonItemsEntries[i]
    const valueStr = JSON.stringify(value, null, 2)
    result.push(`  ${JSON.stringify(key)}: ${valueStr}${itemsEntry || i < nonItemsEntries.length - 1 ? ',' : ''}`)
  }

  if (itemsEntry) {
    const [, items] = itemsEntry
    const sortedItems = sortEntriesNumeric(items)

    result.push('  "items": {')

    sortedItems.forEach(([key, value], index) => {
      const valueStr = JSON.stringify(value, null, 2)
      const indentedValue = indentBlock(valueStr, 4)
      const comma = index < sortedItems.length - 1 ? ',' : ''

      result.push(`    ${JSON.stringify(key)}: ${indentedValue.trimStart()}${comma}`)
    })

    result.push('  }')
  }

  result.push('}')
  result.push('')

  return result.join('\n')
}

if (!fs.existsSync(localesRoot)) {
  throw new Error(`Папка локалей не найдена: ${localesRoot}`)
}

const localeDirs = fs
  .readdirSync(localesRoot)
  .map((name) => path.resolve(localesRoot, name))
  .filter(isDirectory)

for (const localeDir of localeDirs) {
  const objectsPath = path.resolve(localeDir, 'objects.json')

  if (!fs.existsSync(objectsPath)) {
    console.warn(`[skip] Файл не найден: ${path.relative(root, objectsPath)}`)
    continue
  }

  const json = readJson(objectsPath)

  if (!json.items || typeof json.items !== 'object' || Array.isArray(json.items)) {
    console.warn(`[skip] В файле нет объекта items: ${path.relative(root, objectsPath)}`)
    continue
  }

  const output = stringifyObjectsFile(json)
  fs.writeFileSync(objectsPath, output, 'utf8')

  console.log(`[sorted] ${path.relative(root, objectsPath)}`)
}

console.log('Готово')