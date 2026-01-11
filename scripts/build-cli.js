#!/usr/bin/env bun
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const scripts = packageJson.scripts || {};

// Find all build:cli:* scripts (excluding build:cli itself)
const cliBuildKeys = Object.keys(scripts)
  .filter((key) => key.startsWith("build:cli:") && key !== "build:cli");

if (cliBuildKeys.length === 0) {
  console.error("No build:cli:* scripts found in package.json");
  process.exit(1);
}

// Output commands to be executed by shell
cliBuildKeys.forEach((key) => {
  console.log(`bun run ${key}`);
});
