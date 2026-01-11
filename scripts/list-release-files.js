#!/usr/bin/env bun
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
const scripts = packageJson.scripts || {};

// Parse target to release name
function targetToReleaseName(target) {
  const match = target.match(/^bun-(linux|macos|windows)-(x64|arm64)(?:-(musl))?$/);
  if (!match) {
    return target.replace(/^bun-/, "");
  }

  const [, os, arch, libc] = match;
  const archName = arch === "x64" ? "amd64" : arch;
  // musl has explicit suffix, glibc (default) has no suffix
  const libcSuffix = libc === "musl" ? `-${libc}` : "";

  return `${os}-${archName}${libcSuffix}`;
}

// Extract all build:cli:* scripts and their output binaries
const cliBuilds = Object.entries(scripts)
  .filter(([key]) => key.startsWith("build:cli:") && key !== "build:cli")
  .map(([key, command]) => {
    const cmdStr = String(command);

    // Extract target from --target=bun-*
    const targetMatch = cmdStr.match(/--target=([^\s]+)/);
    if (!targetMatch) {
      console.error(`Warning: Could not extract target from script ${key}`);
      return null;
    }
    const target = targetMatch[1];

    // Auto-generate release name from target
    const releaseName = targetToReleaseName(target);

    return { key, releaseName };
  })
  .filter(Boolean);

// Generate file list: binaries + their .sha256 files + tar.gz + tar.gz.sha256
const files = [];

// Add all binary files
cliBuilds.forEach(({ releaseName }) => {
  files.push(`release/chromatic-${releaseName}`);
});

// Add all .sha256 files for binaries (but NOT chromatic-all.tar.gz.sha256)
cliBuilds.forEach(({ releaseName }) => {
  files.push(`release/chromatic-${releaseName}.sha256`);
});

// Add tar.gz and its .sha256
files.push(`release/chromatic-all.tar.gz`);
files.push(`release/chromatic-all.tar.gz.sha256`);

// Output one file per line for the workflow
console.log(files.join("\n"));
