import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

export function configureKitty(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\s*foreground\s+/m, line: `foreground ${scheme.foreground}` },
    { pattern: /^\s*background\s+/m, line: `background ${scheme.background}` },
    { pattern: /^\s*cursor\s+/m, line: `cursor ${scheme.foreground}` },
    { pattern: /^\s*color0\s+/m, line: `color0 ${scheme.black}` },
    { pattern: /^\s*color1\s+/m, line: `color1 ${scheme.red}` },
    { pattern: /^\s*color2\s+/m, line: `color2 ${scheme.green}` },
    { pattern: /^\s*color3\s+/m, line: `color3 ${scheme.yellow}` },
    { pattern: /^\s*color4\s+/m, line: `color4 ${scheme.blue}` },
    { pattern: /^\s*color5\s+/m, line: `color5 ${scheme.magenta}` },
    { pattern: /^\s*color6\s+/m, line: `color6 ${scheme.cyan}` },
    { pattern: /^\s*color7\s+/m, line: `color7 ${scheme.white}` },
    { pattern: /^\s*color8\s+/m, line: `color8 ${scheme.brightBlack}` },
    { pattern: /^\s*color9\s+/m, line: `color9 ${scheme.brightRed}` },
    { pattern: /^\s*color10\s+/m, line: `color10 ${scheme.brightGreen}` },
    { pattern: /^\s*color11\s+/m, line: `color11 ${scheme.brightYellow}` },
    { pattern: /^\s*color12\s+/m, line: `color12 ${scheme.brightBlue}` },
    { pattern: /^\s*color13\s+/m, line: `color13 ${scheme.brightMagenta}` },
    { pattern: /^\s*color14\s+/m, line: `color14 ${scheme.brightCyan}` },
    { pattern: /^\s*color15\s+/m, line: `color15 ${scheme.brightWhite}` },
  ];

  const configDir = join(homedir(), ".config", "kitty");
  updateConfigFile(join(configDir, "kitty.conf"), configDir, updates, "Kitty");
}
