import { apiFetch } from './client';

export interface ThemeColors {
  colorStart:   string;
  colorEnd:     string;
  gradientDir:  string;
  mode?:        'light' | 'dark';
  gradientText?: 'auto' | 'light' | 'dark';
}

export async function getTheme(): Promise<ThemeColors> {
  return apiFetch<ThemeColors>('app-settings/theme');
}

export async function saveTheme(colors: ThemeColors): Promise<{ message: string }> {
  return apiFetch('app-settings/theme', {
    method: 'POST',
    body: JSON.stringify({
      colorStart:   colors.colorStart,
      colorEnd:     colors.colorEnd,
      gradientDir:  colors.gradientDir,
      mode:         colors.mode        ?? 'light',
      gradientText: colors.gradientText ?? 'auto',
    }),
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

/** WCAG relative luminance (0 = black, 1 = white) */
function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = rgb;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Apply admin-controlled gradient colors as CSS custom properties on :root.
 * Automatically computes contrast-safe text colors for gradient backgrounds.
 */
export function applyTheme(
  colorStart:   string,
  colorEnd:     string,
  gradientDir  = '135deg',
  _mode?:       'light' | 'dark',
  gradientText: 'auto' | 'light' | 'dark' = 'auto',
) {
  const root     = document.documentElement;
  const gradient = `linear-gradient(${gradientDir}, ${colorStart}, ${colorEnd})`;

  // Core gradient variables
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

  // ── Text-on-gradient contrast variables ─────────────────────────────────
  // Determine if gradient background is perceptually "light" or "dark"
  let usesDarkText: boolean;
  if (gradientText === 'dark') {
    usesDarkText = true;    // admin forced dark text
  } else if (gradientText === 'light') {
    usesDarkText = false;   // admin forced light (white) text
  } else {
    // Auto: average luminance of both colors; threshold 0.30
    const lum = (luminance(colorStart) + luminance(colorEnd)) / 2;
    usesDarkText = lum > 0.30;
  }

  if (usesDarkText) {
    // Light gradient (gold, ivory, champagne, pale blue…) → dark text
    root.style.setProperty('--text-on-gradient',        '#0f172a');
    root.style.setProperty('--text-on-gradient-muted',  'rgba(15,23,42,0.72)');
    root.style.setProperty('--text-on-gradient-subtle', 'rgba(15,23,42,0.45)');
    root.style.setProperty('--border-on-gradient',      'rgba(0,0,0,0.15)');
    root.style.setProperty('--badge-bg-on-gradient',    'rgba(0,0,0,0.08)');
    root.style.setProperty('--badge-border-on-gradient','rgba(0,0,0,0.14)');
    root.style.setProperty('--card-bg-on-gradient',     'rgba(255,255,255,0.25)');
    root.style.setProperty('--gradient-text-accent',    '#0f172a');
  } else {
    // Dark gradient (green, navy, purple, crimson…) → white text
    root.style.setProperty('--text-on-gradient',        '#ffffff');
    root.style.setProperty('--text-on-gradient-muted',  'rgba(255,255,255,0.72)');
    root.style.setProperty('--text-on-gradient-subtle', 'rgba(255,255,255,0.45)');
    root.style.setProperty('--border-on-gradient',      'rgba(255,255,255,0.22)');
    root.style.setProperty('--badge-bg-on-gradient',    'rgba(255,255,255,0.14)');
    root.style.setProperty('--badge-border-on-gradient','rgba(255,255,255,0.22)');
    root.style.setProperty('--card-bg-on-gradient',     'rgba(255,255,255,0.05)');
    root.style.setProperty('--gradient-text-accent',    '#86efac');
  }
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
