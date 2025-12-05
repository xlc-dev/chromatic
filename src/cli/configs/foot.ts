import { join } from "path";
import { homedir } from "os";
import type { ColorScheme } from "../../types";
import { readConfigFile, writeConfigFile, ensureDir, stripHash } from "../utils";

type FootColorKey =
  | "background"
  | "foreground"
  | "cursor"
  | "regular0"
  | "regular1"
  | "regular2"
  | "regular3"
  | "regular4"
  | "regular5"
  | "regular6"
  | "regular7"
  | "bright0"
  | "bright1"
  | "bright2"
  | "bright3"
  | "bright4"
  | "bright5"
  | "bright6"
  | "bright7";

export function configureFoot(scheme: ColorScheme): void {
  const footConfigDir = join(homedir(), ".config", "foot");
  const footConfigPath = join(footConfigDir, "foot.ini");

  ensureDir(footConfigDir);

  const colorMap: Record<FootColorKey, string> = {
    background: stripHash(scheme.background),
    foreground: stripHash(scheme.foreground),
    cursor: `${stripHash(scheme.background)} ${stripHash(scheme.foreground)}`,
    regular0: stripHash(scheme.black),
    regular1: stripHash(scheme.red),
    regular2: stripHash(scheme.green),
    regular3: stripHash(scheme.yellow),
    regular4: stripHash(scheme.blue),
    regular5: stripHash(scheme.magenta),
    regular6: stripHash(scheme.cyan),
    regular7: stripHash(scheme.white),
    bright0: stripHash(scheme.brightBlack),
    bright1: stripHash(scheme.brightRed),
    bright2: stripHash(scheme.brightGreen),
    bright3: stripHash(scheme.brightYellow),
    bright4: stripHash(scheme.brightBlue),
    bright5: stripHash(scheme.brightMagenta),
    bright6: stripHash(scheme.brightCyan),
    bright7: stripHash(scheme.brightWhite),
  };

  let footConfig = readConfigFile(footConfigPath);
  if (footConfig) {
    footConfig = footConfig.replace(
      /(\[colors\][^\n]*\n)([\s\S]*?)(?=\n\[|$)/g,
      (_match, header, sectionContent) => {
        const lines = sectionContent.split("\n");
        const updatedLines = lines.map((line: string) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("#") || trimmed === "") {
            return line;
          }
          const keyMatch = trimmed.match(/^([^=]+)=(.+)$/);
          if (keyMatch && keyMatch[1]) {
            const key = keyMatch[1].trim() as FootColorKey;
            if (key in colorMap) {
              return `${key}=${colorMap[key]}`;
            }
          }
          return line;
        });

        const existingKeys = new Set(
          lines
            .map((line: string) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("#") || trimmed === "") return null;
              const keyMatch = trimmed.match(/^([^=]+)=/);
              return keyMatch && keyMatch[1] ? keyMatch[1].trim() : null;
            })
            .filter((key: string | null): key is FootColorKey => key !== null && key in colorMap)
        );

        const missingKeys = Object.keys(colorMap).filter(
          (key): key is FootColorKey => !existingKeys.has(key as FootColorKey)
        );
        const additions =
          missingKeys.length > 0
            ? "\n" + missingKeys.map((key: FootColorKey) => `${key}=${colorMap[key]}`).join("\n")
            : "";

        return header + updatedLines.join("\n") + additions;
      }
    );

    if (!footConfig.includes("[colors]")) {
      const colorsConfig = `[colors]
${Object.entries(colorMap)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;
      footConfig = footConfig + "\n" + colorsConfig;
    }
  } else {
    const colorsConfig = `[colors]
${Object.entries(colorMap)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}
`;
    footConfig = colorsConfig;
  }

  writeConfigFile(footConfigPath, footConfig);
  console.log("✓ Configured Foot");
}
