export const getTextureJsonPaths = () => {
  const highJSONCount = 5
  const textureJsonPaths: string[] = []

  for (let i = 0; i <= highJSONCount; i++) {
    textureJsonPaths.push(`img/textures/new_items_${i}.json`)
  }

  return textureJsonPaths
};