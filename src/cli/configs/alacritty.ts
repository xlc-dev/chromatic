import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { readConfigFile, writeConfigFile, ensureDir, updateOrAppendLine, type ConfigUpdate } from "../utils";

export function configureAlacritty(scheme: ColorScheme): void {
  const configDir = join(homedir(), ".config", "alacritty");
  const configPath = join(configDir, "alacritty.toml");

  ensureDir(configDir);
  let config = readConfigFile(configPath);

  if (!config.includes("[colors]")) config += "\n[colors]\n";
  if (!config.includes("[colors.normal]")) config += "\n[colors.normal]\n";
  if (!config.includes("[colors.bright]")) config += "\n[colors.bright]\n";

  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*primary\.background\s*=\s*'[^']+'/m,
      line: `primary.background = '${scheme.background}'`,
    },
    {
      pattern: /^\s*primary\.foreground\s*=\s*'[^']+'/m,
      line: `primary.foreground = '${scheme.foreground}'`,
    },
    { pattern: /^\s*cursor\.text\s*=\s*'[^']+'/m, line: `cursor.text = '${scheme.background}'` },
    {
      pattern: /^\s*cursor\.cursor\s*=\s*'[^']+'/m,
      line: `cursor.cursor = '${scheme.foreground}'`,
    },
  ];

  for (const { pattern, line } of updates) {
    config = updateOrAppendLine(config, pattern, line);
  }

  const normalSectionMatch = config.match(/\[colors\.normal\]([\s\S]*?)(?=\[|$)/);
  if (normalSectionMatch && normalSectionMatch[1]) {
    let normalSection = normalSectionMatch[1];
    const normalUpdates: ConfigUpdate[] = [
      { pattern: /^\s*black\s*=\s*'[^']+'/m, line: `black = '${scheme.black}'` },
      { pattern: /^\s*red\s*=\s*'[^']+'/m, line: `red = '${scheme.red}'` },
      { pattern: /^\s*green\s*=\s*'[^']+'/m, line: `green = '${scheme.green}'` },
      { pattern: /^\s*yellow\s*=\s*'[^']+'/m, line: `yellow = '${scheme.yellow}'` },
      { pattern: /^\s*blue\s*=\s*'[^']+'/m, line: `blue = '${scheme.blue}'` },
      { pattern: /^\s*magenta\s*=\s*'[^']+'/m, line: `magenta = '${scheme.magenta}'` },
      { pattern: /^\s*cyan\s*=\s*'[^']+'/m, line: `cyan = '${scheme.cyan}'` },
      { pattern: /^\s*white\s*=\s*'[^']+'/m, line: `white = '${scheme.white}'` },
    ];
    for (const { pattern, line } of normalUpdates) {
      normalSection = updateOrAppendLine(normalSection, pattern, line);
    }
    config = config.replace(
      /\[colors\.normal\]([\s\S]*?)(?=\[|$)/,
      `[colors.normal]${normalSection}`
    );
  }

  const brightSectionMatch = config.match(/\[colors\.bright\]([\s\S]*?)(?=\[|$)/);
  if (brightSectionMatch && brightSectionMatch[1]) {
    let brightSection = brightSectionMatch[1];
    const brightUpdates: ConfigUpdate[] = [
      { pattern: /^\s*black\s*=\s*'[^']+'/m, line: `black = '${scheme.brightBlack}'` },
      { pattern: /^\s*red\s*=\s*'[^']+'/m, line: `red = '${scheme.brightRed}'` },
      { pattern: /^\s*green\s*=\s*'[^']+'/m, line: `green = '${scheme.brightGreen}'` },
      { pattern: /^\s*yellow\s*=\s*'[^']+'/m, line: `yellow = '${scheme.brightYellow}'` },
      { pattern: /^\s*blue\s*=\s*'[^']+'/m, line: `blue = '${scheme.brightBlue}'` },
      { pattern: /^\s*magenta\s*=\s*'[^']+'/m, line: `magenta = '${scheme.brightMagenta}'` },
      { pattern: /^\s*cyan\s*=\s*'[^']+'/m, line: `cyan = '${scheme.brightCyan}'` },
      { pattern: /^\s*white\s*=\s*'[^']+'/m, line: `white = '${scheme.brightWhite}'` },
    ];
    for (const { pattern, line } of brightUpdates) {
      brightSection = updateOrAppendLine(brightSection, pattern, line);
    }
    config = config.replace(
      /\[colors\.bright\]([\s\S]*?)(?=\[|$)/,
      `[colors.bright]${brightSection}`
    );
  }

  writeConfigFile(configPath, config);
  console.log("✓ Configured Alacritty");
}
