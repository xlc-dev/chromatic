import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import {
  readConfigFile,
  writeConfigFile,
  ensureDir,
  stripHash,
  updateNamedSection,
  type ConfigUpdate,
} from "../utils";

type FootColorKey =
  | "background"
  | "foreground"
  | "cursor"
  | "regular0"
  | "regular1"
  | "regular2"
  | "regular3"
  | "regular4"
  | "regular5"
  | "regular6"
  | "regular7"
  | "bright0"
  | "bright1"
  | "bright2"
  | "bright3"
  | "bright4"
  | "bright5"
  | "bright6"
  | "bright7";

export function configureFoot(scheme: ColorScheme, configPath?: string): void {
  const footConfigPath = configPath ?? join(homedir(), ".config", "foot", "foot.ini");
  ensureDir(dirname(footConfigPath));

  const colorMap: Record<FootColorKey, string> = {
    background: stripHash(scheme.background),
    foreground: stripHash(scheme.foreground),
    cursor: `${stripHash(scheme.background)} ${stripHash(scheme.foreground)}`,
    regular0: stripHash(scheme.black),
    regular1: stripHash(scheme.red),
    regular2: stripHash(scheme.green),
    regular3: stripHash(scheme.yellow),
    regular4: stripHash(scheme.blue),
    regular5: stripHash(scheme.magenta),
    regular6: stripHash(scheme.cyan),
    regular7: stripHash(scheme.white),
    bright0: stripHash(scheme.brightBlack),
    bright1: stripHash(scheme.brightRed),
    bright2: stripHash(scheme.brightGreen),
    bright3: stripHash(scheme.brightYellow),
    bright4: stripHash(scheme.brightBlue),
    bright5: stripHash(scheme.brightMagenta),
    bright6: stripHash(scheme.brightCyan),
    bright7: stripHash(scheme.brightWhite),
  };

  let footConfig = readConfigFile(footConfigPath);
  const updates: ConfigUpdate[] = Object.entries(colorMap).map(([key, value]) => ({
    pattern: new RegExp(`^\\s*${key}\\s*=\\s*.+$`, "m"),
    line: `${key}=${value}`,
  }));
  footConfig = updateNamedSection(footConfig, "colors-dark", updates);

  writeConfigFile(footConfigPath, footConfig);
}
