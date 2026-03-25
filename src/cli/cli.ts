import { readFileSync, existsSync, statSync } from "fs";
import { createInterface } from "readline";
import type { ColorScheme } from "../types";
import { configureVim } from "./configs/vim";
import { configureVSCode } from "./configs/vscode";
import { configureCursor } from "./configs/cursor";
import { configureNeovim } from "./configs/neovim";
import { configureFoot } from "./configs/foot";
import { configureAlacritty } from "./configs/alacritty";
import { configureKitty } from "./configs/kitty";
import { configureWezTerm } from "./configs/wezterm";
import { configureXresources } from "./configs/xresources";
import { configureI3 } from "./configs/i3";
import { configureSway } from "./configs/sway";
import { configureRiver } from "./configs/river";
import { configureHyprland } from "./configs/hyprland";
import { configureGtk3 } from "./configs/gtk3";
import { configureGtk4 } from "./configs/gtk4";
import { configureRofi } from "./configs/rofi";
import { configureDunst } from "./configs/dunst";

type AppGroup = "Editors" | "Terminals" | "Window Managers" | "GTK" | "Other";
type PathKind = "file" | "dir";

type AppConfig = {
  key: string;
  name: string;
  group: AppGroup;
  appFlag: string;
  pathFlag: string;
  pathKind: PathKind;
  configure: (scheme: ColorScheme, overridePath?: string) => void;
};

const APPS: AppConfig[] = [
  {
    key: "vim",
    name: "Vim",
    group: "Editors",
    appFlag: "--vim",
    pathFlag: "--vim-path",
    pathKind: "file",
    configure: configureVim,
  },
  {
    key: "vscode",
    name: "VSCode",
    group: "Editors",
    appFlag: "--vscode",
    pathFlag: "--vscode-path",
    pathKind: "dir",
    configure: configureVSCode,
  },
  {
    key: "cursor",
    name: "Cursor",
    group: "Editors",
    appFlag: "--cursor",
    pathFlag: "--cursor-path",
    pathKind: "dir",
    configure: configureCursor,
  },
  {
    key: "neovim",
    name: "Neovim",
    group: "Editors",
    appFlag: "--neovim",
    pathFlag: "--neovim-path",
    pathKind: "file",
    configure: configureNeovim,
  },
  {
    key: "foot",
    name: "Foot",
    group: "Terminals",
    appFlag: "--foot",
    pathFlag: "--foot-path",
    pathKind: "file",
    configure: configureFoot,
  },
  {
    key: "alacritty",
    name: "Alacritty",
    group: "Terminals",
    appFlag: "--alacritty",
    pathFlag: "--alacritty-path",
    pathKind: "file",
    configure: configureAlacritty,
  },
  {
    key: "kitty",
    name: "Kitty",
    group: "Terminals",
    appFlag: "--kitty",
    pathFlag: "--kitty-path",
    pathKind: "file",
    configure: configureKitty,
  },
  {
    key: "wezterm",
    name: "WezTerm",
    group: "Terminals",
    appFlag: "--wezterm",
    pathFlag: "--wezterm-path",
    pathKind: "dir",
    configure: configureWezTerm,
  },
  {
    key: "xresources",
    name: "Xresources",
    group: "Terminals",
    appFlag: "--xresources",
    pathFlag: "--xresources-path",
    pathKind: "file",
    configure: configureXresources,
  },
  {
    key: "i3",
    name: "i3",
    group: "Window Managers",
    appFlag: "--i3",
    pathFlag: "--i3-path",
    pathKind: "file",
    configure: configureI3,
  },
  {
    key: "sway",
    name: "Sway",
    group: "Window Managers",
    appFlag: "--sway",
    pathFlag: "--sway-path",
    pathKind: "file",
    configure: configureSway,
  },
  {
    key: "river",
    name: "River",
    group: "Window Managers",
    appFlag: "--river",
    pathFlag: "--river-path",
    pathKind: "file",
    configure: configureRiver,
  },
  {
    key: "hyprland",
    name: "Hyprland",
    group: "Window Managers",
    appFlag: "--hyprland",
    pathFlag: "--hyprland-path",
    pathKind: "file",
    configure: configureHyprland,
  },
  {
    key: "gtk3",
    name: "GTK 3",
    group: "GTK",
    appFlag: "--gtk3",
    pathFlag: "--gtk3-path",
    pathKind: "file",
    configure: configureGtk3,
  },
  {
    key: "gtk4",
    name: "GTK 4",
    group: "GTK",
    appFlag: "--gtk4",
    pathFlag: "--gtk4-path",
    pathKind: "file",
    configure: configureGtk4,
  },
  {
    key: "rofi",
    name: "Rofi",
    group: "Other",
    appFlag: "--rofi",
    pathFlag: "--rofi-path",
    pathKind: "file",
    configure: configureRofi,
  },
  {
    key: "dunst",
    name: "Dunst",
    group: "Other",
    appFlag: "--dunst",
    pathFlag: "--dunst-path",
    pathKind: "file",
    configure: configureDunst,
  },
];

type PathOverrides = Partial<Record<string, string>>;

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

function buildHelpText(): string {
  const groups: AppGroup[] = ["Editors", "Terminals", "Window Managers", "GTK", "Other"];
  const appSections = groups
    .map((group) => {
      const lines = APPS.filter((app) => app.group === group).map(
        (app) => `  ${app.appFlag.padEnd(14)} Configure ${app.name}`
      );
      return `${group}:\n${lines.join("\n")}`;
    })
    .join("\n\n");

  const pathSection = APPS.map((app) => {
    const label = app.pathKind === "dir" ? "<dir>" : "<path>";
    const target = app.pathKind === "dir" ? "directory" : "path";
    return `  ${`${app.pathFlag} ${label}`.padEnd(26)} Override ${app.name} ${target}`;
  }).join("\n");

  return `
Chromatic CLI - Configure Linux Colorschemes

Usage:
  chromatic <colorscheme.json> [options]
  chromatic [options] <colorscheme.json>

Options:
  --help, -h     Show this help message
  --yes, -y      Skip confirmation prompt
  --all          Configure all supported applications

${appSections}

Path overrides:
${pathSection}

Examples:
  chromatic colorscheme.json --all
  chromatic --cursor colorscheme.json
  chromatic colorscheme.json --vim --foot --yes
  cat colorscheme.json | chromatic -
`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(buildHelpText());
    process.exit(0);
  }

  const appFlags = APPS.map((app) => app.appFlag);
  const pathFlags = APPS.map((app) => app.pathFlag);
  const pathFlagToApp = new Map(APPS.map((app) => [app.pathFlag, app]));
  const validFlags = ["--help", "-h", "--yes", "-y", "--all", ...appFlags, ...pathFlags];

  let jsonPath: string | null = null;
  const pathOverrides: PathOverrides = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;
    if (pathFlags.includes(arg)) {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        console.error(`Error: Missing path value for ${arg}`);
        process.exit(1);
      }
      const app = pathFlagToApp.get(arg);
      if (!app) {
        console.error(`Error: Unknown path override flag: ${arg}`);
        process.exit(1);
      }
      pathOverrides[app.key] = value;
      i++;
      continue;
    }
    if (validFlags.includes(arg)) continue;
    if (arg.startsWith("-")) {
      console.error(`Error: Unknown flag: ${arg}`);
      console.error("Run with --help to see available options.");
      process.exit(1);
    }
    if (!jsonPath) {
      jsonPath = arg;
      continue;
    }
    console.error(`Error: Unexpected extra argument: ${arg}`);
    console.error("Usage: chromatic <colorscheme.json> [options]");
    process.exit(1);
  }

  if (!jsonPath) {
    console.error("Error: No colorscheme file provided.");
    console.error("Usage: chromatic <colorscheme.json> [options]");
    process.exit(1);
  }

  for (const [appKey, overridePath] of Object.entries(pathOverrides)) {
    if (typeof overridePath !== "string" || !overridePath.trim()) {
      console.error(`Error: Empty path provided for ${appKey}.`);
      process.exit(1);
    }
    if (!existsSync(overridePath)) continue;
    const app = APPS.find((candidate) => candidate.key === appKey);
    if (!app) continue;
    const stats = statSync(overridePath);
    if (app.pathKind === "dir" && !stats.isDirectory()) {
      console.error(`Error: ${appKey} path must be a directory: ${overridePath}`);
      process.exit(1);
    }
    if (app.pathKind === "file" && !stats.isFile()) {
      console.error(`Error: ${appKey} path must be a file path: ${overridePath}`);
      process.exit(1);
    }
  }

  let jsonContent: string;
  try {
    if (jsonPath === "-") {
      jsonContent = readFileSync(0, "utf-8");
    } else {
      if (!existsSync(jsonPath)) {
        console.error(`Error: Colorscheme file not found: ${jsonPath}`);
        process.exit(1);
      }
      jsonContent = readFileSync(jsonPath, "utf-8");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: Could not read colorscheme file: ${message}`);
    process.exit(1);
  }

  const scheme: ColorScheme = JSON.parse(jsonContent);
  const hasExplicitFlags = args.some((arg) => appFlags.includes(arg));
  const configAll = args.includes("--all") || !hasExplicitFlags;
  const configs: Array<[boolean, () => void, string]> = APPS.map((app) => [
    configAll || args.includes(app.appFlag),
    () => app.configure(scheme, pathOverrides[app.key]),
    app.name,
  ]);

  const appsToConfigure = configs.filter(([shouldRun]) => shouldRun).map(([, , name]) => name);
  if (appsToConfigure.length === 0) {
    console.log("No applications to configure.");
    process.exit(0);
  }

  if (!(args.includes("--yes") || args.includes("-y"))) {
    console.log("The following applications will be configured:");
    appsToConfigure.forEach((app) => console.log(`  - ${app}`));
    console.log();
    const confirmed = await promptConfirmation(
      "This will overwrite existing configuration. Continue? (y/N): "
    );
    if (!confirmed) {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  console.log("Configuring colorscheme...\n");
  configs.forEach(([shouldRun, configure, name]) => {
    if (shouldRun) {
      configure();
      console.log(`✓ Configured ${name}`);
    }
  });
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
