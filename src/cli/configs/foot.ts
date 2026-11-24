import { dirname, join } from "path";
import { homedir } from "os";
import { ANSI_COLOR_KEYS, type ColorScheme } from "../../types";
import {
  readConfigFile,
  writeConfigFile,
  ensureDir,
  stripHash,
  updateNamedSection,
  type ConfigUpdate,
} from "../utils";

export function configureFoot(scheme: ColorScheme, configPath?: string): void {
  const footConfigPath = configPath ?? join(homedir(), ".config", "foot", "foot.ini");
  ensureDir(dirname(footConfigPath));

  const colorMap: Record<string, string> = {
    background: stripHash(scheme.background),
    foreground: stripHash(scheme.foreground),
    ...Object.fromEntries(
      ANSI_COLOR_KEYS.map((key, index) => [
        `${index < 8 ? "regular" : "bright"}${index % 8}`,
        stripHash(scheme[key]),
      ]),
    ),
  };

  let footConfig = readConfigFile(footConfigPath);
  const updates: ConfigUpdate[] = Object.entries(colorMap).map(([key, value]) => ({
    pattern: new RegExp(`^\\s*${key}\\s*=\\s*.+$`, "m"),
    line: `${key}=${value}`,
  }));
  footConfig = updateNamedSection(footConfig, "colors-dark", updates);

  writeConfigFile(footConfigPath, footConfig);
}
