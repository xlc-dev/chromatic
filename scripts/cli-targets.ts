export type CliTarget = {
  id: string;
  bunTarget: string;
  outfile: string;
};

export function releaseNameFromBunTarget(target: string): string {
  const match = target.match(/^bun-(linux|macos|windows)-(x64|arm64)(?:-(musl))?$/);
  if (!match) {
    return target.replace(/^bun-/, "");
  }

  const [, os, arch, libc] = match;
  const archName = arch === "x64" ? "amd64" : arch;
  const libcSuffix = libc === "musl" ? `-${libc}` : "";

  return `${os}-${archName}${libcSuffix}`;
}

const targets: Array<Pick<CliTarget, "id" | "bunTarget">> = [
  { id: "x64-glibc", bunTarget: "bun-linux-x64" },
  { id: "x64-musl", bunTarget: "bun-linux-x64-musl" },
  { id: "arm64-glibc", bunTarget: "bun-linux-arm64" },
  { id: "arm64-musl", bunTarget: "bun-linux-arm64-musl" },
  { id: "macos-x64", bunTarget: "bun-macos-x64" },
  { id: "macos-arm64", bunTarget: "bun-macos-arm64" },
  { id: "windows-x64", bunTarget: "bun-windows-x64" },
];

export const CLI_ENTRY = "src/cli/cli.ts";
export const DIST_DIR = "dist";

export const CLI_TARGETS: CliTarget[] = targets.map((t) => ({
  ...t,
  outfile: `chromatic-${releaseNameFromBunTarget(t.bunTarget)}${
    t.bunTarget.includes("windows") ? ".exe" : ""
  }`,
}));

export function getCliTarget(id: string): CliTarget | undefined {
  return CLI_TARGETS.find((t) => t.id === id);
}
