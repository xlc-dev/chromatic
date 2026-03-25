import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, hexToRiverFormat, type ConfigUpdate } from "../utils";

export function configureMango(scheme: ColorScheme, configPath?: string): void {
  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*rootcolor\s*=\s*[^\n]+/m,
      line: `rootcolor=${hexToRiverFormat(scheme.background)}`,
    },
    {
      pattern: /^\s*bordercolor\s*=\s*[^\n]+/m,
      line: `bordercolor=${hexToRiverFormat(scheme.inactiveBorder)}`,
    },
    {
      pattern: /^\s*focuscolor\s*=\s*[^\n]+/m,
      line: `focuscolor=${hexToRiverFormat(scheme.activeBorder)}`,
    },
    {
      pattern: /^\s*maximizescreencolor\s*=\s*[^\n]+/m,
      line: `maximizescreencolor=${hexToRiverFormat(scheme.yellow)}`,
    },
    {
      pattern: /^\s*urgentcolor\s*=\s*[^\n]+/m,
      line: `urgentcolor=${hexToRiverFormat(scheme.urgentBorder)}`,
    },
    {
      pattern: /^\s*scratchpadcolor\s*=\s*[^\n]+/m,
      line: `scratchpadcolor=${hexToRiverFormat(scheme.magenta)}`,
    },
    {
      pattern: /^\s*globalcolor\s*=\s*[^\n]+/m,
      line: `globalcolor=${hexToRiverFormat(scheme.green)}`,
    },
    {
      pattern: /^\s*overlaycolor\s*=\s*[^\n]+/m,
      line: `overlaycolor=${hexToRiverFormat(scheme.blue)}`,
    },
  ];

  const resolvedConfigPath = configPath ?? join(homedir(), ".config", "mango", "config.conf");
  updateConfigFile(resolvedConfigPath, dirname(resolvedConfigPath), updates);
}
