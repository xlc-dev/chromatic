import { createSignal, For, Show, createEffect } from "solid-js";
import { type ColorScheme } from "../types";
import codeExamplesData, { type Language, type CodeExample } from "../data/code";
import { highlightSyntax, type CodeToken } from "../utils/syntaxHighlighter";
import WindowHeader from "./WindowHeader";

interface PreviewProps {
  scheme: ColorScheme;
}

interface CodeLine {
  content: string;
  tokens: CodeToken[];
}

interface WrappedLine {
  tokens: CodeToken[];
  isContinuation: boolean;
  originalLineIndex: number;
}

const codeExamples = codeExamplesData;

function parseCodeExample(example: CodeExample, language: Language): CodeLine[] {
  const lines = example.code.split("\n");
  const filteredLines = lines.filter((line) => !line.includes("@ts-nocheck"));
  return filteredLines.map((line) => ({
    content: line,
    tokens: highlightSyntax(line, language),
  }));
}

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function measureTextWidth(text: string, font: string): number {
  if (typeof document === "undefined") return text.length * 8;
  if (!measureCanvas) measureCanvas = document.createElement("canvas");
  if (!measureCtx) measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) return text.length * 8;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

function wrapLine(
  line: CodeLine,
  maxWidthPx: number,
  lineNumberWidthPx: number,
  font: string
): WrappedLine[] {
  const availableWidth = maxWidthPx - lineNumberWidthPx - 32;

  const fullLineWidth = measureTextWidth(line.content, font);

  if (fullLineWidth <= availableWidth) {
    return [{ tokens: line.tokens, isContinuation: false, originalLineIndex: 0 }];
  }

  const wrapped: WrappedLine[] = [];
  let currentTokens: CodeToken[] = [];
  let currentWidth = 0;
  let tokenIndex = 0;

  while (tokenIndex < line.tokens.length) {
    const token = line.tokens[tokenIndex];
    if (!token) {
      tokenIndex++;
      continue;
    }
    const tokenWidth = measureTextWidth(token.text, font);

    if (currentWidth + tokenWidth <= availableWidth) {
      currentTokens.push(token);
      currentWidth += tokenWidth;
      tokenIndex++;
    } else {
      if (currentTokens.length > 0) {
        wrapped.push({
          tokens: [...currentTokens],
          isContinuation: wrapped.length > 0,
          originalLineIndex: wrapped.length,
        });
        currentTokens = [];
        currentWidth = 0;
      } else {
        let charIndex = 0;
        while (charIndex < token.text.length) {
          const char = token.text[charIndex];
          if (!char) {
            charIndex++;
            continue;
          }
          const charWidth = measureTextWidth(char, font);

          if (currentWidth + charWidth <= availableWidth) {
            const lastToken = currentTokens[currentTokens.length - 1];
            if (currentTokens.length === 0 || !lastToken || lastToken.color !== token.color) {
              currentTokens.push({ text: char, color: token.color });
            } else {
              lastToken.text += char;
            }
            currentWidth += charWidth;
            charIndex++;
          } else {
            if (currentTokens.length > 0) {
              wrapped.push({
                tokens: [...currentTokens],
                isContinuation: wrapped.length > 0,
                originalLineIndex: wrapped.length,
              });
              currentTokens = [];
              currentWidth = 0;
            } else {
              currentTokens.push({ text: char, color: token.color });
              wrapped.push({
                tokens: [...currentTokens],
                isContinuation: wrapped.length > 0,
                originalLineIndex: wrapped.length,
              });
              currentTokens = [];
              currentWidth = 0;
              charIndex++;
            }
          }
        }
        tokenIndex++;
      }
    }
  }

  if (currentTokens.length > 0) {
    wrapped.push({
      tokens: currentTokens,
      isContinuation: wrapped.length > 0,
      originalLineIndex: wrapped.length,
    });
  }

  return wrapped.length > 0
    ? wrapped
    : [{ tokens: line.tokens, isContinuation: false, originalLineIndex: 0 }];
}

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "zig", label: "Zig" },
  { value: "shell", label: "Shell" },
  { value: "lua", label: "Lua" },
  { value: "ruby", label: "Ruby" },
];

export default function Preview(props: PreviewProps) {
  const [activeWindow, setActiveWindow] = createSignal<"editor" | "terminal">("editor");
  const [selectedLanguage, setSelectedLanguage] = createSignal<Language>("typescript");
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [wrappedLines, setWrappedLines] = createSignal<WrappedLine[]>([]);
  let dropdownRef: HTMLDivElement | undefined;
  let editorContentRef: HTMLDivElement | undefined;

  const currentExample = () => codeExamples[selectedLanguage()];
  const currentLabel = () =>
    languageOptions.find((opt) => opt.value === selectedLanguage())?.label || "TypeScript";

  const currentLines = () => parseCodeExample(currentExample(), selectedLanguage());

  const updateWrappedLines = () => {
    if (!editorContentRef) return;

    const containerWidth = editorContentRef.clientWidth;
    const lineNumberWidth = 56;
    const font = getComputedStyle(editorContentRef).font || "12px ui-monospace, monospace";

    const wrapped: WrappedLine[] = [];
    let lineIndex = 0;

    for (const line of currentLines()) {
      const lines = wrapLine(line, containerWidth, lineNumberWidth, font);
      for (const wrappedLine of lines) {
        wrapped.push({
          ...wrappedLine,
          originalLineIndex: lineIndex,
        });
      }
      lineIndex++;
    }

    setWrappedLines(wrapped);
  };

  createEffect(() => {
    if (!editorContentRef) return;

    updateWrappedLines();

    const resizeObserver = new ResizeObserver(() => {
      updateWrappedLines();
    });

    resizeObserver.observe(editorContentRef);

    window.addEventListener("resize", updateWrappedLines);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWrappedLines);
    };
  });

  createEffect(() => {
    selectedLanguage();
    if (editorContentRef) {
      updateWrappedLines();
    }
  });

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    setIsDropdownOpen(false);
  };

  createEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen()) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  return (
    <div
      class="chromatic-preview-scroll app-panel h-full min-h-[600px] p-6 relative overflow-hidden max-[640px]:p-4"
      style={{
        "--preview-scrollbar-track": props.scheme.black,
        "--preview-scrollbar-thumb": props.scheme.brightBlack,
      }}
    >
      <div class="absolute inset-0 rounded-lg p-px bg-gradient-to-br from-[#58a6ff33] via-[#bc8cff33] via-[#f8514933] to-[#3fb95033] pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] [mask-composite:exclude]"></div>
      <div class="flex justify-between items-start mb-6 gap-6 max-[1200px]:flex-col max-[1200px]:items-start max-[1200px]:gap-4">
        <div>
          <h2 class="section-heading mb-3">Colorscheme Preview</h2>
          <p class="panel-copy max-w-md">
            Sample editor and terminal using your palette. This is not a 1-1 representation. Your
            real apps may look a bit different depending on font, highlighter parser, type of
            application, etc.
          </p>
        </div>
        <div
          class="flex items-center gap-2 flex-shrink-0 relative max-[1200px]:w-full"
          ref={dropdownRef}
        >
          <label class="text-[#8b949e] text-xs font-medium uppercase tracking-wide">
            Language:
          </label>
          <div class="relative">
            <button
              class="control px-3 font-mono flex items-center gap-2 min-w-[140px] justify-between cursor-pointer transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen());
              }}
              style={{
                background: props.scheme.background,
                color: props.scheme.foreground,
                border: `1px solid ${props.scheme.brightBlack}`,
              }}
            >
              <span>{currentLabel()}</span>
              <span
                class="text-xs transition-transform duration-200"
                style={{ color: props.scheme.foreground }}
              >
                {isDropdownOpen() ? "▲" : "▼"}
              </span>
            </button>
            <Show when={isDropdownOpen()}>
              <div
                class="absolute top-[calc(100%+4px)] right-0 min-w-[140px] rounded shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-dropdown-fade-in max-[1200px]:w-full"
                style={{
                  background: props.scheme.background,
                  border: `1px solid ${props.scheme.brightBlack}`,
                }}
              >
                <For each={languageOptions}>
                  {(option) => (
                    <button
                      class={`w-full px-3 py-2 text-left border-0 cursor-pointer text-sm font-mono transition-all duration-150 block first:rounded-t last:rounded-b ${
                        selectedLanguage() === option.value ? "font-semibold" : ""
                      }`}
                      onClick={() => handleSelectLanguage(option.value)}
                      style={{
                        color: props.scheme.foreground,
                        background:
                          selectedLanguage() === option.value
                            ? props.scheme.brightBlack
                            : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLanguage() !== option.value) {
                          e.currentTarget.style.background = props.scheme.brightBlack;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLanguage() !== option.value) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="relative w-full min-h-[600px] mt-6 max-[1024px]:min-h-[500px] max-[768px]:min-h-[450px] max-[640px]:min-h-[400px] max-[640px]:mt-4">
        <div
          class={`preview-window absolute w-[76%] h-[68%] top-[4%] left-[4%] max-[1024px]:w-[85%] max-[1024px]:h-[55%] max-[1024px]:top-[5%] max-[1024px]:left-[5%] max-[768px]:w-[90%] max-[768px]:h-[50%] max-[768px]:top-[5%] max-[768px]:left-[5%] max-[640px]:w-[95%] max-[640px]:h-[45%] ${
            activeWindow() === "editor"
              ? "z-[2] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              : "z-[1] opacity-95"
          }`}
          style={{
            background: props.scheme.background,
            "border-color":
              activeWindow() === "editor" ? props.scheme.activeBorder : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("editor")}
        >
          <WindowHeader scheme={props.scheme} title={`${currentExample().filename} — chromatic`} />
          <div
            ref={editorContentRef}
            class="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto overflow-x-hidden flex flex-col gap-0"
            style={{
              background: props.scheme.background,
              color: props.scheme.foreground,
            }}
          >
            <For each={wrappedLines()}>
              {(wrappedLine) => {
                const lineNumber = wrappedLine.isContinuation
                  ? ""
                  : wrappedLine.originalLineIndex + 1;
                return (
                  <div class="flex items-start min-h-[1.6em]">
                    <span
                      class="inline-block w-10 text-right pr-4 flex-shrink-0 select-none whitespace-nowrap"
                      style={{ color: props.scheme.brightBlack }}
                    >
                      {lineNumber}
                    </span>
                    <span class="flex-1 whitespace-pre min-w-0">
                      <For each={wrappedLine.tokens}>
                        {(token) => (
                          <span style={{ color: props.scheme[token.color] }}>{token.text}</span>
                        )}
                      </For>
                    </span>
                  </div>
                );
              }}
            </For>
          </div>
        </div>

        <div
          class={`preview-window absolute w-[76%] h-[68%] top-[28%] right-[4%] max-[1024px]:w-[85%] max-[1024px]:h-[55%] max-[1024px]:top-[45%] max-[1024px]:right-[5%] max-[768px]:w-[90%] max-[768px]:h-[50%] max-[768px]:top-[50%] max-[768px]:right-[5%] max-[640px]:w-[95%] max-[640px]:h-[45%] max-[640px]:top-[50%] ${
            activeWindow() === "terminal"
              ? "z-[2] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              : "z-[1] opacity-95"
          }`}
          style={{
            background: props.scheme.background,
            "border-color":
              activeWindow() === "terminal"
                ? props.scheme.activeBorder
                : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("terminal")}
        >
          <WindowHeader scheme={props.scheme} title="~/dev/chromatic — zsh" />
          <div
            class="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto overflow-x-hidden flex flex-col gap-0"
            style={{
              background: props.scheme.background,
              color: props.scheme.foreground,
            }}
          >
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span style={{ color: props.scheme.cyan }}>ls -la</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.brightBlack }}>total 48</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.blue }}>drwxr-xr-x</span>{" "}
              <span style={{ color: props.scheme.white }}>8</span> user user{" "}
              <span style={{ color: props.scheme.white }}>4096</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:34</span>{" "}
              <span style={{ color: props.scheme.cyan }}>.</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.blue }}>drwxr-xr-x</span>{" "}
              <span style={{ color: props.scheme.white }}>3</span> user user{" "}
              <span style={{ color: props.scheme.white }}>4096</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:30</span>{" "}
              <span style={{ color: props.scheme.cyan }}>..</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.blue }}>-rw-r--r--</span>{" "}
              <span style={{ color: props.scheme.white }}>1</span> user user{" "}
              <span style={{ color: props.scheme.white }}>1024</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:33</span>{" "}
              <span style={{ color: props.scheme.white }}>package.json</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span style={{ color: props.scheme.yellow }}>git</span>{" "}
              <span style={{ color: props.scheme.cyan }}>status</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.green }}>On branch</span>{" "}
              <span style={{ color: props.scheme.white }}>main</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.red }}>modified:</span>{" "}
              <span style={{ color: props.scheme.white }}>src/components/Preview.tsx</span>
            </div>
            <div class="whitespace-pre min-h-[1.6em]">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span
                class="inline-block w-2 h-[1.2em] ml-1 animate-blink"
                style={{ background: props.scheme.foreground }}
              >
                {" "}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
