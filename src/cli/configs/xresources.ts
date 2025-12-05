import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

export function configureXresources(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    { pattern: /^\*\.foreground:\s+/m, line: `*.foreground: ${scheme.foreground}` },
    { pattern: /^\*\.background:\s+/m, line: `*.background: ${scheme.background}` },
    { pattern: /^\*\.cursorColor:\s+/m, line: `*.cursorColor: ${scheme.foreground}` },
    { pattern: /^\*\.color0:\s+/m, line: `*.color0: ${scheme.black}` },
    { pattern: /^\*\.color8:\s+/m, line: `*.color8: ${scheme.brightBlack}` },
    { pattern: /^\*\.color1:\s+/m, line: `*.color1: ${scheme.red}` },
    { pattern: /^\*\.color9:\s+/m, line: `*.color9: ${scheme.brightRed}` },
    { pattern: /^\*\.color2:\s+/m, line: `*.color2: ${scheme.green}` },
    { pattern: /^\*\.color10:\s+/m, line: `*.color10: ${scheme.brightGreen}` },
    { pattern: /^\*\.color3:\s+/m, line: `*.color3: ${scheme.yellow}` },
    { pattern: /^\*\.color11:\s+/m, line: `*.color11: ${scheme.brightYellow}` },
    { pattern: /^\*\.color4:\s+/m, line: `*.color4: ${scheme.blue}` },
    { pattern: /^\*\.color12:\s+/m, line: `*.color12: ${scheme.brightBlue}` },
    { pattern: /^\*\.color5:\s+/m, line: `*.color5: ${scheme.magenta}` },
    { pattern: /^\*\.color13:\s+/m, line: `*.color13: ${scheme.brightMagenta}` },
    { pattern: /^\*\.color6:\s+/m, line: `*.color6: ${scheme.cyan}` },
    { pattern: /^\*\.color14:\s+/m, line: `*.color14: ${scheme.brightCyan}` },
    { pattern: /^\*\.color7:\s+/m, line: `*.color7: ${scheme.white}` },
    { pattern: /^\*\.color15:\s+/m, line: `*.color15: ${scheme.brightWhite}` },
  ];

  updateConfigFile(join(homedir(), ".Xresources"), null, updates, "Xresources");
}
