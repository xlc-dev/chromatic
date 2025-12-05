import { readFileSync } from "fs";
import { createInterface } from "readline";
import type { ColorScheme } from "../types";

interface Config {
  applications?: {
    vim?: boolean;
    foot?: boolean;
    alacritty?: boolean;
    kitty?: boolean;
    xresources?: boolean;
    i3?: boolean;
    sway?: boolean;
    river?: boolean;
  };
}
import { configureVim } from "./configs/vim";
import { configureFoot } from "./configs/foot";
import { configureAlacritty } from "./configs/alacritty";
import { configureKitty } from "./configs/kitty";
import { configureXresources } from "./configs/xresources";
import { configureI3 } from "./configs/i3";
import { configureSway } from "./configs/sway";
import { configureRiver } from "./configs/river";

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

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Chromatic CLI - Configure Linux Colorschemes

Usage:
  chromatic <colorscheme.json> [options]

Options:
  --help, -h     Show this help message
  --yes, -y      Skip confirmation prompt
  --all          Configure all supported applications
  --vim          Configure Vim
  --foot         Configure Foot terminal
  --alacritty    Configure Alacritty
  --kitty        Configure Kitty
  --xresources   Configure Xresources
  --i3           Configure i3 window manager borders
  --sway         Configure Sway window manager borders
  --river        Configure River window manager

Examples:
  chromatic colorscheme.json --all
  chromatic colorscheme.json --vim --foot
  chromatic colorscheme.json --foot --yes
  cat colorscheme.json | chromatic -
`);
    process.exit(0);
  }

  const jsonPath = args[0];
  if (!jsonPath) {
    console.error("Error: No colorscheme file provided");
    process.exit(1);
  }
  let jsonContent: string;

  if (jsonPath === "-") {
    jsonContent = readFileSync(0, "utf-8");
  } else {
    jsonContent = readFileSync(jsonPath, "utf-8");
  }

  const data: ColorScheme & Config = JSON.parse(jsonContent);
  const { applications, ...scheme } = data;

  const appFlags = [
    "--vim",
    "--foot",
    "--alacritty",
    "--kitty",
    "--xresources",
    "--i3",
    "--sway",
    "--river",
  ];
  const hasExplicitFlags = args.some((arg) => appFlags.includes(arg));
  const configAll = args.includes("--all") || (!hasExplicitFlags && !applications);
  const shouldConfigure = (flag: string, appFlag?: boolean): boolean =>
    configAll || args.includes(flag) || (appFlag ?? false);

  const configs: Array<[boolean, () => void, string]> = [
    [shouldConfigure("--vim", applications?.vim ?? false), () => configureVim(scheme), "Vim"],
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
      shouldConfigure("--xresources", applications?.xresources ?? false),
      () => configureXresources(scheme),
      "Xresources",
    ],
    [shouldConfigure("--i3", applications?.i3 ?? false), () => configureI3(scheme), "i3"],
    [shouldConfigure("--sway", applications?.sway ?? false), () => configureSway(scheme), "Sway"],
    [
      shouldConfigure("--river", applications?.river ?? false),
      () => configureRiver(scheme),
      "River",
    ],
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
  configs.forEach(([shouldRun, configure]) => shouldRun && configure());

  console.log("\n✓ Colorscheme configured successfully!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
