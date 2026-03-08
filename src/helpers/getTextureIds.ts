export const getTextureIds = () => {
  const ids: string[] = []

  for (let i = 1; i <= 327; i++) {
    ids.push(String(i).padStart(3, '0'))
  }

  return ids
}