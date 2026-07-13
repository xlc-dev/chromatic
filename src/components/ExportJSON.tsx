import { createSignal } from "solid-js";
import { type ColorScheme } from "../types";
import Button from "./Button";

interface ExportJSONProps {
  scheme: ColorScheme;
}

export default function ExportJSON(props: ExportJSONProps) {
  const [copiedJson, setCopiedJson] = createSignal(false);
  const [copiedCommand, setCopiedCommand] = createSignal(false);

  const handleExport = () => {
    const json = JSON.stringify(props.scheme, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "colorscheme.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, setCopied: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleCopy = () => {
    const json = JSON.stringify(props.scheme, null, 2);
    copyToClipboard(json, setCopiedJson);
  };

  const handleCopyCommand = () => {
    copyToClipboard("chromatic colorscheme.json --all", setCopiedCommand);
  };

  return (
    <div class="p-6 relative max-[768px]:p-5 max-[640px]:p-4">
      <h2 class="section-heading mb-3">Export Colorscheme</h2>
      <p class="panel-copy mb-6">
        Export your colorscheme as JSON, then use it with the Chromatic CLI tool to configure your
        applications automatically.
      </p>
      <div class="flex gap-4 mb-6 max-[640px]:flex-col">
        <Button onClick={handleExport} class="flex-1">
          Download JSON
        </Button>
        <Button onClick={handleCopy} variant={copiedJson() ? "success" : "default"} class="flex-1">
          {copiedJson() ? "Copied!" : "Copy JSON"}
        </Button>
      </div>
      <div>
        <h2 class="section-heading mb-3">Chromatic CLI</h2>
        <p class="panel-copy mb-4">
          Run the CLI with your exported colorscheme to configure your applications automatically.
          Make sure you have it installed somewhere. Download it from the{" "}
          <a
            href="https://github.com/xlc-dev/chromatic/releases"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#58a6ff] no-underline transition-colors duration-200 hover:text-[#79c0ff] hover:underline"
          >
            GitHub releases page
          </a>
          .
        </p>
        <div class="bg-[#0d1117] border border-[#30363d] rounded px-5 py-5 flex items-center justify-between gap-4">
          <code class="text-[#58a6ff] font-mono text-sm flex-1">
            chromatic colorscheme.json --all
          </code>
          <Button
            onClick={handleCopyCommand}
            variant={copiedCommand() ? "success" : "default"}
            class="px-3 font-mono"
          >
            {copiedCommand() ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
