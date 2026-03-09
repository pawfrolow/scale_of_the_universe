import { TItemsOverride } from "../interfaces"

export const loadLocaleOverride = async (
  locale: string
): Promise<TItemsOverride | null> => {
  try {
    const response = await fetch(`data/overrides/${locale}/items.override.json`)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}