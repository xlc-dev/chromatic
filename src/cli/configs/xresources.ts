import { join } from "path";
import { homedir } from "os";
import { ANSI_COLOR_KEYS, type ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

const ANSI_ORDER = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];

export function configureXresources(scheme: ColorScheme, configPath?: string): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\*\.foreground:\s+/m, line: `*.foreground: ${scheme.foreground}` },
    { pattern: /^\*\.background:\s+/m, line: `*.background: ${scheme.background}` },
    { pattern: /^\*\.cursorColor:\s+/m, line: `*.cursorColor: ${scheme.foreground}` },
    ...ANSI_ORDER.map((slot) => ({
      pattern: new RegExp(`^\\*\\.color${slot}:\\s+`, "m"),
      line: `*.color${slot}: ${scheme[ANSI_COLOR_KEYS[slot]!]}`,
    })),
  ];

  const resolvedConfigPath = configPath ?? join(homedir(), ".Xresources");
  updateConfigFile(resolvedConfigPath, null, updates);
}
