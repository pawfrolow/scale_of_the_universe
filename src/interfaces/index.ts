export interface TextDatum {
  title: string
  description: string
  metersPlural: string
  meterSingular: string
}

export interface VisualLocation {
  titleX: number
  titleY: number
  titleScale: number
  titleWrap: boolean
  descriptionX: number
  descriptionY: number
  descriptionScale?: number
  zoomOffset?: number
}

export interface SizeData {
  exponent: number
  coeff: number
  realRatio: number
}

export type TFrameMeta = {
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
  size?: SizeData | null
  visualLocation?: VisualLocation | null
}

export type TItemsManifest = {
  frames?: Record<string, TFrameMeta>
  meta?: Record<string, any>
}

export interface ExtraText {
  centimeter: string
  centimeters: string
  lightyear: string
  lightyears: string
  meter: string
  meterShort: string
  meters: string
}

export type TItemsOverride = {
  remove?: string[]
  replace?: Record<string, TFrameMeta>
  add?: Record<string, TFrameMeta>
  textures?: Record<string, boolean>
}

export type TResolvedItemsManifest = TItemsManifest

export type TTextureSourceMap = Record<string, string>

export interface ItemModalData {
  imageSrc: string
  title: string
  subtitle: string
  description: string
}