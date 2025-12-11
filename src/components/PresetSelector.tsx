import { For, createSignal, Show, createEffect } from "solid-js";
import { type ColorScheme } from "../types";
import presetsData from "../data/presets.json";
import Button from "./Button";
import ColorPalettePreview from "./ColorPalettePreview";

interface Preset {
  name: string;
  description: string;
  scheme: ColorScheme;
}

interface PresetSelectorProps {
  onSelect: (scheme: ColorScheme) => void;
}

export default function PresetSelector(props: PresetSelectorProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const presets = presetsData as Preset[];

  const handleSelect = (preset: Preset) => {
    props.onSelect(preset.scheme);
    setIsOpen(false);
  };

  createEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        setIsOpen(false);
      }
    };
    if (isOpen()) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Presets</Button>

      <Show when={isOpen()}>
        <div
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            class="bg-[#161b22] rounded-lg border border-[#30363d] max-w-[900px] w-[90%] max-h-[90vh] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-up overflow-hidden max-[640px]:w-[95%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex items-center justify-between p-6 border-b border-[#30363d]">
              <h2 class="text-xl font-semibold text-[#c9d1d9] m-0">Color Scheme Presets</h2>
              <button
                class="bg-transparent border-0 text-[#8b949e] text-2xl leading-none cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all duration-200 hover:bg-[#21262d] hover:text-[#c9d1d9]"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 max-[640px]:p-4">
              <p class="text-[#8b949e] text-sm mb-6 leading-relaxed">
                Select a popular color scheme to get started. You can customize it after applying.
              </p>
              <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 max-[1024px]:grid-cols-[repeat(2,1fr)] max-[768px]:grid-cols-1">
                <For each={presets}>
                  {(preset) => (
                    <div
                      class="bg-[#0d1117] border border-[#30363d] rounded-md p-4 cursor-pointer transition-all duration-200 hover:border-[#58a6ff] hover:shadow-[0_4px_12px_rgba(88,166,255,0.2)] hover:-translate-y-0.5"
                      onClick={() => handleSelect(preset)}
                    >
                      <div class="mb-3">
                        <h3 class="text-base font-semibold text-[#c9d1d9] m-0 mb-1">
                          {preset.name}
                        </h3>
                        <p class="text-xs text-[#8b949e] m-0 leading-snug">{preset.description}</p>
                      </div>
                      <ColorPalettePreview scheme={preset.scheme} />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
