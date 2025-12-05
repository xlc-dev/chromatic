import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

export type ConfigUpdate = {
  pattern: RegExp;
  line: string;
};

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function readConfigFile(filePath: string): string {
  return existsSync(filePath) ? readFileSync(filePath, "utf-8") : "";
}

export function writeConfigFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf-8");
}

export function updateOrAppendLine(content: string, linePattern: RegExp, newLine: string): string {
  const lines = content.split("\n");
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && linePattern.test(line)) {
      lines[i] = newLine;
      found = true;
      break;
    }
  }

  if (!found) {
    const trimmed = content.trimEnd();
    return trimmed + (trimmed ? "\n" : "") + newLine + "\n";
  }

  return lines.join("\n");
}

export function updateConfigFile(
  configPath: string,
  configDir: string | null,
  updates: ConfigUpdate[],
  appName: string,
  preprocess?: (content: string) => string
): void {
  if (configDir) {
    ensureDir(configDir);
  }

  let content = readConfigFile(configPath);

  if (preprocess) {
    content = preprocess(content);
  }

  for (const { pattern, line } of updates) {
    content = updateOrAppendLine(content, pattern, line);
  }

  writeConfigFile(configPath, content);
  console.log(`✓ Configured ${appName}`);
}

export function stripHash(hex: string): string {
  return hex.startsWith("#") ? hex.slice(1) : hex;
}

export function hexToRiverFormat(hex: string): string {
  const clean = stripHash(hex);
  return `0x${clean}ff`;
}
