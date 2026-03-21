declare module '*.json' {
  const value;
  export default value;
}

declare module '*.module.scss' {
  const content: Record<string, string>;
  export default content;
}

interface Window {
  ym: (...args) => void;
}
