'use client';

type Intensity = 'light' | 'medium' | 'heavy';

export function useRumble() {
  const buzz = (intensity: Intensity = 'light') => {
    if (typeof navigator === 'undefined') return;
    if (!('vibrate' in navigator)) return;
    const ms =
      intensity === 'light' ? 8 : intensity === 'medium' ? 20 : 35;
    try {
      (navigator as any).vibrate(ms);
    } catch {
      // ignore
    }
  };

  return { buzz };
}
