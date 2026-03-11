declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.module.scss" {
  const content: Record<string, string>;
  export default content;
}