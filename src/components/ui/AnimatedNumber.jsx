import { useEffect, useRef, useState } from 'react';

/**
 * Counts up to `value` on mount / when value changes.
 * `format` maps the interpolated number to a display string.
 */
export default function AnimatedNumber({ value = 0, duration = 900, format = (n) => Math.round(n).toLocaleString('en-IN'), className, style }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className} style={style}>{format(display)}</span>;
}
