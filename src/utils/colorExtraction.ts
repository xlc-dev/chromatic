export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ExtractedColor {
  color: RGB;
  weight: number;
}

interface Lab {
  lightness: number;
  a: number;
  b: number;
}

interface Sample {
  color: RGB;
  lab: Lab;
}

interface ClusterSums {
  lab: Lab;
  red: number;
  green: number;
  blue: number;
  count: number;
}

const MAX_SAMPLES = 12000;
const MAX_ITERATIONS = 24;
const CONVERGENCE = 0.0002;
const MIN_CLUSTER_SHARE = 0.01;
const RANDOM_SEED = 0x9e3779b9;

export function calculateBrightness(color: RGB): number {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function srgbToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function toOklab(color: RGB): Lab {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function squaredLabDistance(first: Lab, second: Lab): number {
  const dl = first.lightness - second.lightness;
  const da = first.a - second.a;
  const db = first.b - second.b;
  return dl * dl + da * da + db * db;
}

export function colorDistance(first: RGB, second: RGB): number {
  return Math.sqrt(squaredLabDistance(toOklab(first), toOklab(second)));
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function readSamples(imageData: ImageData): Sample[] {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  if (width <= 0 || height <= 0) return [];

  const step = Math.max(1, Math.ceil(Math.sqrt((width * height) / MAX_SAMPLES)));
  const offset = Math.floor(step / 2);
  const samples: Sample[] = [];

  for (let y = offset; y < height; y += step) {
    for (let x = offset; x < width; x += step) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      if (alpha === undefined || alpha < 8) continue;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      if (r === undefined || g === undefined || b === undefined) continue;

      const color = { r, g, b };
      samples.push({ color, lab: toOklab(color) });
    }
  }

  return samples;
}

function pickInitialCentroids(samples: Sample[], k: number, random: () => number): Lab[] {
  const firstIndex = Math.floor(random() * samples.length);
  const centroids: Lab[] = [samples[firstIndex]!.lab];
  const nearestDistances = new Float64Array(samples.length).fill(Infinity);

  while (centroids.length < k) {
    const latest = centroids[centroids.length - 1]!;
    let total = 0;

    for (let i = 0; i < samples.length; i++) {
      const distance = squaredLabDistance(samples[i]!.lab, latest);
      if (distance < nearestDistances[i]!) {
        nearestDistances[i] = distance;
      }
      total += nearestDistances[i]!;
    }

    if (total <= 0) break;

    let target = random() * total;
    let chosen = samples.length - 1;
    for (let i = 0; i < samples.length; i++) {
      target -= nearestDistances[i]!;
      if (target <= 0) {
        chosen = i;
        break;
      }
    }

    centroids.push(samples[chosen]!.lab);
  }

  return centroids;
}

function assignSamples(samples: Sample[], centroids: Lab[]): Int32Array {
  const assignment = new Int32Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    let nearest = 0;
    let nearestDistance = Infinity;

    for (let c = 0; c < centroids.length; c++) {
      const distance = squaredLabDistance(samples[i]!.lab, centroids[c]!);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = c;
      }
    }

    assignment[i] = nearest;
  }

  return assignment;
}

function accumulate(
  samples: Sample[],
  assignment: Int32Array,
  clusterCount: number
): ClusterSums[] {
  const sums: ClusterSums[] = Array.from({ length: clusterCount }, () => ({
    lab: { lightness: 0, a: 0, b: 0 },
    red: 0,
    green: 0,
    blue: 0,
    count: 0,
  }));

  for (let i = 0; i < samples.length; i++) {
    const sum = sums[assignment[i]!];
    const sample = samples[i];
    if (!sum || !sample) continue;

    sum.lab.lightness += sample.lab.lightness;
    sum.lab.a += sample.lab.a;
    sum.lab.b += sample.lab.b;
    sum.red += sample.color.r;
    sum.green += sample.color.g;
    sum.blue += sample.color.b;
    sum.count++;
  }

  return sums;
}

function kMeansClustering(samples: Sample[], k: number): ExtractedColor[] {
  const random = createRandom(RANDOM_SEED);
  const centroids = pickInitialCentroids(samples, Math.min(k, samples.length), random);
  const clusterCount = centroids.length;
  let assignment = assignSamples(samples, centroids);

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const sums = accumulate(samples, assignment, clusterCount);
    let maxShift = 0;

    for (let c = 0; c < clusterCount; c++) {
      const sum = sums[c]!;
      if (sum.count === 0) continue;

      const next: Lab = {
        lightness: sum.lab.lightness / sum.count,
        a: sum.lab.a / sum.count,
        b: sum.lab.b / sum.count,
      };
      maxShift = Math.max(maxShift, squaredLabDistance(next, centroids[c]!));
      centroids[c] = next;
    }

    for (let c = 0; c < clusterCount; c++) {
      if (sums[c]!.count > 0) continue;

      let farthestIndex = 0;
      let farthestDistance = -1;
      for (let i = 0; i < samples.length; i++) {
        const distance = squaredLabDistance(samples[i]!.lab, centroids[assignment[i]!]!);
        if (distance > farthestDistance) {
          farthestDistance = distance;
          farthestIndex = i;
        }
      }
      centroids[c] = { ...samples[farthestIndex]!.lab };
      maxShift = Math.max(maxShift, 1);
    }

    if (maxShift < CONVERGENCE * CONVERGENCE) break;

    assignment = assignSamples(samples, centroids);
  }

  const sums = accumulate(samples, assignSamples(samples, centroids), clusterCount);
  const total = samples.length;
  const extracted: ExtractedColor[] = [];

  for (const sum of sums) {
    if (sum.count === 0) continue;

    extracted.push({
      color: {
        r: Math.round(sum.red / sum.count),
        g: Math.round(sum.green / sum.count),
        b: Math.round(sum.blue / sum.count),
      },
      weight: sum.count / total,
    });
  }

  return extracted
    .filter((entry) => entry.weight >= MIN_CLUSTER_SHARE)
    .sort((first, second) => second.weight - first.weight);
}

export function extractColors(imageData: ImageData, colorCount: number = 12): ExtractedColor[] {
  const samples = readSamples(imageData);
  if (samples.length === 0) return [];

  const k = Math.max(1, Math.min(colorCount, samples.length));
  return kMeansClustering(samples, k);
}
