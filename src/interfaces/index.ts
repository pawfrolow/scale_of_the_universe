export interface TextDatum {
  title: string;
  description: string;
  metersPlural: string;
  meterSingular: string;
}

export interface VisualLocation {
  titleX: number;
  titleY: number;
  titleScale: number;
  titleWrap: boolean;
  descriptionX: number;
  descriptionY: number;
  descriptionScale?: number;
  zoomOffset?: number;
}

export interface SizeData {
  exponent: number;
  coeff: number;
  realRatio: number;
}

export interface SpriteLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TFrameMeta = {
  size?: SizeData | null;
  visualLocation?: VisualLocation | null;
  layout: SpriteLayout;
};

export type TManifestMeta = {
  scale: number;
};

export type TItemsManifest = {
  frames?: Record<string, TFrameMeta>;
  meta?: Record<string, TManifestMeta>;
};

export interface ExtraText {
  centimeter: string;
  centimeters: string;
  lightyear: string;
  lightyears: string;
  meter: string;
  meterShort: string;
  meters: string;
}

export type TItemsOverride = {
  remove?: string[];
  replace?: Record<string, TFrameMeta>;
  add?: Record<string, TFrameMeta>;
  textures?: Record<string, boolean>;
  slugs?: Record<string, string>;
};

export type TResolvedItemsManifest = TItemsManifest;

export type TTextureSourceMap = Record<string, string>;

export interface ItemModalData {
  imageSrc: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface StartScreenCredits {
  createdBy: string;
  webDev: string;
  copyright: string;
  translationAndDev: string;
}

export interface StartScreenNavLabels {
  about: string;
  objects: string;
  language: string;
  donate: string;
}

export interface StartScreenContent {
  title: string;
  startText: string;
  startLoadingText: string;
  introParagraphs: string[];
  zoomHint: string;
  objectHint: string;
  homePath: string;
  aboutPath: string;
  objectIndexPath: string;
  navLabels: StartScreenNavLabels;
  credits: StartScreenCredits;
}

export interface SeoLocaleData {
  language: string;
  dir: 'ltr' | 'rtl';
  ui?: Record<string, unknown>;
  startScreen?: StartScreenContent;
}
