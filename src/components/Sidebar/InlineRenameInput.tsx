import { useEffect, useRef } from "react";

interface InlineRenameInputProps {
  defaultValue: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export default function InlineRenameInput({
  defaultValue,
  onConfirm,
  onCancel,
}: InlineRenameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const dotIdx = defaultValue.lastIndexOf(".");
    if (dotIdx > 0) {
      el.setSelectionRange(0, dotIdx);
    } else {
      el.select();
    }
  }, [defaultValue]);

  return (
    <input
      ref={inputRef}
      className="inline-rename-input"
      defaultValue={defaultValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const v = inputRef.current?.value.trim();
          if (v) onConfirm(v);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        e.stopPropagation();
      }}
      onBlur={() => {
        const v = inputRef.current?.value.trim();
        if (v && v !== defaultValue) {
          onConfirm(v);
        } else {
          onCancel();
        }
      }}
    />
  );
}
