import { type JSX } from "solid-js";

interface ButtonProps {
  children: JSX.Element;
  onClick?: () => void;
  class?: string;
  disabled?: boolean;
  variant?: "default" | "success";
  type?: "button" | "submit";
}

export default function Button(props: ButtonProps) {
  const baseClasses =
    "bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(200,209,217,0.1)] before:to-transparent before:transition-[left] before:duration-500 hover:before:left-full hover:bg-[#30363d] hover:text-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.2)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

  const variantClasses =
    props.variant === "success"
      ? "bg-[#58a6ff] text-white border-[#58a6ff] hover:bg-[#58a6ff] hover:border-[#58a6ff] hover:shadow-[0_0_20px_rgba(88,166,255,0.4),0_4px_12px_rgba(88,166,255,0.2)]"
      : "";

  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      class={`${baseClasses} ${variantClasses} ${props.class || ""}`}
    >
      {props.children}
    </button>
  );
}
