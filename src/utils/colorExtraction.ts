export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Cluster {
  centroid: RGB;
  points: RGB[];
}

export { rgbToHex } from "./colorUtils";

export function calculateDistance(color1: RGB, color2: RGB): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function calculateBrightness(color: RGB): number {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function kMeansClustering(pixels: RGB[], k: number, maxIterations: number = 20): RGB[] {
  if (pixels.length === 0) return [];
  if (k >= pixels.length) return pixels;

  const centroids: RGB[] = [];
  const firstPixel = pixels[Math.floor(Math.random() * pixels.length)];
  if (!firstPixel) return [];
  centroids.push(firstPixel);

  for (let i = 1; i < k; i++) {
    let maxDist = 0;
    let farthestPixel: RGB = pixels[0]!;

    for (const pixel of pixels) {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = calculateDistance(pixel, centroid);
        minDist = Math.min(minDist, dist);
      }
      if (minDist > maxDist) {
        maxDist = minDist;
        farthestPixel = pixel;
      }
    }
    centroids.push(farthestPixel);
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: Cluster[] = centroids.map((c) => ({ centroid: c, points: [] }));

    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        if (!centroid) continue;
        const dist = calculateDistance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = i;
        }
      }
      const cluster = clusters[nearestCluster];
      if (cluster) {
        cluster.points.push(pixel);
      }
    }

    let converged = true;
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (!cluster || cluster.points.length === 0) continue;

      const newCentroid: RGB = {
        r: Math.round(cluster.points.reduce((sum, p) => sum + p.r, 0) / cluster.points.length),
        g: Math.round(cluster.points.reduce((sum, p) => sum + p.g, 0) / cluster.points.length),
        b: Math.round(cluster.points.reduce((sum, p) => sum + p.b, 0) / cluster.points.length),
      };

      const oldCentroid = centroids[i];
      if (oldCentroid && calculateDistance(newCentroid, oldCentroid) > 1) {
        converged = false;
      }
      centroids[i] = newCentroid;
    }

    if (converged) break;
  }

  return centroids;
}

export function getImagePixels(imageData: ImageData): RGB[] {
  const pixels: RGB[] = [];
  const data = imageData.data;

  const sampleRate = Math.max(1, Math.floor((imageData.width * imageData.height) / 10000));

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r !== undefined && g !== undefined && b !== undefined) {
      pixels.push({ r, g, b });
    }
  }

  return pixels;
}

export function extractColors(imageData: ImageData, colorCount: number = 20): RGB[] {
  const pixels = getImagePixels(imageData);
  if (pixels.length === 0) return [];

  const k = Math.min(colorCount, pixels.length);
  return kMeansClustering(pixels, k);
}
