import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import {
  readConfigFile,
  writeConfigFile,
  ensureDir,
  updateNamedSection,
  type ConfigUpdate,
} from "../utils";

function updatesForUrgency(
  frameColor: string,
  background: string,
  foreground: string
): ConfigUpdate[] {
  return [
    { pattern: /^\s*frame_color\s*=\s*[^\n]+/m, line: `frame_color = "${frameColor}"` },
    { pattern: /^\s*background\s*=\s*[^\n]+/m, line: `background = "${background}"` },
    { pattern: /^\s*foreground\s*=\s*[^\n]+/m, line: `foreground = "${foreground}"` },
  ];
}

export function configureDunst(scheme: ColorScheme, configPath?: string): void {
  const resolvedConfigPath = configPath ?? join(homedir(), ".config", "dunst", "dunstrc");
  ensureDir(dirname(resolvedConfigPath));
  let config = readConfigFile(resolvedConfigPath);

  config = updateNamedSection(
    config,
    "urgency_low",
    updatesForUrgency(scheme.inactiveBorder, scheme.background, scheme.foreground)
  );
  config = updateNamedSection(
    config,
    "urgency_normal",
    updatesForUrgency(scheme.activeBorder, scheme.background, scheme.foreground)
  );
  config = updateNamedSection(
    config,
    "urgency_critical",
    updatesForUrgency(scheme.urgentBorder, scheme.background, scheme.foreground)
  );

  writeConfigFile(resolvedConfigPath, config);
}
