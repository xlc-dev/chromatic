import { createHash } from "node:crypto";
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

const cliOutput = "dist/chromatic.mjs";

export default defineConfig(({ mode }) => {
  if (mode === "cli") {
    return {
      publicDir: false,
      build: {
        ssr: "src/cli/cli.ts",
        outDir: "dist",
        emptyOutDir: false,
        target: "node22",
        minify: true,
        rollupOptions: {
          output: { entryFileNames: "chromatic.mjs", codeSplitting: false },
        },
      },
      plugins: [
        {
          name: "chromatic-cli-checksum",
          writeBundle() {
            chmodSync(cliOutput, 0o755);
            const digest = createHash("sha256").update(readFileSync(cliOutput)).digest("hex");
            writeFileSync(`${cliOutput}.sha256`, `${digest}  chromatic.mjs\n`);
          },
        },
      ],
    };
  }

  return {
    base: "/chromatic/",
    plugins: [solid({ start: true }), tailwindcss()],
  };
});
