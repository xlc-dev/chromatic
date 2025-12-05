import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

export function configureVim(scheme: ColorScheme): void {
  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*let g:terminal_color_0\s*=/m,
      line: `let g:terminal_color_0  = '${scheme.black}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_1\s*=/m,
      line: `let g:terminal_color_1  = '${scheme.red}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_2\s*=/m,
      line: `let g:terminal_color_2  = '${scheme.green}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_3\s*=/m,
      line: `let g:terminal_color_3  = '${scheme.yellow}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_4\s*=/m,
      line: `let g:terminal_color_4  = '${scheme.blue}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_5\s*=/m,
      line: `let g:terminal_color_5  = '${scheme.magenta}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_6\s*=/m,
      line: `let g:terminal_color_6  = '${scheme.cyan}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_7\s*=/m,
      line: `let g:terminal_color_7  = '${scheme.white}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_8\s*=/m,
      line: `let g:terminal_color_8  = '${scheme.brightBlack}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_9\s*=/m,
      line: `let g:terminal_color_9  = '${scheme.brightRed}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_10\s*=/m,
      line: `let g:terminal_color_10 = '${scheme.brightGreen}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_11\s*=/m,
      line: `let g:terminal_color_11 = '${scheme.brightYellow}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_12\s*=/m,
      line: `let g:terminal_color_12 = '${scheme.brightBlue}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_13\s*=/m,
      line: `let g:terminal_color_13 = '${scheme.brightMagenta}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_14\s*=/m,
      line: `let g:terminal_color_14 = '${scheme.brightCyan}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_15\s*=/m,
      line: `let g:terminal_color_15 = '${scheme.brightWhite}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_background\s*=/m,
      line: `let g:terminal_color_background = '${scheme.background}'`,
    },
    {
      pattern: /^\s*let g:terminal_color_foreground\s*=/m,
      line: `let g:terminal_color_foreground = '${scheme.foreground}'`,
    },
  ];

  updateConfigFile(join(homedir(), ".vimrc"), null, updates, "Vim");
}
