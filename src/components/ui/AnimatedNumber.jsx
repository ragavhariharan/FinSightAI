/**
 * Formats a numeric value for display. Animation removed — instant render only.
 */
export default function AnimatedNumber({ value = 0, format = (n) => Math.round(n).toLocaleString('en-IN'), className, style }) {
  const num = Number(value) || 0;
  return <span className={className} style={style}>{format(num)}</span>;
}
