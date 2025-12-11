interface ColorSwatchProps {
  color: string;
  label: string;
  colorNumber?: number;
  onClick: (e: MouseEvent) => void;
  aspectRatio?: "square" | "wide";
}

export default function ColorSwatch(props: ColorSwatchProps) {
  const aspectClass = props.aspectRatio === "wide" ? "aspect-[2/1]" : "aspect-square";

  return (
    <div
      class={`${aspectClass} rounded cursor-pointer relative overflow-hidden transition-all duration-150 border-2 border-white/8 flex flex-col justify-end hover:scale-105 hover:shadow-lg hover:border-white/25 hover:z-10 active:translate-y-0`}
      style={{ "background-color": props.color }}
      onClick={props.onClick}
    >
      <div class="bg-gradient-to-t from-black/90 to-transparent p-1 text-white flex flex-col gap-0.5 w-full">
        <div class="flex items-center gap-1">
          {props.colorNumber !== undefined && (
            <span class="text-[0.65rem] font-bold bg-white/25 px-1 py-0.5 rounded font-mono [text-shadow:none] leading-tight">
              {props.colorNumber}
            </span>
          )}
          <span class="text-[0.7rem] font-semibold uppercase tracking-wide [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] leading-tight">
            {props.label}
          </span>
        </div>
        <span class="text-[0.7rem] font-mono opacity-95 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] leading-tight">
          {props.color}
        </span>
      </div>
    </div>
  );
}
