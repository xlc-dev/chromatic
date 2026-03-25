import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { updateConfigFile, type ConfigUpdate } from "../utils";

export function configureWindowManager(
  scheme: ColorScheme,
  wmName: "i3" | "sway",
  configPath?: string
): void {
  const updates: ConfigUpdate[] = [
    {
      pattern: /^\s*client\.focused\s+/m,
      line: `client.focused ${scheme.activeBorder} ${scheme.activeBorder} ${scheme.activeBorder}`,
    },
    {
      pattern: /^\s*client\.focused_inactive\s+/m,
      line: `client.focused_inactive ${scheme.inactiveBorder} ${scheme.inactiveBorder} ${scheme.inactiveBorder}`,
    },
    {
      pattern: /^\s*client\.unfocused\s+/m,
      line: `client.unfocused ${scheme.inactiveBorder} ${scheme.inactiveBorder} ${scheme.inactiveBorder}`,
    },
    {
      pattern: /^\s*client\.urgent\s+/m,
      line: `client.urgent ${scheme.urgentBorder} ${scheme.urgentBorder} ${scheme.urgentBorder}`,
    },
  ];

  const resolvedConfigPath = configPath ?? join(homedir(), ".config", wmName, "config");
  updateConfigFile(resolvedConfigPath, dirname(resolvedConfigPath), updates);
}

export function configureI3(scheme: ColorScheme, configPath?: string): void {
  configureWindowManager(scheme, "i3", configPath);
}
