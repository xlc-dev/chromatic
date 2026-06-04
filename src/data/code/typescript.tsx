// @ts-nocheck
import { createSignal, createEffect } from "solid-js";

interface ColorScheme {
  name: string;
  background: string;
  foreground: string;
  red: string;
}

const defaultScheme: ColorScheme = {
  name: "Chromatic Default",
  background: "#0c0c0c",
  foreground: "#cccccc",
  red: "#cd3131",
};

export default function App() {
  const [scheme] = createSignal<ColorScheme>(defaultScheme);

  createEffect(() => {
    localStorage.setItem("scheme", JSON.stringify(scheme()));
  });

  return (
    <div class="preview" style={{ color: scheme().foreground, background: scheme().background }}>
      {scheme().name}
    </div>
  );
}
