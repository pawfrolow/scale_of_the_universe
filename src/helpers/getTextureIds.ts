import { MAX_COMMON_TEXTURES } from "../config"

export const getTextureIds = () => {
  const ids: string[] = []

  for (let i = 1; i <= MAX_COMMON_TEXTURES; i++) {
    ids.push(String(i).padStart(3, '0'))
  }

  return ids
}