import { useEffect, useState } from 'react';
import { debugFlags } from './debugFlags';

const QUERY = '(prefers-reduced-motion: reduce)';

// True when the visitor asked the OS for less motion. Loops then stay
// on their poster frame and scrolling jumps instead of gliding.
export function prefersReducedMotion() {
  if (debugFlags.reducedMotion) return true;
  return typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = () => setReduced(debugFlags.reducedMotion || mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
