import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { ensureDir, writeConfigFile } from "../utils";

export function configureRofi(scheme: ColorScheme): void {
  const configDir = join(homedir(), ".config", "rofi");
  const themePath = join(configDir, "chromatic.rasi");

  ensureDir(configDir);

  const rasi = `* {
  background-color: ${scheme.background};
  text-color: ${scheme.foreground};
  border-color: ${scheme.inactiveBorder};
}

window {
  background-color: ${scheme.background};
  border: 1px;
  border-color: ${scheme.inactiveBorder};
}

inputbar {
  background-color: ${scheme.background};
  text-color: ${scheme.foreground};
}

listview {
  background-color: ${scheme.background};
  text-color: ${scheme.foreground};
}

element {
  background-color: ${scheme.background};
  text-color: ${scheme.foreground};
}

element selected normal,
element alternate selected normal {
  background-color: ${scheme.activeBorder};
  text-color: ${scheme.background};
}

element-icon {
  background-color: transparent;
  text-color: ${scheme.foreground};
}

element selected element-icon,
element alternate selected element-icon {
  background-color: transparent;
  text-color: ${scheme.background};
}
`;

  writeConfigFile(themePath, rasi);
}
