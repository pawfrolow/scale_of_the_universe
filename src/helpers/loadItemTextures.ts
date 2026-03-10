import * as PIXI from 'pixi.js-legacy'
import { Assets } from 'pixi.js-legacy'
import { TFrameMeta, TItemsManifest } from '../interfaces'

const chunkArray = <T,>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  return chunks
}

const getManifestFrames = (manifest: TItemsManifest): Record<string, TFrameMeta> => {
  if (manifest.frames && typeof manifest.frames === 'object') {
    return manifest.frames
  }

  const result: Record<string, TFrameMeta> = {}

  for (const [key, value] of Object.entries(manifest)) {
    if (key === 'meta') {
      continue
    }

    if (
      value &&
      typeof value === 'object' &&
      'spriteSourceSize' in value &&
      'sourceSize' in value
    ) {
      result[key] = value as TFrameMeta
    }
  }

  return result
}

const getFrameMeta = (
  frames: Record<string, TFrameMeta>,
  id: string
): TFrameMeta | undefined => {
  return (
    frames[id] ||
    frames[`${id}.png`] ||
    frames[String(Number(id))] ||
    frames[`${Number(id)}.png`]
  )
}

const almostEqual = (a: number, b: number, eps = 1) => Math.abs(a - b) <= eps

export const loadItemTextures = async (
  textureIds: string[],
  manifest: TItemsManifest,
  textureSourceMap: Record<string, string>,
  onProgress?: (loaded: number, total: number) => void
): Promise<Record<string, PIXI.Texture>> => {
  const frames = getManifestFrames(manifest)
  const result: Record<string, PIXI.Texture> = {}

  const manifestScale = Number(manifest.meta?.scale ?? 1) || 1
  const total = textureIds.length
  let loadedCount = 0

  const chunks = chunkArray(textureIds, 20)

  for (const batch of chunks) {
    const loadedBatch = await Promise.all(
      batch.map(async (id) => {
        try {
          const meta = getFrameMeta(frames, id)

          if (!meta) {
            console.warn(`Texture manifest entry not found for id=${id}`)
            return null
          }

          const src = textureSourceMap[id] ?? `img/textures/items/${id}.png`
          const loaded = await Assets.load(src)
          const sourceTexture = loaded as PIXI.Texture
          const baseTexture = sourceTexture.baseTexture

          if (baseTexture.resolution !== manifestScale) {
            baseTexture.setResolution(manifestScale)
            baseTexture.update()
          }

          const s = manifestScale

          const trimX = meta.spriteSourceSize.x / s
          const trimY = meta.spriteSourceSize.y / s
          const trimW = meta.spriteSourceSize.w / s
          const trimH = meta.spriteSourceSize.h / s
          const origW = meta.sourceSize.w / s
          const origH = meta.sourceSize.h / s

          const baseW = sourceTexture.width
          const baseH = sourceTexture.height

          const isAlreadyTrimmed =
            almostEqual(baseW, trimW) && almostEqual(baseH, trimH)

          const isFullCanvas =
            almostEqual(baseW, origW) && almostEqual(baseH, origH)

          let frameRect: PIXI.Rectangle

          /* if (id === '328' || id === '248')
            console.log(id, {
              baseW,
              baseH,
              trimW,
              trimH,
              origW,
              origH,
              isAlreadyTrimmed,
              isFullCanvas,
            }) */

          if (isAlreadyTrimmed) {
            frameRect = new PIXI.Rectangle(0, 0, trimW, trimH)
          } else if (isFullCanvas) {
            frameRect = new PIXI.Rectangle(trimX, trimY, trimW, trimH)
          } else {
            console.warn(
              `Unknown texture layout for id=${id}. base=${baseW}x${baseH}, trim=${trimW}x${trimH}, orig=${origW}x${origH}. Using trimmed-style fallback.`
            )

            frameRect = new PIXI.Rectangle(
              0,
              0,
              Math.min(baseW, trimW),
              Math.min(baseH, trimH)
            )
          }

          const origRect = new PIXI.Rectangle(0, 0, origW, origH)

          const trimRect = new PIXI.Rectangle(
            trimX,
            trimY,
            Math.min(trimW, frameRect.width),
            Math.min(trimH, frameRect.height)
          )

          const texture = new PIXI.Texture(
            baseTexture,
            frameRect,
            origRect,
            trimRect,
            0
          )

          return { id, texture }
        } catch (error) {
          console.warn(`Failed to load texture id=${id}`, error)
          return null
        }
      })
    )

    for (const entry of loadedBatch) {
      loadedCount += 1

      if (entry) {
        result[entry.id] = entry.texture
      }

      onProgress?.(loadedCount, total)
    }
  }

  return result
}