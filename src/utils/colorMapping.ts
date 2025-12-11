import { type ColorScheme, defaultColorScheme } from "../types";
import { type RGB, calculateBrightness, rgbToHex, calculateDistance } from "./colorExtraction";

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

function increaseLightness(color: RGB, factor: number = 0.35): RGB {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  const newL = Math.min(1, hsl.l + factor);

  const c = (1 - Math.abs(2 * newL - 1)) * hsl.s;
  const x = c * (1 - Math.abs(((hsl.h / 60) % 2) - 1));
  const m = newL - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (hsl.h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hsl.h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hsl.h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hsl.h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hsl.h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function calculateSaturation(color: RGB): number {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return hsl.s;
}

type ColorCategory = "red" | "green" | "blue" | "yellow" | "magenta" | "cyan" | "neutral";

function getHueCategory(hue: number): ColorCategory {
  if (hue < 15 || hue >= 345) return "red";
  if (hue >= 15 && hue < 45) return "yellow";
  if (hue >= 45 && hue < 75) return "green";
  if (hue >= 75 && hue < 165) return "cyan";
  if (hue >= 165 && hue < 255) return "blue";
  if (hue >= 255 && hue < 315) return "magenta";
  return "neutral";
}

function filterSimilarColors(colors: RGB[], minDistance: number = 30): RGB[] {
  const filtered: RGB[] = [];
  for (const color of colors) {
    const isSimilar = filtered.some((existing) => calculateDistance(color, existing) < minDistance);
    if (!isSimilar) {
      filtered.push(color);
    }
  }
  return filtered;
}

export function mapColorsToScheme(extractedColors: RGB[]): ColorScheme {
  if (extractedColors.length === 0) {
    return defaultColorScheme;
  }

  const filteredColors = filterSimilarColors(extractedColors, 25);
  const sortedByBrightness = [...filteredColors].sort(
    (a, b) => calculateBrightness(a) - calculateBrightness(b)
  );

  const darkest = sortedByBrightness[0];
  const lightest = sortedByBrightness[sortedByBrightness.length - 1];

  if (!darkest || !lightest) {
    return defaultColorScheme;
  }

  const bgBrightness = calculateBrightness(darkest);
  const fgBrightness = calculateBrightness(lightest);

  let background = darkest;
  let foreground = lightest;

  if (fgBrightness - bgBrightness < 0.4) {
    const darken = Math.max(30, Math.floor((0.4 - (fgBrightness - bgBrightness)) * 100));
    const lighten = Math.max(30, Math.floor((0.4 - (fgBrightness - bgBrightness)) * 100));
    background = {
      r: Math.max(0, darkest.r - darken),
      g: Math.max(0, darkest.g - darken),
      b: Math.max(0, darkest.b - darken),
    };
    foreground = {
      r: Math.min(255, lightest.r + lighten),
      g: Math.min(255, lightest.g + lighten),
      b: Math.min(255, lightest.b + lighten),
    };
  }

  const colorCategories: Record<ColorCategory, RGB[]> = {
    red: [],
    green: [],
    blue: [],
    yellow: [],
    magenta: [],
    cyan: [],
    neutral: [],
  };

  for (const color of filteredColors) {
    const hsl = rgbToHsl(color.r, color.g, color.b);
    if (hsl.s > 0.1) {
      const category = getHueCategory(hsl.h);
      colorCategories[category].push(color);
    } else {
      colorCategories.neutral.push(color);
    }
  }

  for (const category in colorCategories) {
    const typedCategory = category as ColorCategory;
    colorCategories[typedCategory].sort((a, b) => {
      const satA = calculateSaturation(a);
      const satB = calculateSaturation(b);
      if (Math.abs(satA - satB) < 0.1) {
        return calculateBrightness(b) - calculateBrightness(a);
      }
      return satB - satA;
    });
  }

  const assignColor = (category: ColorCategory, index: number = 0): RGB => {
    const colors = colorCategories[category];
    if (colors.length > index) {
      const color = colors[index];
      if (color) return color;
    }
    if (colorCategories.neutral.length > 0) {
      const neutral = colorCategories.neutral[0];
      if (neutral) return neutral;
    }
    return { r: 128, g: 128, b: 128 };
  };

  const getBrightColor = (category: ColorCategory, baseColor: RGB): RGB => {
    const colors = colorCategories[category];
    if (colors.length > 1) {
      const brightColors = colors.filter((c) => {
        const dist = calculateDistance(c, baseColor);
        return dist > 20 && calculateBrightness(c) > calculateBrightness(baseColor);
      });
      if (brightColors.length > 0) {
        const bright = brightColors[0];
        if (bright) return bright;
      }
      const secondColor = colors[1];
      if (secondColor) return secondColor;
    }
    return increaseLightness(baseColor, 0.4);
  };

  const red = assignColor("red");
  const green = assignColor("green");
  const yellow = assignColor("yellow");
  const blue = assignColor("blue");
  const magenta = assignColor("magenta");
  const cyan = assignColor("cyan");

  const black = darkest;
  const white = lightest;

  const brightRed = getBrightColor("red", red);
  const brightGreen = getBrightColor("green", green);
  const brightYellow = getBrightColor("yellow", yellow);
  const brightBlue = getBrightColor("blue", blue);
  const brightMagenta = getBrightColor("magenta", magenta);
  const brightCyan = getBrightColor("cyan", cyan);

  const brightBlack =
    sortedByBrightness.length > 1
      ? (sortedByBrightness[Math.min(3, sortedByBrightness.length - 1)] ??
        increaseLightness(black, 0.25))
      : increaseLightness(black, 0.25);
  const brightWhite =
    sortedByBrightness.length > 1
      ? (sortedByBrightness[Math.max(sortedByBrightness.length - 2, 0)] ??
        increaseLightness(white, 0.15))
      : increaseLightness(white, 0.15);

  const vibrantColors = filteredColors.filter((c) => calculateSaturation(c) > 0.3);
  vibrantColors.sort((a, b) => {
    const satDiff = calculateSaturation(b) - calculateSaturation(a);
    if (Math.abs(satDiff) < 0.1) {
      return calculateBrightness(b) - calculateBrightness(a);
    }
    return satDiff;
  });

  const activeBorder =
    vibrantColors.length > 0 && vibrantColors[0]
      ? vibrantColors[0]
      : blue.r + blue.g + blue.b > 200
        ? blue
        : (filteredColors[Math.floor(filteredColors.length * 0.7)] ?? blue);

  const redColors = vibrantColors.filter(
    (c) => getHueCategory(rgbToHsl(c.r, c.g, c.b).h) === "red"
  );
  const urgentBorder =
    redColors.length > 0 && redColors[0]
      ? redColors[0]
      : red.r > 150
        ? red
        : (vibrantColors[1] ?? red);

  const midBrightnessIdx = Math.floor(sortedByBrightness.length * 0.4);
  const inactiveBorderIdx = Math.floor(sortedByBrightness.length / 2);
  const inactiveBorder = sortedByBrightness[midBrightnessIdx] ??
    sortedByBrightness[inactiveBorderIdx] ?? { r: 128, g: 128, b: 128 };

  return {
    black: rgbToHex(black.r, black.g, black.b),
    red: rgbToHex(red.r, red.g, red.b),
    green: rgbToHex(green.r, green.g, green.b),
    yellow: rgbToHex(yellow.r, yellow.g, yellow.b),
    blue: rgbToHex(blue.r, blue.g, blue.b),
    magenta: rgbToHex(magenta.r, magenta.g, magenta.b),
    cyan: rgbToHex(cyan.r, cyan.g, cyan.b),
    white: rgbToHex(white.r, white.g, white.b),
    brightBlack: rgbToHex(brightBlack.r, brightBlack.g, brightBlack.b),
    brightRed: rgbToHex(brightRed.r, brightRed.g, brightRed.b),
    brightGreen: rgbToHex(brightGreen.r, brightGreen.g, brightGreen.b),
    brightYellow: rgbToHex(brightYellow.r, brightYellow.g, brightYellow.b),
    brightBlue: rgbToHex(brightBlue.r, brightBlue.g, brightBlue.b),
    brightMagenta: rgbToHex(brightMagenta.r, brightMagenta.g, brightMagenta.b),
    brightCyan: rgbToHex(brightCyan.r, brightCyan.g, brightCyan.b),
    brightWhite: rgbToHex(brightWhite.r, brightWhite.g, brightWhite.b),
    background: rgbToHex(background.r, background.g, background.b),
    foreground: rgbToHex(foreground.r, foreground.g, foreground.b),
    activeBorder: rgbToHex(activeBorder.r, activeBorder.g, activeBorder.b),
    inactiveBorder: rgbToHex(inactiveBorder.r, inactiveBorder.g, inactiveBorder.b),
    urgentBorder: rgbToHex(urgentBorder.r, urgentBorder.g, urgentBorder.b),
  };
}
