export const themePresets = {
  blue:   { name: 'Blue',   primary: '#3b82f6', secondary: '#8b5cf6' },
  green:  { name: 'Green',  primary: '#10b981', secondary: '#06b6d4' },
  orange: { name: 'Orange', primary: '#f97316', secondary: '#eab308' },
  rose:   { name: 'Rose',   primary: '#f43f5e', secondary: '#ec4899' },
  indigo: { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6' },
};

export const defaultTheme = {
  mode: 'light',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
};

export function generateColorShades(hex) {
  const hsl = hexToHSL(hex);
  return {
    50:  hslToHex({ ...hsl, l: 95 }),
    100: hslToHex({ ...hsl, l: 90 }),
    200: hslToHex({ ...hsl, l: 80 }),
    300: hslToHex({ ...hsl, l: 70 }),
    400: hslToHex({ ...hsl, l: 60 }),
    500: hslToHex({ ...hsl, l: 50 }),
    600: hslToHex({ ...hsl, l: 40 }),
    700: hslToHex({ ...hsl, l: 30 }),
    800: hslToHex({ ...hsl, l: 22 }),
    900: hslToHex({ ...hsl, l: 15 }),
  };
}

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
