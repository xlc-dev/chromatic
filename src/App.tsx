import { createSignal, createEffect, onMount } from "solid-js";
import type { ColorScheme, ColorSchemeKey } from "./types";
import { defaultColorScheme, COLOR_SCHEME_KEYS } from "./types";
import ColorPicker from "./components/ColorPicker";
import Preview from "./components/Preview";
import ExportJSON from "./components/ExportJSON";
import ImportJSON from "./components/ImportJSON";
import ConfirmDialog from "./components/ConfirmDialog";
import PresetSelector from "./components/PresetSelector";
import { processImageFile } from "./utils/imageProcessor";
import { shouldSkipConfirmation } from "./utils/confirmation";

const BASE_URL = import.meta.env["BASE_URL"];
const faviconUrl = `${BASE_URL}favicon.svg`;

const STORAGE_KEY = "chromatic-colorscheme";

const getInitialScheme = (): ColorScheme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const hasAllKeys = COLOR_SCHEME_KEYS.every((key) => key in parsed);
      if (hasAllKeys) {
        return parsed as ColorScheme;
      }
    }
  } catch (e) {
    console.error("Failed to load colorscheme from localStorage:", e);
  }
  return defaultColorScheme;
};

export default function App() {
  const [scheme, setScheme] = createSignal<ColorScheme>(getInitialScheme());
  const [showResetDialog, setShowResetDialog] = createSignal(false);
  const [showImageExtractDialog, setShowImageExtractDialog] = createSignal(false);
  const [imageExtracting, setImageExtracting] = createSignal(false);
  let imageInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    const currentScheme = scheme();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentScheme));
    } catch (e) {
      console.error("Failed to save colorscheme to localStorage:", e);
    }
  });

  const getInitialTab = (): "preview" | "export" => {
    const saved = localStorage.getItem("chromatic-active-tab");
    return saved === "preview" || saved === "export" ? saved : "preview";
  };

  const [activeTab, setActiveTab] = createSignal<"preview" | "export">(getInitialTab());
  let tabGroupRef: HTMLDivElement | undefined;
  let previewTabRef: HTMLButtonElement | undefined;
  let exportTabRef: HTMLButtonElement | undefined;

  const updateTabIndicator = () => {
    if (!tabGroupRef || !previewTabRef || !exportTabRef) return;

    const activeButton = activeTab() === "preview" ? previewTabRef : exportTabRef;
    const buttonRect = activeButton.getBoundingClientRect();
    const groupRect = tabGroupRef.getBoundingClientRect();

    const width = buttonRect.width;
    let left = buttonRect.left - groupRect.left;

    const groupStyle = window.getComputedStyle(tabGroupRef);
    const paddingLeft = parseFloat(groupStyle.paddingLeft) || 4;
    const paddingRight = parseFloat(groupStyle.paddingRight) || 4;

    left = Math.max(paddingLeft, left);
    const maxWidth = groupRect.width - left - paddingRight;
    const clampedWidth = Math.min(width, maxWidth);

    tabGroupRef.style.setProperty("--indicator-width", `${clampedWidth}px`);
    tabGroupRef.style.setProperty("--indicator-left", `${left}px`);
  };

  createEffect(() => {
    activeTab();
    requestAnimationFrame(() => {
      requestAnimationFrame(updateTabIndicator);
    });
  });

  onMount(() => {
    updateTabIndicator();
    window.addEventListener("resize", updateTabIndicator);
    return () => window.removeEventListener("resize", updateTabIndicator);
  });

  const handleTabChange = (tab: "preview" | "export") => {
    setActiveTab(tab);
    localStorage.setItem("chromatic-active-tab", tab);
  };

  const handleColorChange = (key: ColorSchemeKey, value: string) => {
    setScheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetClick = () => {
    if (shouldSkipConfirmation("reset")) {
      setScheme(defaultColorScheme);
    } else {
      setShowResetDialog(true);
    }
  };

  const handleResetConfirm = () => {
    setScheme(defaultColorScheme);
    setShowResetDialog(false);
  };

  const handleImport = (importedScheme: ColorScheme) => {
    setScheme(importedScheme);
    handleTabChange("preview");
  };

  const handleImageExtractClick = () => {
    if (shouldSkipConfirmation("image")) {
      if (imageInputRef) {
        imageInputRef.click();
      }
    } else {
      setShowImageExtractDialog(true);
    }
  };

  const handleImageExtractConfirm = () => {
    setShowImageExtractDialog(false);
    if (imageInputRef) {
      imageInputRef.click();
    }
  };

  const handleImageFileSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    setImageExtracting(true);
    try {
      const colorScheme = await processImageFile(file);
      setScheme(colorScheme);
      handleTabChange("preview");
    } catch (error) {
      console.error("Failed to extract colors from image:", error);
      alert(error instanceof Error ? error.message : "Failed to extract colors from image.");
    } finally {
      setImageExtracting(false);
      if (target) {
        target.value = "";
      }
    }
  };

  return (
    <div class="app">
      <header class="header">
        <div class="header-content">
          <div class="logo-container">
            <img src={faviconUrl} alt="Chromatic" class="logo" />
            <h1 class="app-title">Chromatic</h1>
          </div>
          <div class="tab-group" data-active={activeTab()} ref={tabGroupRef}>
            <button
              ref={previewTabRef}
              class={`tab-btn ${activeTab() === "preview" ? "active" : ""}`}
              onClick={() => handleTabChange("preview")}
            >
              Color Palette
            </button>
            <button
              ref={exportTabRef}
              class={`tab-btn ${activeTab() === "export" ? "active" : ""}`}
              onClick={() => handleTabChange("export")}
            >
              Export
            </button>
          </div>
          <div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
            <PresetSelector onSelect={setScheme} />
            <button
              onClick={handleImageExtractClick}
              class={`extract-image-btn ${imageExtracting() ? "loading" : ""}`}
              disabled={imageExtracting()}
            >
              {imageExtracting() ? "Extracting..." : "Extract from Image"}
            </button>
            <input
              ref={imageInputRef}
              id="image-extract-input"
              type="file"
              accept="image/*"
              onChange={handleImageFileSelected}
              disabled={imageExtracting()}
              style="display: none;"
            />
            <button onClick={handleResetClick} class="reset-btn">
              Reset to Default
            </button>
          </div>
        </div>
      </header>
      <main class="main">
        <div class="left-panel">
          <div class="tab-content">
            {activeTab() === "preview" ? (
              <ColorPicker scheme={scheme()} onColorChange={handleColorChange} />
            ) : (
              <div class="import-export-container">
                <ImportJSON onImport={handleImport} />
                <ExportJSON scheme={scheme()} />
              </div>
            )}
          </div>
        </div>
        <div class="right-panel">
          <Preview scheme={scheme()} />
        </div>
      </main>
      <ConfirmDialog
        open={showResetDialog()}
        title="Reset Colorscheme"
        message="Are you sure you want to reset all colors to default? This will discard all your changes."
        confirmText="Reset"
        cancelText="Cancel"
        storageKey="reset"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetDialog(false)}
      />
      <ConfirmDialog
        open={showImageExtractDialog()}
        title="Extract Colors from Image"
        message="This will replace your current colorscheme with colors extracted from the image. All your current changes will be lost."
        confirmText="Continue"
        cancelText="Cancel"
        storageKey="image"
        onConfirm={handleImageExtractConfirm}
        onCancel={() => setShowImageExtractDialog(false)}
      />
    </div>
  );
}
