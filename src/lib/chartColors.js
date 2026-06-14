/** Distinct solid colors for charts — one per segment, no monochrome green. */
export const CHART_PALETTE = [
  '#1292B4', // teal blue
  '#FF7A45', // orange
  '#7B61FF', // purple
  '#F2C94C', // gold
  '#72DB9E', // green (single chart green)
  '#C2453C', // red
  '#B83280', // pink
  '#3E63DD', // indigo
  '#D97706', // amber
  '#6E56CF', // violet
  '#0088B1', // cyan
  '#5B6472', // slate
];

export function chartColor(index) {
  const i = Number(index) || 0;
  return CHART_PALETTE[i % CHART_PALETTE.length];
}
