import type { ColorScheme } from "../../types";
import { configureWindowManager } from "./i3";

export function configureSway(scheme: ColorScheme, configPath?: string): void {
  // Sway uses the same config format as i3
  configureWindowManager(scheme, "sway", configPath);
}
