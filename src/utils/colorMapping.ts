import { type ColorScheme, defaultColorScheme } from "../types";
import { hsvToRgb, rgbToHex, rgbToHsv } from "./colorUtils";
import {
  type ExtractedColor,
  type RGB,
  calculateBrightness,
  colorDistance,
} from "./colorExtraction";

type PaletteSlot = "red" | "yellow" | "green" | "cyan" | "blue" | "magenta";

const SLOT_ORDER: PaletteSlot[] = ["red", "yellow", "green", "cyan", "blue", "magenta"];
const SLOT_HUES: Record<PaletteSlot, number> = {
  red: 0,
  yellow: 50,
  green: 120,
  cyan: 190,
  blue: 225,
  magenta: 300,
};

const MERGE_DISTANCE = 0.06;
const ACCENT_DISTANCE = 0.1;
const BACKGROUND_DISTANCE = 0.03;
const MIN_CONTRAST = 4.5;
const LIGHT_THEME_THRESHOLD = 0.45;
const NEUTRAL: RGB = { r: 128, g: 128, b: 128 };

function mix(first: RGB, second: RGB, ratio: number): RGB {
  return {
    r: Math.round(first.r + (second.r - first.r) * ratio),
    g: Math.round(first.g + (second.g - first.g) * ratio),
    b: Math.round(first.b + (second.b - first.b) * ratio),
  };
}

function lighten(color: RGB, amount: number): RGB {
  return mix(color, { r: 255, g: 255, b: 255 }, amount);
}

function darken(color: RGB, amount: number): RGB {
  return mix(color, { r: 0, g: 0, b: 0 }, amount);
}

function shade(color: RGB, amount: number): RGB {
  return amount >= 0 ? lighten(color, amount) : darken(color, -amount);
}

function hueOf(color: RGB): number {
  return rgbToHsv(color.r, color.g, color.b).h;
}

function saturationOf(color: RGB): number {
  return rgbToHsv(color.r, color.g, color.b).s;
}

function circularHueDistance(first: number, second: number): number {
  const difference = Math.abs(first - second) % 360;
  return Math.min(difference, 360 - difference);
}

function contrastRatio(first: RGB, second: RGB): number {
  const firstBrightness = calculateBrightness(first);
  const secondBrightness = calculateBrightness(second);
  const lighter = Math.max(firstBrightness, secondBrightness);
  const darker = Math.min(firstBrightness, secondBrightness);
  return (lighter + 0.05) / (darker + 0.05);
}

function vividness(entry: ExtractedColor): number {
  const saturation = saturationOf(entry.color);
  return entry.weight * (0.2 + saturation * saturation);
}

function mergeSimilarColors(colors: ExtractedColor[]): ExtractedColor[] {
  const merged: ExtractedColor[] = [];

  for (const entry of [...colors].sort((a, b) => b.weight - a.weight)) {
    const existing = merged.find(
      (candidate) => colorDistance(candidate.color, entry.color) < MERGE_DISTANCE
    );

    if (!existing) {
      merged.push({ color: entry.color, weight: entry.weight });
      continue;
    }

    const weight = existing.weight + entry.weight;
    const ratio = entry.weight / weight;
    existing.color = {
      r: Math.round(existing.color.r + (entry.color.r - existing.color.r) * ratio),
      g: Math.round(existing.color.g + (entry.color.g - existing.color.g) * ratio),
      b: Math.round(existing.color.b + (entry.color.b - existing.color.b) * ratio),
    };
    existing.weight = weight;
  }

  return merged.sort((a, b) => b.weight - a.weight);
}

interface Anchors {
  background: RGB;
  foreground: RGB;
  black: RGB;
  white: RGB;
}

function selectAnchors(colors: ExtractedColor[]): Anchors {
  const totalWeight = colors.reduce((sum, entry) => sum + entry.weight, 0);
  const weightedLuminance =
    colors.reduce((sum, entry) => sum + calculateBrightness(entry.color) * entry.weight, 0) /
    totalWeight;

  const substantial = colors.filter((entry) => entry.weight >= 0.03);
  const pool = substantial.length > 0 ? substantial : colors;
  const sorted = [...pool].sort(
    (first, second) => calculateBrightness(first.color) - calculateBrightness(second.color)
  );

  const darkest = sorted[0]?.color ?? { r: 0, g: 0, b: 0 };
  const lightest = sorted[sorted.length - 1]?.color ?? { r: 255, g: 255, b: 255 };
  const lightTheme = weightedLuminance > LIGHT_THEME_THRESHOLD;

  const background = lightTheme ? lighten(lightest, 0.12) : darken(darkest, 0.18);
  let foreground = lightTheme ? darkest : lightest;

  if (contrastRatio(foreground, background) < MIN_CONTRAST) {
    const pushTowardsWhite = calculateBrightness(background) < 0.18;
    for (let step = 1; step <= 10; step++) {
      const shifted = pushTowardsWhite
        ? lighten(foreground, step / 10)
        : darken(foreground, step / 10);
      if (contrastRatio(shifted, background) >= MIN_CONTRAST) {
        foreground = shifted;
        break;
      }
    }

    if (contrastRatio(foreground, background) < MIN_CONTRAST) {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      foreground =
        contrastRatio(black, background) >= contrastRatio(white, background) ? black : white;
    }
  }

  const black =
    calculateBrightness(background) <= calculateBrightness(foreground) ? background : foreground;
  const white = black === background ? foreground : background;

  return { background, foreground, black, white };
}

function accentScore(entry: ExtractedColor): number {
  const saturation = saturationOf(entry.color);
  return Math.sqrt(entry.weight) * (0.25 + saturation * saturation);
}

function selectAccents(colors: ExtractedColor[], anchors: Anchors): RGB[] {
  const selected: RGB[] = [];
  const candidates = colors
    .filter(
      (entry) =>
        colorDistance(entry.color, anchors.background) >= BACKGROUND_DISTANCE &&
        colorDistance(entry.color, anchors.foreground) >= BACKGROUND_DISTANCE
    )
    .sort((a, b) => accentScore(b) - accentScore(a));

  const isDistinct = (color: RGB) =>
    selected.every((existing) => colorDistance(existing, color) >= ACCENT_DISTANCE);

  const hasFreshHue = (color: RGB) => {
    if (saturationOf(color) < 0.2) return true;

    return selected.every(
      (existing) =>
        saturationOf(existing) < 0.2 || circularHueDistance(hueOf(color), hueOf(existing)) >= 25
    );
  };

  for (const entry of candidates) {
    if (selected.length >= SLOT_ORDER.length) break;
    if (isDistinct(entry.color) && hasFreshHue(entry.color)) {
      selected.push(entry.color);
    }
  }

  for (const entry of candidates) {
    if (selected.length >= SLOT_ORDER.length) break;
    if (isDistinct(entry.color)) {
      selected.push(entry.color);
    }
  }

  if (selected.length === 0) {
    const fallback = [...colors].sort((a, b) => vividness(b) - vividness(a))[0];
    if (fallback) {
      const amount = calculateBrightness(fallback.color) > 0.4 ? -0.35 : 0.35;
      selected.push(shade(fallback.color, amount));
    }
  }

  return selected;
}

function assignSlots(accents: RGB[]): Record<PaletteSlot, RGB> {
  const assigned = new Map<PaletteSlot, RGB>();
  const chromatic: RGB[] = [];
  const neutral: RGB[] = [];

  for (const color of accents) {
    if (saturationOf(color) < 0.15) {
      neutral.push(color);
    } else {
      chromatic.push(color);
    }
  }

  for (const color of [...chromatic].sort((a, b) => hueOf(a) - hueOf(b))) {
    const openSlots = SLOT_ORDER.filter((slot) => !assigned.has(slot));
    if (openSlots.length === 0) break;

    const hue = hueOf(color);
    const closest = openSlots.reduce((best, slot) =>
      circularHueDistance(hue, SLOT_HUES[slot]) < circularHueDistance(hue, SLOT_HUES[best])
        ? slot
        : best
    );
    assigned.set(closest, color);
  }

  for (const color of neutral) {
    const openSlot = SLOT_ORDER.find((slot) => !assigned.has(slot));
    if (!openSlot) break;
    assigned.set(openSlot, color);
  }

  let fillIndex = 0;
  for (const slot of SLOT_ORDER) {
    if (assigned.has(slot)) continue;

    let source: RGB | undefined;
    let sourceDistance = Infinity;
    for (const [candidate, color] of assigned) {
      const distance = circularHueDistance(SLOT_HUES[slot], SLOT_HUES[candidate]);
      if (distance < sourceDistance) {
        sourceDistance = distance;
        source = color;
      }
    }

    if (!source) {
      assigned.set(slot, NEUTRAL);
      continue;
    }

    const step = 0.22 + 0.1 * fillIndex;
    const amount = calculateBrightness(source) > 0.4 ? -step : step;
    assigned.set(slot, shade(source, amount));
    fillIndex++;
  }

  const result = {} as Record<PaletteSlot, RGB>;
  for (const slot of SLOT_ORDER) {
    result[slot] = assigned.get(slot) ?? NEUTRAL;
  }
  return result;
}

function brighten(color: RGB): RGB {
  const hsv = rgbToHsv(color.r, color.g, color.b);
  const brightened = hsvToRgb(hsv.h, Math.min(1, hsv.s + 0.08), Math.min(1, hsv.v + 0.18));

  return colorDistance(brightened, color) < 0.03 ? lighten(color, 0.2) : brightened;
}

function pickActiveBorder(accents: Record<PaletteSlot, RGB>): RGB {
  return SLOT_ORDER.map((slot) => accents[slot]).reduce((best, color) =>
    saturationOf(color) > saturationOf(best) ? color : best
  );
}

function pickUrgentBorder(accents: Record<PaletteSlot, RGB>, active: RGB): RGB {
  const warm = SLOT_ORDER.map((slot) => accents[slot])
    .filter((color) => saturationOf(color) >= 0.2)
    .sort((a, b) => circularHueDistance(hueOf(a), 0) - circularHueDistance(hueOf(b), 0))[0];

  return warm ?? lighten(active, 0.15);
}

export function mapColorsToScheme(extractedColors: ExtractedColor[]): ColorScheme {
  if (extractedColors.length === 0) {
    return defaultColorScheme;
  }

  const colors = mergeSimilarColors(extractedColors);
  if (colors.length === 0) {
    return defaultColorScheme;
  }

  const anchors = selectAnchors(colors);
  const accents = assignSlots(selectAccents(colors, anchors));
  const brights = {
    red: brighten(accents.red),
    yellow: brighten(accents.yellow),
    green: brighten(accents.green),
    cyan: brighten(accents.cyan),
    blue: brighten(accents.blue),
    magenta: brighten(accents.magenta),
  };

  const activeBorder = pickActiveBorder(accents);
  const urgentBorder = pickUrgentBorder(accents, activeBorder);
  const inactiveBorder = mix(anchors.background, anchors.foreground, 0.35);
  const brightBlack = lighten(anchors.black, 0.25);
  const brightWhite = lighten(anchors.white, 0.15);

  return {
    black: rgbToHex(anchors.black.r, anchors.black.g, anchors.black.b),
    red: rgbToHex(accents.red.r, accents.red.g, accents.red.b),
    green: rgbToHex(accents.green.r, accents.green.g, accents.green.b),
    yellow: rgbToHex(accents.yellow.r, accents.yellow.g, accents.yellow.b),
    blue: rgbToHex(accents.blue.r, accents.blue.g, accents.blue.b),
    magenta: rgbToHex(accents.magenta.r, accents.magenta.g, accents.magenta.b),
    cyan: rgbToHex(accents.cyan.r, accents.cyan.g, accents.cyan.b),
    white: rgbToHex(anchors.white.r, anchors.white.g, anchors.white.b),
    brightBlack: rgbToHex(brightBlack.r, brightBlack.g, brightBlack.b),
    brightRed: rgbToHex(brights.red.r, brights.red.g, brights.red.b),
    brightGreen: rgbToHex(brights.green.r, brights.green.g, brights.green.b),
    brightYellow: rgbToHex(brights.yellow.r, brights.yellow.g, brights.yellow.b),
    brightBlue: rgbToHex(brights.blue.r, brights.blue.g, brights.blue.b),
    brightMagenta: rgbToHex(brights.magenta.r, brights.magenta.g, brights.magenta.b),
    brightCyan: rgbToHex(brights.cyan.r, brights.cyan.g, brights.cyan.b),
    brightWhite: rgbToHex(brightWhite.r, brightWhite.g, brightWhite.b),
    background: rgbToHex(anchors.background.r, anchors.background.g, anchors.background.b),
    foreground: rgbToHex(anchors.foreground.r, anchors.foreground.g, anchors.foreground.b),
    activeBorder: rgbToHex(activeBorder.r, activeBorder.g, activeBorder.b),
    inactiveBorder: rgbToHex(inactiveBorder.r, inactiveBorder.g, inactiveBorder.b),
    urgentBorder: rgbToHex(urgentBorder.r, urgentBorder.g, urgentBorder.b),
  };
}
