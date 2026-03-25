import { readFileSync, existsSync, statSync } from "fs";
import { createInterface } from "readline";
import type { ColorScheme } from "../types";

interface Config {
  pathOverrides?: {
    vim?: string;
    vscode?: string;
    cursor?: string;
    neovim?: string;
    foot?: string;
    alacritty?: string;
    kitty?: string;
    wezterm?: string;
    xresources?: string;
    i3?: string;
    sway?: string;
    river?: string;
    hyprland?: string;
    gtk3?: string;
    gtk4?: string;
    rofi?: string;
    dunst?: string;
  };
}

// Editors
import { configureVim } from "./configs/vim";
import { configureVSCode } from "./configs/vscode";
import { configureCursor } from "./configs/cursor";
import { configureNeovim } from "./configs/neovim";

// Terminals
import { configureFoot } from "./configs/foot";
import { configureAlacritty } from "./configs/alacritty";
import { configureKitty } from "./configs/kitty";
import { configureWezTerm } from "./configs/wezterm";
import { configureXresources } from "./configs/xresources";

// Window Managers
import { configureI3 } from "./configs/i3";
import { configureSway } from "./configs/sway";
import { configureRiver } from "./configs/river";
import { configureHyprland } from "./configs/hyprland";

// GTK
import { configureGtk3 } from "./configs/gtk3";
import { configureGtk4 } from "./configs/gtk4";

// Other
import { configureRofi } from "./configs/rofi";
import { configureDunst } from "./configs/dunst";

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Chromatic CLI - Configure Linux Colorschemes

Usage:
  chromatic <colorscheme.json> [options]
  chromatic [options] <colorscheme.json>

Options:
  --help, -h     Show this help message
  --yes, -y      Skip confirmation prompt
  --all          Configure all supported applications

Editors:
  --vim          Configure Vim
  --vscode       Configure VSCode theme
  --cursor       Configure Cursor theme
  --neovim       Configure Neovim terminal colors

Terminals:
  --foot         Configure Foot terminal
  --alacritty    Configure Alacritty
  --kitty        Configure Kitty
  --wezterm      Configure WezTerm
  --xresources   Configure Xresources

Window Managers:
  --i3           Configure i3 window manager borders
  --sway         Configure Sway window manager borders
  --river        Configure River window manager borders
  --hyprland     Configure Hyprland border colors

GTK:
  --gtk3         Configure GTK 3 (~/.config/gtk-3.0/gtk.css)
  --gtk4         Configure GTK 4 (~/.config/gtk-4.0/gtk.css)

Other:
  --rofi         Write Rofi theme (~/.config/rofi/chromatic.rasi)
  --dunst        Configure Dunst notification colors

Path overrides:
  --vim-path <path>         Override Vim config path
  --vscode-path <dir>       Override VSCode extension dir
  --cursor-path <dir>       Override Cursor extension dir
  --neovim-path <path>      Override Neovim init path
  --foot-path <path>        Override Foot config path
  --alacritty-path <path>   Override Alacritty config path
  --kitty-path <path>       Override Kitty config path
  --wezterm-path <dir>      Override WezTerm config directory
  --xresources-path <path>  Override Xresources path
  --i3-path <path>          Override i3 config path
  --sway-path <path>        Override Sway config path
  --river-path <path>       Override River init path
  --hyprland-path <path>    Override Hyprland config path
  --gtk3-path <path>        Override GTK 3 css path
  --gtk4-path <path>        Override GTK 4 css path
  --rofi-path <path>        Override Rofi theme path
  --dunst-path <path>       Override Dunst config path

Examples:
  chromatic colorscheme.json --all
  chromatic --cursor colorscheme.json
  chromatic colorscheme.json --vim --foot --yes
  cat colorscheme.json | chromatic -
`);
    process.exit(0);
  }

  // Editors
  const editorFlags = ["--vim", "--vscode", "--cursor", "--neovim"];
  // Terminals
  const terminalFlags = ["--foot", "--alacritty", "--kitty", "--wezterm", "--xresources"];
  // Window Managers
  const windowManagerFlags = ["--i3", "--sway", "--river", "--hyprland"];
  // GTK
  const gtkFlags = ["--gtk3", "--gtk4"];
  // Other
  const otherFlags = ["--rofi", "--dunst"];

  const appFlags = [
    ...editorFlags,
    ...terminalFlags,
    ...windowManagerFlags,
    ...gtkFlags,
    ...otherFlags,
  ];
  const pathFlagToApp: Record<string, keyof NonNullable<Config["pathOverrides"]>> = {
    "--vim-path": "vim",
    "--vscode-path": "vscode",
    "--cursor-path": "cursor",
    "--neovim-path": "neovim",
    "--foot-path": "foot",
    "--alacritty-path": "alacritty",
    "--kitty-path": "kitty",
    "--wezterm-path": "wezterm",
    "--xresources-path": "xresources",
    "--i3-path": "i3",
    "--sway-path": "sway",
    "--river-path": "river",
    "--hyprland-path": "hyprland",
    "--gtk3-path": "gtk3",
    "--gtk4-path": "gtk4",
    "--rofi-path": "rofi",
    "--dunst-path": "dunst",
  };
  const pathFlags = Object.keys(pathFlagToApp);
  const validFlags = ["--help", "-h", "--yes", "-y", "--all", ...appFlags, ...pathFlags];

  let jsonPath: string | null = null;
  const pathOverrides: NonNullable<Config["pathOverrides"]> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (pathFlags.includes(arg)) {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        console.error(`Error: Missing path value for ${arg}`);
        process.exit(1);
      }
      const app = pathFlagToApp[arg];
      if (!app) {
        console.error(`Error: Unknown path override flag: ${arg}`);
        process.exit(1);
      }
      pathOverrides[app] = value;
      i++;
      continue;
    }

    if (validFlags.includes(arg)) {
      continue;
    }

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

  const directoryOverrideApps = new Set<keyof NonNullable<Config["pathOverrides"]>>([
    "wezterm",
    "vscode",
    "cursor",
  ]);
  for (const [app, overridePath] of Object.entries(pathOverrides)) {
    if (!overridePath || !overridePath.trim()) {
      console.error(`Error: Empty path provided for ${app}.`);
      process.exit(1);
    }

    if (!existsSync(overridePath)) {
      continue;
    }

    const stats = statSync(overridePath);
    const expectsDirectory = directoryOverrideApps.has(
      app as keyof NonNullable<Config["pathOverrides"]>
    );

    if (expectsDirectory && !stats.isDirectory()) {
      console.error(`Error: ${app} path must be a directory: ${overridePath}`);
      process.exit(1);
    }

    if (!expectsDirectory && !stats.isFile()) {
      console.error(`Error: ${app} path must be a file path: ${overridePath}`);
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
  const shouldConfigure = (flag: string): boolean => configAll || args.includes(flag);

  // Editors
  const editorConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--vim"), () => configureVim(scheme, pathOverrides.vim), "Vim"],
    [shouldConfigure("--vscode"), () => configureVSCode(scheme, pathOverrides.vscode), "VSCode"],
    [shouldConfigure("--cursor"), () => configureCursor(scheme, pathOverrides.cursor), "Cursor"],
    [shouldConfigure("--neovim"), () => configureNeovim(scheme, pathOverrides.neovim), "Neovim"],
  ];

  // Terminals
  const terminalConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--foot"), () => configureFoot(scheme, pathOverrides.foot), "Foot"],
    [
      shouldConfigure("--alacritty"),
      () => configureAlacritty(scheme, pathOverrides.alacritty),
      "Alacritty",
    ],
    [shouldConfigure("--kitty"), () => configureKitty(scheme, pathOverrides.kitty), "Kitty"],
    [
      shouldConfigure("--wezterm"),
      () => configureWezTerm(scheme, pathOverrides.wezterm),
      "WezTerm",
    ],
    [
      shouldConfigure("--xresources"),
      () => configureXresources(scheme, pathOverrides.xresources),
      "Xresources",
    ],
  ];

  // Window Managers
  const windowManagerConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--i3"), () => configureI3(scheme, pathOverrides.i3), "i3"],
    [shouldConfigure("--sway"), () => configureSway(scheme, pathOverrides.sway), "Sway"],
    [shouldConfigure("--river"), () => configureRiver(scheme, pathOverrides.river), "River"],
    [
      shouldConfigure("--hyprland"),
      () => configureHyprland(scheme, pathOverrides.hyprland),
      "Hyprland",
    ],
  ];

  // GTK
  const gtkConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--gtk3"), () => configureGtk3(scheme, pathOverrides.gtk3), "GTK 3"],
    [shouldConfigure("--gtk4"), () => configureGtk4(scheme, pathOverrides.gtk4), "GTK 4"],
  ];

  // Other
  const otherConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--rofi"), () => configureRofi(scheme, pathOverrides.rofi), "Rofi"],
    [shouldConfigure("--dunst"), () => configureDunst(scheme, pathOverrides.dunst), "Dunst"],
  ];

  const configs = [
    ...editorConfigs,
    ...terminalConfigs,
    ...windowManagerConfigs,
    ...gtkConfigs,
    ...otherConfigs,
  ];

  const appsToConfigure = configs.filter(([shouldRun]) => shouldRun).map(([, , name]) => name);

  if (appsToConfigure.length === 0) {
    console.log("No applications to configure.");
    process.exit(0);
  }

  const skipConfirmation = args.includes("--yes") || args.includes("-y");

  if (!skipConfirmation) {
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
