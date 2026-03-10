import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const itemsPath = path.resolve(root, 'public/data/items.json')
const sizesPath = path.resolve(root, 'public/data/sizes.json')
const visualLocationsPath = path.resolve(root, 'public/data/visualLocations.json')

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const pad3 = (value) => String(value).padStart(3, '0')

const itemsManifest = readJson(itemsPath)
const sizes = readJson(sizesPath)
const visualLocations = readJson(visualLocationsPath)

if (!itemsManifest?.frames || typeof itemsManifest.frames !== 'object') {
  throw new Error('items.json должен содержать объект frames')
}

if (!Array.isArray(sizes)) {
  throw new Error('sizes.json должен быть массивом')
}

if (!Array.isArray(visualLocations)) {
  throw new Error('visualLocations.json должен быть массивом')
}

const sizesById = new Map(
  sizes.map((item) => [Number(item.objectID), item])
)

const visualLocationsById = new Map(
  visualLocations.map((item) => [Number(item.objectID), item])
)

for (const frameKey of Object.keys(itemsManifest.frames)) {
  const objectID = Number(frameKey)
  const frameEntry = itemsManifest.frames[frameKey]

  const size = sizesById.get(objectID) ?? null
  const visualLocation = visualLocationsById.get(objectID) ?? null

  if (!size) {
    console.warn(`[merge-items-data] size not found for objectID=${objectID}`)
  }

  if (!visualLocation) {
    console.warn(`[merge-items-data] visualLocation not found for objectID=${objectID}`)
  }

  itemsManifest.frames[frameKey] = {
    ...frameEntry,
    size,
    visualLocation,
  }
}

writeJson(itemsPath, itemsManifest)

console.log(
  `[merge-items-data] Done. Updated ${Object.keys(itemsManifest.frames).length} frame entries`
)