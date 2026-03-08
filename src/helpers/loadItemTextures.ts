import * as PIXI from 'pixi.js-legacy'
import { Assets } from 'pixi.js-legacy'

type TFrameMeta = {
  frame: {
    x: number
    y: number
    w: number
    h: number
  }
  rotated: boolean
  trimmed: boolean
  spriteSourceSize: {
    x: number
    y: number
    w: number
    h: number
  }
  sourceSize: {
    w: number
    h: number
  }
}

type TTextureManifest = {
  frames: Record<string, TFrameMeta>
  meta?: {
    scale?: string | number
  }
}

const chunkArray = <T,>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  return chunks
}

export const loadItemTextures = async (
  textureIds: string[],
  manifestPath = 'img/textures/items.json',
  onProgress?: (loaded: number, total: number) => void
): Promise<Record<string, PIXI.Texture>> => {
  const manifest = (await (await fetch(manifestPath)).json()) as TTextureManifest
  const result: Record<string, PIXI.Texture> = {}

  const manifestScale = Number(manifest.meta?.scale ?? 1) || 1
  const total = textureIds.length
  let loadedCount = 0

  const chunks = chunkArray(textureIds, 10)

  for (const batch of chunks) {
    const loadedBatch = await Promise.all(
      batch.map(async (id) => {
        const meta = manifest.frames[id]

        if (!meta) {
          console.warn(`Texture manifest entry not found for id=${id}`)
          return null
        }

        const loaded = await Assets.load(`img/textures/items/${id}.png`)
        const sourceTexture = loaded as PIXI.Texture
        const baseTexture = sourceTexture.baseTexture

        if (baseTexture.resolution !== manifestScale) {
          baseTexture.setResolution(manifestScale)
          baseTexture.update()
        }

        const s = manifestScale

        const frameRect = new PIXI.Rectangle(
          0,
          0,
          meta.spriteSourceSize.w / s,
          meta.spriteSourceSize.h / s
        )

        const origRect = new PIXI.Rectangle(
          0,
          0,
          meta.sourceSize.w / s,
          meta.sourceSize.h / s
        )

        const trimRect = new PIXI.Rectangle(
          meta.spriteSourceSize.x / s,
          meta.spriteSourceSize.y / s,
          meta.spriteSourceSize.w / s,
          meta.spriteSourceSize.h / s
        )

        const texture = new PIXI.Texture(
          baseTexture,
          frameRect,
          origRect,
          trimRect,
          0
        )

        return { id, texture }
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