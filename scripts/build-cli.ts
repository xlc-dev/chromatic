import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { basename, join } from "path";
import { CLI_ENTRY, CLI_TARGETS, DIST_DIR, getCliTarget } from "./cli-targets";

async function sha256sumLine(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(await file.arrayBuffer());
  return `${hasher.digest("hex")}  ${basename(filePath)}\n`;
}

async function buildTarget(target: (typeof CLI_TARGETS)[number]): Promise<void> {
  const outfile = join(DIST_DIR, target.outfile);
  const buildDir = mkdtempSync(join(tmpdir(), "chromatic-cli-"));
  const buildOutfile = join(buildDir, target.outfile);
  console.log(`Building ${target.id} -> ${outfile}`);

  try {
    const proc = Bun.spawn(
      [
        "bun",
        "build",
        "--compile",
        "--minify",
        `--target=${target.bunTarget}`,
        CLI_ENTRY,
        `--outfile=${buildOutfile}`,
      ],
      { stdout: "inherit", stderr: "inherit" }
    );

    const code = await proc.exited;
    if (code !== 0) {
      console.error(`Build failed for ${target.id} (exit ${code})`);
      process.exit(code);
    }
    if (!existsSync(buildOutfile)) {
      console.error(`Build failed for ${target.id}: missing output ${buildOutfile}`);
      process.exit(1);
    }
    await Bun.write(outfile, Bun.file(buildOutfile));
    chmodSync(outfile, 0o755);
    writeFileSync(`${outfile}.sha256`, await sha256sumLine(outfile));
  } finally {
    rmSync(buildDir, { force: true, recursive: true });
  }
}

const filterId = process.argv[2];
let targets = CLI_TARGETS;
if (filterId) {
  const target = getCliTarget(filterId);
  if (!target) {
    console.error(`Unknown CLI target: ${filterId}`);
    console.error(`Available: ${CLI_TARGETS.map((t) => t.id).join(", ")}`);
    process.exit(1);
  }
  targets = [target];
}

mkdirSync(DIST_DIR, { recursive: true });

for (const target of targets) {
  await buildTarget(target);
}

console.log(`Built ${targets.length} CLI binary(s) in ${DIST_DIR}/`);
