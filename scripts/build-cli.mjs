import { build } from "esbuild";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const DIST_DIR = "dist";
const ENTRY = "src/cli/cli.ts";
const OUTFILE = join(DIST_DIR, "chromatic.mjs");

mkdirSync(DIST_DIR, { recursive: true });

await build({
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  minify: true,
  legalComments: "none",
  banner: { js: "#!/usr/bin/env node" },
});

chmodSync(OUTFILE, 0o755);

const digest = createHash("sha256").update(readFileSync(OUTFILE)).digest("hex");
writeFileSync(`${OUTFILE}.sha256`, `${digest}  ${basename(OUTFILE)}\n`);

console.log(`Built ${OUTFILE} and ${OUTFILE}.sha256`);
