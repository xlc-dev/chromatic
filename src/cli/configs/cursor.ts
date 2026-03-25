import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { writeTheme } from "./vscode";

export function configureCursor(scheme: ColorScheme, extensionDir?: string): void {
  // Cursor uses the same theme format as VSCode
  const resolvedExtensionDir =
    extensionDir ?? join(homedir(), ".cursor", "extensions", "chromatic-color-theme");
  writeTheme(scheme, resolvedExtensionDir);
}
