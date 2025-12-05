import { createSignal, For, Show, createEffect } from "solid-js";
import type { ColorScheme } from "../types";
import codeExamplesData, { type Language, type CodeExample } from "../data/code";
import { highlightSyntax, type CodeToken } from "../utils/syntaxHighlighter";

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
    <div class="preview-container">
      <div class="preview-header">
        <div>
          <h2>Colorscheme Preview</h2>
          <p class="preview-subtitle">See what your colorscheme looks like.</p>
        </div>
        <div class="language-selector" ref={dropdownRef}>
          <label class="language-label">Language:</label>
          <div class="custom-dropdown">
            <button
              class="custom-dropdown-button"
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
              <span class="dropdown-arrow" style={{ color: props.scheme.foreground }}>
                {isDropdownOpen() ? "▲" : "▼"}
              </span>
            </button>
            <Show when={isDropdownOpen()}>
              <div
                class="custom-dropdown-menu"
                style={{
                  background: props.scheme.background,
                  border: `1px solid ${props.scheme.brightBlack}`,
                }}
              >
                <For each={languageOptions}>
                  {(option) => (
                    <button
                      class={`custom-dropdown-item ${selectedLanguage() === option.value ? "selected" : ""}`}
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

      <div class="preview-windows-container">
        <div
          class={`hyprland-window editor-window ${activeWindow() === "editor" ? "active" : "inactive"}`}
          style={{
            "border-color":
              activeWindow() === "editor" ? props.scheme.activeBorder : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("editor")}
        >
          <div
            class="window-titlebar"
            style={{
              background: props.scheme.brightBlack,
              "border-bottom-color": props.scheme.black,
            }}
          >
            <div class="window-titlebar-dots">
              <span class="dot" style={{ background: props.scheme.red }}></span>
              <span class="dot" style={{ background: props.scheme.yellow }}></span>
              <span class="dot" style={{ background: props.scheme.green }}></span>
            </div>
            <div class="window-title" style={{ color: props.scheme.foreground }}>
              {currentExample().filename} — chromatic
            </div>
            <div class="window-titlebar-spacer"></div>
          </div>
          <div
            ref={editorContentRef}
            class="window-content editor-content"
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
                  <div class="editor-line">
                    <span class="line-number" style={{ color: props.scheme.brightBlack }}>
                      {lineNumber}
                    </span>
                    <span class="editor-line-content">
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
          class={`hyprland-window terminal-window ${activeWindow() === "terminal" ? "active" : "inactive"}`}
          style={{
            "border-color":
              activeWindow() === "terminal"
                ? props.scheme.activeBorder
                : props.scheme.inactiveBorder,
          }}
          onClick={() => setActiveWindow("terminal")}
        >
          <div
            class="window-titlebar"
            style={{
              background: props.scheme.brightBlack,
              "border-bottom-color": props.scheme.black,
            }}
          >
            <div class="window-titlebar-dots">
              <span class="dot" style={{ background: props.scheme.red }}></span>
              <span class="dot" style={{ background: props.scheme.yellow }}></span>
              <span class="dot" style={{ background: props.scheme.green }}></span>
            </div>
            <div class="window-title" style={{ color: props.scheme.foreground }}>
              ~/dev/chromatic — zsh
            </div>
            <div class="window-titlebar-spacer"></div>
          </div>
          <div
            class="window-content terminal-content"
            style={{
              background: props.scheme.background,
              color: props.scheme.foreground,
            }}
          >
            <div class="terminal-line">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span style={{ color: props.scheme.cyan }}>ls -la</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.brightBlack }}>total 48</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.blue }}>drwxr-xr-x</span>{" "}
              <span style={{ color: props.scheme.white }}>8</span> user user{" "}
              <span style={{ color: props.scheme.white }}>4096</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:34</span>{" "}
              <span style={{ color: props.scheme.cyan }}>.</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.blue }}>drwxr-xr-x</span>{" "}
              <span style={{ color: props.scheme.white }}>3</span> user user{" "}
              <span style={{ color: props.scheme.white }}>4096</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:30</span>{" "}
              <span style={{ color: props.scheme.cyan }}>..</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.blue }}>-rw-r--r--</span>{" "}
              <span style={{ color: props.scheme.white }}>1</span> user user{" "}
              <span style={{ color: props.scheme.white }}>1024</span> Jan{" "}
              <span style={{ color: props.scheme.white }}>15 12:33</span>{" "}
              <span style={{ color: props.scheme.white }}>package.json</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span style={{ color: props.scheme.yellow }}>git</span>{" "}
              <span style={{ color: props.scheme.cyan }}>status</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.green }}>On branch</span>{" "}
              <span style={{ color: props.scheme.white }}>main</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.red }}>modified:</span>{" "}
              <span style={{ color: props.scheme.white }}>src/components/Preview.tsx</span>
            </div>
            <div class="terminal-line">
              <span style={{ color: props.scheme.green }}>user@chromatic</span>
              <span style={{ color: props.scheme.white }}>:</span>
              <span style={{ color: props.scheme.blue }}>~/dev/chromatic</span>
              <span style={{ color: props.scheme.white }}>$ </span>
              <span class="cursor" style={{ background: props.scheme.foreground }}>
                {" "}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
