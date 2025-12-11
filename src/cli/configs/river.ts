import { join } from "path";
import { homedir } from "os";
import { execSync } from "child_process";
import { type ColorScheme } from "../../types";
import { updateConfigFile, hexToRiverFormat, type ConfigUpdate } from "../utils";

export function configureRiver(scheme: ColorScheme): void {
  const backgroundColor = hexToRiverFormat(scheme.background);
  const focusedColor = hexToRiverFormat(scheme.activeBorder);
  const unfocusedColor = hexToRiverFormat(scheme.inactiveBorder);
  const urgentColor = hexToRiverFormat(scheme.urgentBorder);

  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*riverctl background-color\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl background-color ${backgroundColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-focused\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-focused ${focusedColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-unfocused\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-unfocused ${unfocusedColor}`,
    },
    {
      pattern: /^\s*riverctl border-color-urgent\s+0x[0-9a-fA-F]{8}/m,
      line: `riverctl border-color-urgent ${urgentColor}`,
    },
  ];

  const configDir = join(homedir(), ".config", "river");
  updateConfigFile(join(configDir, "init"), configDir, updates);

  try {
    execSync(`riverctl background-color ${backgroundColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-focused ${focusedColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-unfocused ${unfocusedColor}`, { stdio: "ignore" });
    execSync(`riverctl border-color-urgent ${urgentColor}`, { stdio: "ignore" });
  } catch (error) {}
}
