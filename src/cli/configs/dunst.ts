import { dirname, join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { readConfigFile, writeConfigFile, ensureDir, updateOrAppendLine } from "../utils";

function updateSection(
  config: string,
  sectionName: string,
  frameColor: string,
  background: string,
  foreground: string
): string {
  const sectionRegex = new RegExp(`(\\[${sectionName}\\])([\\s\\S]*?)(?=\\n\\[|$)`, "m");
  const match = config.match(sectionRegex);
  let sectionContent: string;
  if (match && match[2]) {
    sectionContent = match[2];
    sectionContent = updateOrAppendLine(
      sectionContent,
      /^\s*frame_color\s*=\s*[^\n]+/m,
      `frame_color = "${frameColor}"`
    );
    sectionContent = updateOrAppendLine(
      sectionContent,
      /^\s*background\s*=\s*[^\n]+/m,
      `background = "${background}"`
    );
    sectionContent = updateOrAppendLine(
      sectionContent,
      /^\s*foreground\s*=\s*[^\n]+/m,
      `foreground = "${foreground}"`
    );
    return config.replace(sectionRegex, match[1] + sectionContent);
  }
  const newSection = `\n[${sectionName}]\nframe_color = "${frameColor}"\nbackground = "${background}"\nforeground = "${foreground}"\n`;
  return config.trimEnd() + newSection;
}

export function configureDunst(scheme: ColorScheme, configPath?: string): void {
  const resolvedConfigPath = configPath ?? join(homedir(), ".config", "dunst", "dunstrc");
  ensureDir(dirname(resolvedConfigPath));
  let config = readConfigFile(resolvedConfigPath);

  config = updateSection(
    config,
    "urgency_low",
    scheme.inactiveBorder,
    scheme.background,
    scheme.foreground
  );
  config = updateSection(
    config,
    "urgency_normal",
    scheme.activeBorder,
    scheme.background,
    scheme.foreground
  );
  config = updateSection(
    config,
    "urgency_critical",
    scheme.urgentBorder,
    scheme.background,
    scheme.foreground
  );

  writeConfigFile(resolvedConfigPath, config);
}
