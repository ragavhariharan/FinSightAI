import { useCallback, useEffect, useRef } from 'react';

/**
 * Smooth horizontal resize handle.
 * @param {'left'|'right'} edge — which side of the panel the handle sits on
 * @param {number} width — current width
 * @param {(w: number) => void} onResize
 * @param {{ min?: number, max?: number }} bounds
 */
export default function ResizeHandle({ edge = 'right', width, onResize, min = 200, max = 480 }) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(width);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next = edge === 'right'
        ? startW.current + delta
        : startW.current - delta;
      onResize(Math.min(max, Math.max(min, next)));
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [edge, min, max, onResize]);

  return (
    <div
      className="fs-resize-handle"
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
    />
  );
}
