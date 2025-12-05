import { For, createSignal, Show } from "solid-js";
import type { ColorScheme } from "../types";
import presetsData from "../data/presets.json";
import ConfirmDialog from "./ConfirmDialog";
import { shouldSkipConfirmation } from "../utils/confirmation";

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
  const [pendingPreset, setPendingPreset] = createSignal<Preset | null>(null);
  const presets = presetsData as Preset[];

  const handleSelect = (preset: Preset) => {
    if (shouldSkipConfirmation("preset")) {
      props.onSelect(preset.scheme);
      setIsOpen(false);
    } else {
      setPendingPreset(preset);
    }
  };

  const handleConfirm = () => {
    const preset = pendingPreset();
    if (preset) {
      props.onSelect(preset.scheme);
      setPendingPreset(null);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setPendingPreset(null);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} class="preset-btn">
        Presets
      </button>

      <Show when={isOpen()}>
        <div class="preset-overlay" onClick={() => setIsOpen(false)}>
          <div class="preset-dialog" onClick={(e) => e.stopPropagation()}>
            <div class="preset-header">
              <h2 class="preset-title">Color Scheme Presets</h2>
              <button class="preset-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>
            <div class="preset-content">
              <p class="preset-description">
                Select a popular color scheme to get started. You can customize it after applying.
              </p>
              <div class="preset-grid">
                <For each={presets}>
                  {(preset) => (
                    <div class="preset-card" onClick={() => handleSelect(preset)}>
                      <div class="preset-card-header">
                        <h3 class="preset-card-title">{preset.name}</h3>
                        <p class="preset-card-description">{preset.description}</p>
                      </div>
                      <div class="preset-preview">
                        <div
                          class="preset-color-row"
                          style={{
                            display: "grid",
                            "grid-template-columns": "repeat(8, 1fr)",
                            gap: "2px",
                          }}
                        >
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.black,
                            }}
                            title="Black"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.red,
                            }}
                            title="Red"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.green,
                            }}
                            title="Green"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.yellow,
                            }}
                            title="Yellow"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.blue,
                            }}
                            title="Blue"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.magenta,
                            }}
                            title="Magenta"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.cyan,
                            }}
                            title="Cyan"
                          />
                          <div
                            class="preset-color"
                            style={{
                              "background-color": preset.scheme.white,
                            }}
                            title="White"
                          />
                        </div>
                        <div
                          class="preset-color-row"
                          style={{
                            display: "grid",
                            "grid-template-columns": "repeat(2, 1fr)",
                            gap: "2px",
                            "margin-top": "2px",
                          }}
                        >
                          <div
                            class="preset-color preset-color-large"
                            style={{
                              "background-color": preset.scheme.background,
                            }}
                            title="Background"
                          />
                          <div
                            class="preset-color preset-color-large"
                            style={{
                              "background-color": preset.scheme.foreground,
                            }}
                            title="Foreground"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <ConfirmDialog
        open={pendingPreset() !== null}
        title="Apply Preset"
        message={`This will replace your current colorscheme with "${pendingPreset()?.name}". All your current changes will be lost.`}
        confirmText="Apply"
        cancelText="Cancel"
        storageKey="preset"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
