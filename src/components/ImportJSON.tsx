import { createSignal } from "solid-js";
import { type ColorScheme, COLOR_SCHEME_KEYS } from "../types";
import Button from "./Button";
import Divider from "./Divider";

interface ImportJSONProps {
  onImport: (scheme: ColorScheme) => void;
}

const validateColorScheme = (data: unknown): data is ColorScheme => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return COLOR_SCHEME_KEYS.every(
    (key) => key in data && typeof (data as Record<string, unknown>)[key] === "string"
  );
};

export default function ImportJSON(props: ImportJSONProps) {
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);
  const [jsonText, setJsonText] = createSignal("");

  const processJson = (text: string): boolean => {
    setError(null);
    setSuccess(false);

    try {
      const parsed = JSON.parse(text);

      if (validateColorScheme(parsed)) {
        props.onImport(parsed);
        setSuccess(true);
        setJsonText("");
        setTimeout(() => setSuccess(false), 2000);
        return true;
      } else {
        setError("Invalid colorscheme format. Missing required color fields.");
        return false;
      }
    } catch (e) {
      setError("Failed to parse JSON. Please ensure it's valid JSON.");
      return false;
    }
  };

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      processJson(text);
    } finally {
      target.value = "";
    }
  };

  const handlePaste = () => {
    const text = jsonText().trim();
    if (!text) {
      setError("Please paste JSON content first.");
      return;
    }
    processJson(text);
  };

  const handleTextChange = (value: string) => {
    setJsonText(value);
    setError(null);
    setSuccess(false);
  };

  return (
    <div class="p-8 relative border-b border-[#30363d] pb-8 max-[640px]:p-4">
      <h2 class="mb-4 text-[#c9d1d9] text-sm font-semibold">Import Colorscheme</h2>
      <p class="text-[#8b949e] text-xs mb-8 leading-relaxed">
        Import a colorscheme from a JSON file or paste JSON content to load it into the editor.
      </p>

      <div class="flex gap-4 mb-8">
        <label
          for="file-upload"
          class="flex-1 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded px-4 py-3 cursor-pointer text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden text-center block m-0 before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
        >
          Upload JSON File
          <input
            id="file-upload"
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            style="display: none;"
          />
        </label>
      </div>

      <Divider />

      <div class="flex flex-col gap-4">
        <label for="json-paste" class="text-[#c9d1d9] text-sm font-medium">
          Paste JSON:
        </label>
        <textarea
          id="json-paste"
          class="bg-[#0d1117] border border-[#30363d] rounded px-3 py-3 text-[#c9d1d9] font-mono text-sm resize-y min-h-[120px] transition-[border-color] duration-200 focus:outline-none focus:border-[#58a6ff] placeholder:text-[#484f58]"
          placeholder='{"black": "#000000", "red": "#cd3131", ...}'
          value={jsonText()}
          onInput={(e) => handleTextChange(e.currentTarget.value)}
        />
        <Button
          onClick={handlePaste}
          variant={success() ? "success" : "default"}
          class="text-xs py-3"
        >
          {success() ? "Imported!" : "Import from Text"}
        </Button>
      </div>

      {error() && (
        <div class="bg-[#21262d] border border-[#f85149] rounded px-4 py-3 text-[#f85149] text-xs mt-4">
          {error()}
        </div>
      )}
    </div>
  );
}
