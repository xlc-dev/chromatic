import { dirname, join } from "path";
import { homedir } from "os";
import { ANSI_COLOR_KEYS, type ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

export function configureKitty(scheme: ColorScheme, configPath?: string): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\s*foreground\s+/m, line: `foreground ${scheme.foreground}` },
    { pattern: /^\s*background\s+/m, line: `background ${scheme.background}` },
    { pattern: /^\s*cursor\s+/m, line: `cursor ${scheme.foreground}` },
    ...ANSI_COLOR_KEYS.map((key, index) => ({
      pattern: new RegExp(`^\\s*color${index}\\s+`, "m"),
      line: `color${index} ${scheme[key]}`,
    })),
  ];

  const resolvedConfigPath = configPath ?? join(homedir(), ".config", "kitty", "kitty.conf");
  updateConfigFile(resolvedConfigPath, dirname(resolvedConfigPath), updates);
}
