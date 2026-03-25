import { basename, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { writeTheme } from "./vscode";

export function configureCursor(scheme: ColorScheme, extensionDir?: string): void {
  // Cursor uses the same theme format as VSCode
  const themeDirName = "chromatic-color-theme";
  const baseDir = extensionDir ?? join(homedir(), ".cursor", "extensions");
  const resolvedExtensionDir =
    basename(baseDir) === themeDirName ? baseDir : join(baseDir, themeDirName);
  writeTheme(scheme, resolvedExtensionDir);
}
