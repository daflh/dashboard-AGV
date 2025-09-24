export function roundNumber(num: number, n: number = 2) {
  const factor = Math.pow(10, n);
  return Math.round(num * factor) / factor;
}
