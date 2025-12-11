import { For, createSignal, Show, createEffect } from "solid-js";
import { type ColorScheme, type ColorSchemeKey, colorNames } from "../types";
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb } from "../utils/colorUtils";
import ColorSwatch from "./ColorSwatch";

interface ColorPickerProps {
  scheme: ColorScheme;
  onColorChange: (key: ColorSchemeKey, value: string) => void;
}

const terminalColorNumbers: Record<ColorSchemeKey, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  brightBlack: 8,
  brightRed: 9,
  brightGreen: 10,
  brightYellow: 11,
  brightBlue: 12,
  brightMagenta: 13,
  brightCyan: 14,
  brightWhite: 15,
  background: -1,
  foreground: -1,
  activeBorder: -1,
  inactiveBorder: -1,
  urgentBorder: -1,
};

interface PickerState {
  key: ColorSchemeKey;
  x: number;
  y: number;
}

export default function ColorPicker(props: ColorPickerProps) {
  const [pickerState, setPickerState] = createSignal<PickerState | null>(null);
  const [hsv, setHsv] = createSignal({ h: 0, s: 100, v: 100 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragType, setDragType] = createSignal<"spectrum" | "hue" | null>(null);
  const [popupVisible, setPopupVisible] = createSignal(false);
  let popupRef: HTMLDivElement | undefined;
  let spectrumRef: HTMLDivElement | undefined;
  let hueRef: HTMLDivElement | undefined;

  const calculatePopupPosition = (targetRect: DOMRect): { x: number; y: number } => {
    const gap = 10;
    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const popupWidth = popupRef?.offsetWidth || 300;
    const popupHeight = popupRef?.offsetHeight || 450;
    const halfPopupWidth = popupWidth / 2;
    const maxPopupHeight = viewportHeight - padding * 2;
    const actualPopupHeight = Math.min(popupHeight, maxPopupHeight);

    let x = targetRect.left + targetRect.width / 2 - halfPopupWidth;
    if (x < padding) {
      x = padding;
    } else if (x + popupWidth > viewportWidth - padding) {
      x = viewportWidth - padding - popupWidth;
    }

    const spaceBelow = viewportHeight - targetRect.bottom - gap - padding;
    const spaceAbove = targetRect.top - gap - padding;
    let y: number;

    if (spaceBelow >= actualPopupHeight) {
      y = targetRect.bottom + gap;
    } else if (spaceAbove >= actualPopupHeight) {
      y = targetRect.top - actualPopupHeight - gap;
    } else {
      if (spaceBelow > spaceAbove) {
        y = viewportHeight - actualPopupHeight - padding;
      } else {
        y = padding;
      }
    }
    y = Math.max(padding, Math.min(y, viewportHeight - actualPopupHeight - padding));

    return { x, y };
  };

  const handleColorClick = (key: ColorSchemeKey, e: MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const currentHex = props.scheme[key];
    const rgb = hexToRgb(currentHex);
    const hsvValue = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsv({ h: hsvValue.h, s: hsvValue.s * 100, v: hsvValue.v * 100 });

    setPopupVisible(false);
    const { x, y } = calculatePopupPosition(rect);
    setPickerState({ key, x, y });
  };

  const updateColor = (newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s / 100, newHsv.v / 100);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const state = pickerState();
    if (state) {
      props.onColorChange(state.key, hex);
    }
  };

  const handleSpectrumClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const current = hsv();
    updateColor({ h: current.h, s: x * 100, v: (1 - y) * 100 });
  };

  const handleHueClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));

    const current = hsv();
    updateColor({ h, s: current.s, v: current.v });
  };

  const handleMouseDown = (type: "spectrum" | "hue") => {
    setIsDragging(true);
    setDragType(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;

    const current = hsv();
    const type = dragType();

    if (type === "spectrum" && spectrumRef) {
      const rect = spectrumRef.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      updateColor({ h: current.h, s: x * 100, v: (1 - y) * 100 });
    } else if (type === "hue" && hueRef) {
      const rect = hueRef.getBoundingClientRect();
      const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
      updateColor({ h, s: current.s, v: current.v });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  createEffect(() => {
    if (isDragging()) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  const closePicker = () => {
    setPickerState(null);
    setPopupVisible(false);
  };

  createEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pickerState()) {
        closePicker();
      }
    };
    if (pickerState()) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePicker();
    }
  };

  const getSpectrumGradient = () => {
    const current = hsv();
    return `linear-gradient(to bottom,
      hsl(${current.h}, 100%, 100%),
      hsl(${current.h}, 100%, 50%),
      hsl(${current.h}, 100%, 0%)
    ),
    linear-gradient(to right,
      hsla(${current.h}, 0%, 50%, 0),
      hsl(${current.h}, 100%, 50%)
    )`;
  };

  const getHueGradient = () => {
    const hues = [];
    for (let i = 0; i <= 360; i += 30) {
      hues.push(`hsl(${i}, 100%, 50%)`);
    }
    return `linear-gradient(to right, ${hues.join(", ")})`;
  };

  return (
    <>
      <div class="p-6 relative flex flex-col gap-6 flex-1 min-h-0 max-[768px]:p-5 max-[640px]:p-4 max-[640px]:gap-4">
        <div class="flex flex-col gap-3">
          <h3 class="text-[#c9d1d9] text-lg font-semibold uppercase tracking-wide m-0">
            Terminal Colors
          </h3>
          <div class="grid grid-cols-8 gap-2 max-[1400px]:grid-cols-4 max-[1024px]:grid-cols-4 max-[768px]:grid-cols-2 max-[640px]:grid-cols-2">
            <For each={colorNames}>
              {(color) => (
                <div data-color-key={color.key}>
                  <ColorSwatch
                    color={props.scheme[color.key]}
                    label={color.label}
                    colorNumber={terminalColorNumbers[color.key]}
                    onClick={(e) => handleColorClick(color.key, e)}
                  />
                </div>
              )}
            </For>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <h3 class="text-[#c9d1d9] text-lg font-semibold uppercase tracking-wide m-0">
            Base Colors
          </h3>
          <div class="grid grid-cols-2 gap-2 max-[1024px]:grid-cols-1">
            <div data-color-key="background">
              <ColorSwatch
                color={props.scheme.background}
                label="Background"
                onClick={(e) => handleColorClick("background", e)}
                aspectRatio="wide"
              />
            </div>
            <div data-color-key="foreground">
              <ColorSwatch
                color={props.scheme.foreground}
                label="Foreground"
                onClick={(e) => handleColorClick("foreground", e)}
                aspectRatio="wide"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <h3 class="text-[#c9d1d9] text-lg font-semibold uppercase tracking-wide m-0">
            Window Borders
          </h3>
          <div class="grid grid-cols-3 gap-2 max-[768px]:grid-cols-2 max-[640px]:grid-cols-2">
            <div data-color-key="activeBorder">
              <ColorSwatch
                color={props.scheme.activeBorder}
                label="Active"
                onClick={(e) => handleColorClick("activeBorder", e)}
              />
            </div>
            <div data-color-key="inactiveBorder">
              <ColorSwatch
                color={props.scheme.inactiveBorder}
                label="Inactive"
                onClick={(e) => handleColorClick("inactiveBorder", e)}
              />
            </div>
            <div data-color-key="urgentBorder">
              <ColorSwatch
                color={props.scheme.urgentBorder}
                label="Urgent"
                onClick={(e) => handleColorClick("urgentBorder", e)}
              />
            </div>
          </div>
        </div>
      </div>

      <Show when={pickerState()}>
        {(state) => {
          const handlePopupRef = (el: HTMLDivElement) => {
            popupRef = el;
            if (el) {
              requestAnimationFrame(() => {
                const currentState = pickerState();
                if (currentState && popupRef) {
                  const targetElement = document.querySelector(
                    `[data-color-key="${currentState.key}"]`
                  ) as HTMLElement;
                  if (targetElement) {
                    const rect = targetElement.getBoundingClientRect();
                    const { x, y } = calculatePopupPosition(rect);
                    setPickerState({ ...currentState, x, y });
                    setPopupVisible(true);
                  }
                }
              });
            }
          };

          return (
            <div class="fixed inset-0 bg-black/50 z-[1000]" onClick={handleBackdropClick}>
              <div
                ref={handlePopupRef}
                class="fixed bg-[#161b22] border border-[#30363d] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[1001] w-[300px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto box-border max-[640px]:w-[calc(100vw-1rem)] max-[640px]:max-w-[300px] transition-opacity duration-150"
                style={{
                  left: `${state().x}px`,
                  top: `${state().y}px`,
                  opacity: popupVisible() ? 1 : 0,
                  "pointer-events": popupVisible() ? "auto" : "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div class="flex items-center justify-between py-4 px-5 border-b border-[#30363d]">
                  <span class="text-[#c9d1d9] text-sm font-semibold">Pick Color</span>
                  <button
                    class="bg-transparent border-0 text-[#8b949e] text-2xl leading-none cursor-pointer p-1 w-8 h-8 flex items-center justify-center rounded transition-all duration-200 font-light hover:bg-[#21262d] hover:text-[#c9d1d9]"
                    onClick={closePicker}
                  >
                    ×
                  </button>
                </div>
                <div class="p-5 flex flex-col gap-5">
                  <div class="flex gap-2 max-[640px]:flex-col">
                    <div class="flex flex-col gap-2">
                      {(() => {
                        const current = hsv();
                        return (
                          <>
                            <div
                              ref={spectrumRef}
                              class="color-spectrum w-[250px] h-[200px] rounded-md border border-[#30363d] cursor-crosshair relative overflow-hidden max-[640px]:w-full max-[640px]:max-w-[250px]"
                              style={{ background: getSpectrumGradient() }}
                              onClick={handleSpectrumClick}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown("spectrum");
                              }}
                            >
                              <div
                                class="absolute w-3 h-3 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none [box-shadow:0_0_0_1px_rgba(0,0,0,0.5)]"
                                style={{
                                  left: `${current.s}%`,
                                  top: `${100 - current.v}%`,
                                }}
                              />
                            </div>
                            <div
                              ref={hueRef}
                              class="color-hue w-[250px] h-5 rounded-md border border-[#30363d] cursor-pointer relative overflow-hidden max-[640px]:w-full max-[640px]:max-w-[250px]"
                              style={{ background: getHueGradient() }}
                              onClick={handleHueClick}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleMouseDown("hue");
                              }}
                            >
                              <div
                                class="absolute top-0 bottom-0 w-1 bg-white border-2 border-black/50 -translate-x-1/2 pointer-events-none [box-shadow:0_0_0_1px_rgba(255,255,255,0.5)]"
                                style={{
                                  left: `${(current.h / 360) * 100}%`,
                                }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div class="flex flex-col gap-3">
                    {(() => {
                      const current = hsv();
                      const rgb = hsvToRgb(current.h, current.s / 100, current.v / 100);
                      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

                      const updateRgbChannel = (channel: "r" | "g" | "b", value: number) => {
                        const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) };
                        const hsvValue = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
                        setHsv({
                          h: hsvValue.h,
                          s: hsvValue.s * 100,
                          v: hsvValue.v * 100,
                        });
                        props.onColorChange(state().key, rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                      };

                      const RgbInput = (inputProps: {
                        label: string;
                        channel: "r" | "g" | "b";
                        value: number;
                      }) => {
                        const handleInput = (e: Event) => {
                          const target = e.currentTarget as HTMLInputElement;
                          let value = target.value.replace(/[^0-9]/g, "");
                          if (value === "") value = "0";
                          updateRgbChannel(inputProps.channel, parseInt(value) || 0);
                        };

                        const handleBlur = (e: Event) => {
                          const target = e.currentTarget as HTMLInputElement;
                          const clamped = Math.max(0, Math.min(255, parseInt(target.value) || 0));
                          target.value = clamped.toString();
                        };

                        return (
                          <div class="flex-1 flex items-center gap-1 min-w-0">
                            <label class="text-[#8b949e] text-sm font-medium flex-shrink-0">
                              {inputProps.label}:
                            </label>
                            <div class="flex-1 flex items-stretch bg-[#0d1117] border border-[#30363d] rounded overflow-hidden min-w-0 focus-within:border-[#58a6ff]">
                              <input
                                type="text"
                                value={inputProps.value}
                                onInput={handleInput}
                                onBlur={handleBlur}
                                class="flex-1 bg-transparent border-0 px-2 py-2 text-[#c9d1d9] font-mono text-sm transition-[border-color] duration-200 w-0 min-w-0 box-border focus:outline-none"
                              />
                              <div class="flex flex-col border-l border-[#30363d] flex-shrink-0">
                                <button
                                  type="button"
                                  class="bg-transparent border-0 text-[#8b949e] text-[0.65rem] leading-none px-1 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center flex-1 select-none hover:bg-[#21262d] hover:text-[#c9d1d9] active:bg-[#30363d]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateRgbChannel(
                                      inputProps.channel,
                                      Math.min(255, inputProps.value + 1)
                                    );
                                  }}
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  class="bg-transparent border-0 text-[#8b949e] text-[0.65rem] leading-none px-1 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center flex-1 select-none hover:bg-[#21262d] hover:text-[#c9d1d9] active:bg-[#30363d]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateRgbChannel(
                                      inputProps.channel,
                                      Math.max(0, inputProps.value - 1)
                                    );
                                  }}
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      };

                      return (
                        <>
                          <div
                            class="w-full h-[50px] rounded-md border border-[#30363d]"
                            style={{ "background-color": hex }}
                          />
                          <div class="flex items-center gap-2">
                            <label class="text-[#8b949e] text-sm font-medium min-w-[40px]">
                              Hex:
                            </label>
                            <div class="relative flex-1 flex items-center">
                              <span class="absolute left-2 text-[#8b949e] font-mono text-sm pointer-events-none select-none z-10">
                                #
                              </span>
                              <input
                                type="text"
                                value={hex.substring(1)}
                                onInput={(e) => {
                                  let value = e.currentTarget.value;
                                  value = value.replace(/[^0-9A-Fa-f]/g, "");
                                  if (value.length > 6) {
                                    value = value.substring(0, 6);
                                  }
                                  e.currentTarget.value = value;

                                  if (/^[0-9A-Fa-f]{6}$/.test(value)) {
                                    const fullHex = "#" + value;
                                    const rgbVal = hexToRgb(fullHex);
                                    const hsvValue = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b);
                                    setHsv({
                                      h: hsvValue.h,
                                      s: hsvValue.s * 100,
                                      v: hsvValue.v * 100,
                                    });
                                    props.onColorChange(state().key, fullHex);
                                  }
                                }}
                                class="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-2 pl-6 text-[#c9d1d9] font-mono text-sm transition-[border-color] duration-200 focus:outline-none focus:border-[#58a6ff]"
                              />
                            </div>
                          </div>
                          <div class="flex gap-2">
                            <RgbInput label="R" channel="r" value={rgb.r} />
                            <RgbInput label="G" channel="g" value={rgb.g} />
                            <RgbInput label="B" channel="b" value={rgb.b} />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Show>
    </>
  );
}
