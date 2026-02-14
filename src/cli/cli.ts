import { readFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import type { ColorScheme } from "../types";

interface Config {
  applications?: {
    // Editors
    vim?: boolean;
    vscode?: boolean;
    cursor?: boolean;
    neovim?: boolean;
    // Terminals
    foot?: boolean;
    alacritty?: boolean;
    kitty?: boolean;
    wezterm?: boolean;
    xresources?: boolean;
    // Window Managers
    i3?: boolean;
    sway?: boolean;
    river?: boolean;
    hyprland?: boolean;
    // GTK
    gtk3?: boolean;
    gtk4?: boolean;
    // Other
    rofi?: boolean;
    dunst?: boolean;
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

  const appFlags = [...editorFlags, ...terminalFlags, ...windowManagerFlags, ...gtkFlags, ...otherFlags];
  const validFlags = ["--help", "-h", "--yes", "-y", "--all", ...appFlags];

  const jsonPath = args.find((arg) => arg === "-" || !arg.startsWith("-"));
  if (!jsonPath) {
    console.error("Error: No colorscheme file provided.");
    console.error("Usage: chromatic <colorscheme.json> [options]");
    process.exit(1);
  }

  const unknownFlags = args.filter((arg) => arg.startsWith("-") && !validFlags.includes(arg));
  if (unknownFlags.length > 0) {
    console.error(`Error: Unknown flag(s): ${unknownFlags.join(", ")}`);
    console.error("Run with --help to see available options.");
    process.exit(1);
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

  const data: ColorScheme & Config = JSON.parse(jsonContent);
  const { applications, ...scheme } = data;

  const hasExplicitFlags = args.some((arg) => appFlags.includes(arg));
  const configAll = args.includes("--all") || (!hasExplicitFlags && !applications);
  const shouldConfigure = (flag: string, appFlag?: boolean): boolean =>
    configAll || args.includes(flag) || (appFlag ?? false);

  // Editors
  const editorConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--vim", applications?.vim ?? false), () => configureVim(scheme), "Vim"],
    [
      shouldConfigure("--vscode", applications?.vscode ?? false),
      () => configureVSCode(scheme),
      "VSCode",
    ],
    [
      shouldConfigure("--cursor", applications?.cursor ?? false),
      () => configureCursor(scheme),
      "Cursor",
    ],
    [
      shouldConfigure("--neovim", applications?.neovim ?? false),
      () => configureNeovim(scheme),
      "Neovim",
    ],
  ];

  // Terminals
  const terminalConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--foot", applications?.foot ?? false), () => configureFoot(scheme), "Foot"],
    [
      shouldConfigure("--alacritty", applications?.alacritty ?? false),
      () => configureAlacritty(scheme),
      "Alacritty",
    ],
    [
      shouldConfigure("--kitty", applications?.kitty ?? false),
      () => configureKitty(scheme),
      "Kitty",
    ],
    [
      shouldConfigure("--wezterm", applications?.wezterm ?? false),
      () => configureWezTerm(scheme),
      "WezTerm",
    ],
    [
      shouldConfigure("--xresources", applications?.xresources ?? false),
      () => configureXresources(scheme),
      "Xresources",
    ],
  ];

  // Window Managers
  const windowManagerConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--i3", applications?.i3 ?? false), () => configureI3(scheme), "i3"],
    [shouldConfigure("--sway", applications?.sway ?? false), () => configureSway(scheme), "Sway"],
    [
      shouldConfigure("--river", applications?.river ?? false),
      () => configureRiver(scheme),
      "River",
    ],
    [
      shouldConfigure("--hyprland", applications?.hyprland ?? false),
      () => configureHyprland(scheme),
      "Hyprland",
    ],
  ];

  // GTK
  const gtkConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--gtk3", applications?.gtk3 ?? false), () => configureGtk3(scheme), "GTK 3"],
    [shouldConfigure("--gtk4", applications?.gtk4 ?? false), () => configureGtk4(scheme), "GTK 4"],
  ];

  // Other
  const otherConfigs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--rofi", applications?.rofi ?? false), () => configureRofi(scheme), "Rofi"],
    [shouldConfigure("--dunst", applications?.dunst ?? false), () => configureDunst(scheme), "Dunst"],
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
