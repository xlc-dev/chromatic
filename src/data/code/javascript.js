// @ts-nocheck
import { createSignal } from "solid-js";

function createColorScheme() {
  return {
    name: "Chromatic Default",
    background: "#0c0c0c",
    foreground: "#cccccc",
    red: "#cd3131",
  };
}

function App() {
  const [scheme] = createSignal(createColorScheme());

  return <pre>{JSON.stringify(scheme(), null, 2)}</pre>;
}
