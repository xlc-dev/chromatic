interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage(props: ErrorMessageProps) {
  return (
    <div class="bg-[#21262d] border border-[#f85149] rounded-lg px-4 py-3 text-[#f85149] text-sm shadow-[0_4px_12px_rgba(248,81,73,0.2)]">
      {props.message}
    </div>
  );
}
