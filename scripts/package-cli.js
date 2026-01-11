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

    // Extract binary name from --outfile dist/chromatic-*
    const outfileMatch = cmdStr.match(/--outfile\s+dist\/(chromatic-[^\s]+)/);
    if (!outfileMatch) {
      console.error(`Warning: Could not extract outfile from script ${key}`);
      return null;
    }
    const binaryName = outfileMatch[1];

    // Auto-generate release name from target
    const releaseName = targetToReleaseName(target);

    return { key, binaryName, releaseName };
  })
  .filter(Boolean);

console.log("#!/bin/sh");
console.log("set -e");
console.log("cd dist");
console.log("");
console.log("mkdir -p ../release");
console.log("");
cliBuilds.forEach(({ binaryName, releaseName }) => {
  console.log(`chmod +x "${binaryName}"`);
  console.log(`cp "${binaryName}" "../release/chromatic-${releaseName}"`);
});

console.log("");
console.log("cd ../release");
console.log("");
cliBuilds.forEach(({ releaseName }) => {
  console.log(`sha256sum "chromatic-${releaseName}" > "chromatic-${releaseName}.sha256"`);
});
console.log("");
const binaryFiles = cliBuilds.map(({ releaseName }) => `chromatic-${releaseName}`).join(" ");
console.log(`tar -czf chromatic-all.tar.gz ${binaryFiles}`);
console.log("");
console.log("sha256sum chromatic-all.tar.gz > chromatic-all.tar.gz.sha256");
