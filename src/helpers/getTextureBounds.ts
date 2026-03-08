import { Texture } from 'pixi.js-legacy'

export const getTextureBounds = (texture: Texture) => {
  const trim = texture.trim

  return {
    x: trim?.x ?? 0,
    y: trim?.y ?? 0,
    width: trim?.width ?? texture.width,
    height: trim?.height ?? texture.height,
  }
}