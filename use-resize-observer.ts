import { useEffect, useState } from 'react';

/**
 * Get width and height of an element, accounting for resize events.
 */
export function useResizeObserver(
  el: Element | undefined,
  options?: ResizeObserverOptions
): [width: number, height: number] {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];

    // Firefox implements `contentBoxSize` as a single content rect, rather than an array.
    const contentBoxSize: ResizeObserverSize = Array.isArray(
      entry.contentBoxSize
    )
      ? entry.contentBoxSize[0]
      : entry.contentBoxSize;

    // Fallback for older browsers.
    const [w, h] = contentBoxSize
      ? [contentBoxSize.inlineSize, contentBoxSize.blockSize]
      : [entry.contentRect.width, entry.contentRect.height];

    setWidth(w);
    setHeight(h);
  });

  useEffect(() => {
    el && observer.observe(el, options);
  }, [el]);

  return [width, height];
}
