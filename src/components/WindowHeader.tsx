import type { ColorScheme } from "../types";

interface WindowHeaderProps {
  scheme: ColorScheme;
  title: string;
}

export default function WindowHeader(props: WindowHeaderProps) {
  return (
    <div
      class="bg-[rgba(13,17,23,0.9)] px-3 py-2 flex items-center gap-2 border-b border-white/10 select-none"
      style={{
        background: props.scheme.brightBlack,
        "border-bottom-color": props.scheme.black,
      }}
    >
      <div class="flex gap-1.5 items-center">
        <span
          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: props.scheme.red }}
        ></span>
        <span
          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: props.scheme.yellow }}
        ></span>
        <span
          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: props.scheme.green }}
        ></span>
      </div>
      <div
        class="text-xs text-[#c9d1d9] font-medium flex-1 text-center font-mono"
        style={{ color: props.scheme.foreground }}
      >
        {props.title}
      </div>
      <div class="w-[34px] flex-shrink-0"></div>
    </div>
  );
}
