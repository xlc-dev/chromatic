import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme, ColorSchemeKey } from "../../types";
import { updateConfigFile, hexToRiverFormat, type ConfigUpdate } from "../utils";

export function configureMango(scheme: ColorScheme, configPath?: string): void {
  const colorMap: Record<string, ColorSchemeKey> = {
    rootcolor: "background",
    bordercolor: "inactiveBorder",
    focuscolor: "activeBorder",
    maximizescreencolor: "yellow",
    urgentcolor: "urgentBorder",
    scratchpadcolor: "magenta",
    globalcolor: "green",
    overlaycolor: "blue",
  };

  const updates: ConfigUpdate[] = Object.entries(colorMap).map(([name, key]) => ({
    pattern: new RegExp(`^\\s*${name}\\s*=\\s*[^\\n]+`, "m"),
    line: `${name}=${hexToRiverFormat(scheme[key])}`,
  }));

  const resolvedConfigPath = configPath ?? join(homedir(), ".config", "mango", "config.conf");
  updateConfigFile(resolvedConfigPath, dirname(resolvedConfigPath), updates);
}
