import { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * Video element that only loads its `src` once it scrolls within
 * `rootMargin` of the viewport. Use for heavy clips (afro-rave,
 * p2w-arcana) so the browser doesn't try to fetch them on first paint.
 *
 * Props match a normal <video> element. `src` is required.
 */
const LazyVideo = forwardRef(function LazyVideo(
  { src, rootMargin = '200% 0px', style, ...videoProps },
  ref
) {
  const localRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = localRef.current;
    if (!el || shouldLoad) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldLoad(true);
            io.disconnect();
            return;
          }
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, shouldLoad]);

  return (
    <video
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      src={shouldLoad ? src : undefined}
      preload={shouldLoad ? 'auto' : 'none'}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      {...videoProps}
    />
  );
});

export default LazyVideo;
