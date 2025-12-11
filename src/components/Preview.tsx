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

function measureTextWidth(text: string, fontSize: string, fontFamily: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return text.length * 8;
  context.font = `${fontSize} ${fontFamily}`;
  return context.measureText(text).width;
}

function wrapLine(line: CodeLine, maxWidthPx: number, lineNumberWidthPx: number): WrappedLine[] {
  const fontSize = "0.8rem";
  const fontFamily = '"Fira Code", "Courier New", monospace';
  const availableWidth = maxWidthPx - lineNumberWidthPx - 32;

  const fullLineWidth = measureTextWidth(line.content, fontSize, fontFamily);

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
    const tokenWidth = measureTextWidth(token.text, fontSize, fontFamily);

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
          const charWidth = measureTextWidth(char, fontSize, fontFamily);

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

    const wrapped: WrappedLine[] = [];
    let lineIndex = 0;

    for (const line of currentLines()) {
      const lines = wrapLine(line, containerWidth, lineNumberWidth);
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
    <div class="bg-[#161b22] rounded-lg border border-[#30363d] shadow-[0_1px_3px_rgba(0,0,0,0.3)] p-8 relative overflow-hidden min-h-[600px] max-[768px]:p-6 max-[640px]:p-4">
      <div class="absolute inset-0 rounded-lg p-px bg-gradient-to-br from-[#58a6ff33] via-[#bc8cff33] via-[#f8514933] to-[#3fb95033] pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] [mask-composite:exclude]"></div>
      <div class="flex justify-between items-start mb-8 gap-8 max-[1200px]:flex-col max-[1200px]:items-start max-[1200px]:gap-4">
        <div>
          <h2 class="mb-4 text-[#c9d1d9] text-sm font-semibold">Colorscheme Preview</h2>
          <p class="text-[#8b949e] text-xs mb-0 leading-relaxed">
            See what your colorscheme looks like.
          </p>
        </div>
        <div
          class="flex items-center gap-2 flex-shrink-0 relative max-[1200px]:w-full"
          ref={dropdownRef}
        >
          <label class="text-[#8b949e] text-sm font-medium">Language:</label>
          <div class="relative">
            <button
              class="px-3 py-2 rounded text-sm cursor-pointer transition-all duration-200 font-mono flex items-center gap-2 min-w-[140px] justify-between"
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

      <div class="relative w-full min-h-[600px] mt-8 max-[1024px]:min-h-[500px] max-[768px]:min-h-[450px] max-[768px]:mt-6 max-[640px]:min-h-[400px] max-[640px]:mt-4">
        <div
          class={`absolute border-2 rounded-lg bg-[#0d1117] shadow-[0_8px_24px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-hidden w-[70%] h-[80%] top-[2%] left-[3%] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] max-[1024px]:w-[85%] max-[1024px]:h-[55%] max-[1024px]:top-[5%] max-[1024px]:left-[5%] max-[768px]:w-[90%] max-[768px]:h-[50%] max-[768px]:top-[5%] max-[768px]:left-[5%] max-[640px]:w-[95%] max-[640px]:h-[45%] ${
            activeWindow() === "editor"
              ? "z-[2] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              : "z-[1] opacity-95"
          }`}
          style={{
            "border-color":
              activeWindow() === "editor" ? props.scheme.activeBorder : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("editor")}
        >
          <WindowHeader scheme={props.scheme} title={`${currentExample().filename} — chromatic`} />
          <div
            ref={editorContentRef}
            class="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto overflow-x-hidden scrollbar-custom flex flex-col gap-0"
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
          class={`absolute border-2 rounded-lg bg-[#0d1117] shadow-[0_8px_24px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-hidden w-[65%] h-[70%] top-[20%] right-[3%] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] max-[1024px]:w-[80%] max-[1024px]:h-[50%] max-[1024px]:top-[50%] max-[1024px]:right-[5%] max-[768px]:w-[85%] max-[768px]:h-[45%] max-[768px]:top-[55%] max-[768px]:right-[5%] max-[640px]:w-[95%] max-[640px]:h-[40%] max-[640px]:top-[50%] ${
            activeWindow() === "terminal"
              ? "z-[2] shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              : "z-[1] opacity-95"
          }`}
          style={{
            "border-color":
              activeWindow() === "terminal"
                ? props.scheme.activeBorder
                : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("terminal")}
        >
          <WindowHeader scheme={props.scheme} title="~/dev/chromatic — zsh" />
          <div
            class="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto overflow-x-hidden scrollbar-custom flex flex-col gap-0"
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
