import { apiFetch } from './client';

export interface ThemeColors {
  colorStart:  string;
  colorEnd:    string;
  gradientDir: string;
  mode?:       'light' | 'dark';
}

export async function getTheme(): Promise<ThemeColors> {
  return apiFetch<ThemeColors>('app-settings/theme');
}

export async function saveTheme(colors: ThemeColors): Promise<{ message: string }> {
  return apiFetch('app-settings/theme', {
    method: 'POST',
    body: JSON.stringify({
      colorStart:  colors.colorStart,
      colorEnd:    colors.colorEnd,
      gradientDir: colors.gradientDir,
      mode:        colors.mode ?? 'light',
    }),
  });
}

/** Safely parse a hex color into r,g,b — returns null if invalid */
function parseHex(hex: string): [number, number, number] | null {
  const h    = hex.trim().replace('#', '');
  const full = h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

/** Apply gradient colors (admin-controlled). Dark/light is user-controlled separately. */
export function applyTheme(colorStart: string, colorEnd: string, gradientDir = '135deg', _mode?: 'light' | 'dark') {
  const root     = document.documentElement;
  const gradient = `linear-gradient(${gradientDir}, ${colorStart}, ${colorEnd})`;

  // Gradient & primary color
  root.style.setProperty('--color-gradient',  gradient);
  root.style.setProperty('--color-primary',   colorStart);
  root.style.setProperty('--color-secondary', colorEnd);

  const rgb = parseHex(colorStart);
  if (rgb) {
    const [r, g, b] = rgb;
    root.style.setProperty('--color-primary-rgb',         `${r},${g},${b}`);
    root.style.setProperty('--color-primary-light',       `rgba(${r},${g},${b},0.10)`);
    root.style.setProperty('--color-primary-light-solid', `rgb(${Math.min(255,r+180)},${Math.min(255,g+180)},${Math.min(255,b+180)})`);
    root.style.setProperty('--color-primary-text',        `rgb(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)})`);
  }

  // mode param kept for backward compat but user preference overrides via App.tsx
}

/** Compute shades used in the branding preview */
export function hexToRgbShades(hex: string) {
  const rgb = parseHex(hex);
  if (!rgb) return { light: 'rgba(22,163,74,0.12)', text: '#15803d' };
  const [r, g, b] = rgb;
  return {
    light: `rgba(${r},${g},${b},0.12)`,
    text:  `rgb(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)})`,
  };
}
