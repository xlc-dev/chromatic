import { homedir } from "os";
import { dirname, join } from "path";
import type { ColorScheme, ColorSchemeKey } from "../../types";
import {
  readConfigFile,
  writeConfigFile,
  ensureDir,
  updateOrAppendLine,
  type ConfigUpdate,
} from "../utils";

const ANSI_NAMES = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"] as const;
const BRIGHT_KEYS = [
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
] as const satisfies readonly ColorSchemeKey[];

export function configureAlacritty(scheme: ColorScheme, configPath?: string): void {
  const resolvedConfigPath =
    configPath ??
    (process.platform === "win32"
      ? join(
          process.env["APPDATA"] || join(homedir(), "AppData", "Roaming"),
          "alacritty",
          "alacritty.toml",
        )
      : join(homedir(), ".config", "alacritty", "alacritty.toml"));

  ensureDir(dirname(resolvedConfigPath));
  let config = readConfigFile(resolvedConfigPath);

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

  const updateSection = (section: "normal" | "bright", keys: readonly ColorSchemeKey[]) => {
    const sectionPattern = new RegExp(`\\[colors\\.${section}\\]([\\s\\S]*?)(?=\\[|$)`);
    const match = config.match(sectionPattern);
    if (!match?.[1]) return;

    let body = match[1];
    for (const [index, name] of ANSI_NAMES.entries()) {
      body = updateOrAppendLine(
        body,
        new RegExp(`^\\s*${name}\\s*=\\s*'[^']+'`, "m"),
        `${name} = '${scheme[keys[index]!]}'`,
      );
    }

    config = config.replace(sectionPattern, `[colors.${section}]${body}`);
  };

  updateSection("normal", ANSI_NAMES);
  updateSection("bright", BRIGHT_KEYS);

  writeConfigFile(resolvedConfigPath, config);
}
