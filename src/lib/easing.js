export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// Steep deceleration — used for Speed's final approach
export const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
