import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, stripHash, type ConfigUpdate } from "../utils";

function toRgba(hex: string): string {
  const clean = stripHash(hex);
  return `rgba(${clean}ff)`;
}

export function configureHyprland(scheme: ColorScheme): void {
  const activeBorder = toRgba(scheme.activeBorder);
  const inactiveBorder = toRgba(scheme.inactiveBorder);
  const urgentBorder = toRgba(scheme.urgentBorder);

  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*col\.active_border\s*=\s*[^\n]+/m,
      line: `col.active_border = ${activeBorder}`,
    },
    {
      pattern: /^\s*col\.inactive_border\s*=\s*[^\n]+/m,
      line: `col.inactive_border = ${inactiveBorder}`,
    },
    {
      pattern: /^\s*col\.urgent_border\s*=\s*[^\n]+/m,
      line: `col.urgent_border = ${urgentBorder}`,
    },
  ];

  const configDir = join(homedir(), ".config", "hypr");
  const configPath = join(configDir, "hyprland.conf");
  updateConfigFile(configPath, configDir, updates);
}
