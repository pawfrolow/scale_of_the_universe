export const getTextureImagePaths = () => {
  const maxItemId = 327
  const textureImagePaths: string[] = []

  for (let i = 1; i <= maxItemId; i++) {
    const id = String(i).padStart(3, '0')
    textureImagePaths.push(`img/textures/items/${id}.png`)
  }

  return textureImagePaths
}