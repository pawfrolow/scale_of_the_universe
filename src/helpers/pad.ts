export function pad(str: any, max: number): string {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}