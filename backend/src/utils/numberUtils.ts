// convert number to string with floating point
// ex: 1 -> '1.0', 2.0 -> '2.0'
export function toFloatStr(num: number) {
  return Number.isInteger(num) ? num.toFixed(1) : num.toString();
}
