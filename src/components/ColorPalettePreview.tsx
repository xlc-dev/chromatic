import type { ColorScheme } from "../types";

interface ColorPalettePreviewProps {
  scheme: ColorScheme;
}

export default function ColorPalettePreview(props: ColorPalettePreviewProps) {
  return (
    <div class="mt-3">
      <div class="grid grid-cols-8 gap-0.5">
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.black }}
          title="Black"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.red }}
          title="Red"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.green }}
          title="Green"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.yellow }}
          title="Yellow"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.blue }}
          title="Blue"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.magenta }}
          title="Magenta"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.cyan }}
          title="Cyan"
        />
        <div
          class="aspect-square rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.white }}
          title="White"
        />
      </div>
      <div class="grid grid-cols-2 gap-0.5 mt-0.5">
        <div
          class="aspect-[2/1] rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.background }}
          title="Background"
        />
        <div
          class="aspect-[2/1] rounded-sm border border-white/10"
          style={{ "background-color": props.scheme.foreground }}
          title="Foreground"
        />
      </div>
    </div>
  );
}
