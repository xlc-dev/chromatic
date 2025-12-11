interface DividerProps {
  text?: string;
}

export default function Divider(props: DividerProps) {
  return (
    <div class="flex items-center text-center my-8 text-[#8b949e] text-xs before:content-[''] before:flex-1 before:border-b before:border-[#30363d] after:content-[''] after:flex-1 after:border-b after:border-[#30363d]">
      <span class="px-4">{props.text || "or"}</span>
    </div>
  );
}
