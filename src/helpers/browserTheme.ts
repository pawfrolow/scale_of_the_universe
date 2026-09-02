export type BrowserTheme = 'dark' | 'light';

const BROWSER_THEME_META = 'theme-color';
const IOS_STATUS_BAR_META = 'apple-mobile-web-app-status-bar-style';
const DARK_THEME_COLOR = '#141b41';
const LIGHT_THEME_COLOR = '#e5e5e5';
const DARK_STATUS_BAR_STYLE = 'black-translucent';
const LIGHT_STATUS_BAR_STYLE = 'default';
const SAFE_AREA_BACKGROUND_PROPERTY = '--browser-safe-area-bg';
let currentBrowserTheme: BrowserTheme | null = null;

const getOrCreateMeta = (name: string) => {
  const existingMeta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (existingMeta) {
    return existingMeta;
  }

  const meta = document.createElement('meta');
  meta.name = name;
  document.head.appendChild(meta);

  return meta;
};

export const setBrowserTheme = (theme: BrowserTheme) => {
  if (currentBrowserTheme === theme) {
    return;
  }

  currentBrowserTheme = theme;

  const isDark = theme === 'dark';
  const themeColor = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  const statusBarStyle = isDark ? DARK_STATUS_BAR_STYLE : LIGHT_STATUS_BAR_STYLE;

  getOrCreateMeta(BROWSER_THEME_META).content = themeColor;
  getOrCreateMeta(IOS_STATUS_BAR_META).content = statusBarStyle;
  document.documentElement.style.setProperty(SAFE_AREA_BACKGROUND_PROPERTY, themeColor);
};
