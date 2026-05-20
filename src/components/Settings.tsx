import { useState, useEffect, useCallback } from "react";
import "./Settings.css";

export interface AppSettings {
  fontEditor: string;
  fontPreview: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontEditor:
    '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
  fontPreview:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
};

const EDITOR_PRESETS = [
  { label: "JetBrains Mono", value: '"JetBrains Mono", monospace' },
  { label: "Fira Code", value: '"Fira Code", monospace' },
  { label: "Cascadia Code", value: '"Cascadia Code", monospace' },
  { label: "Source Code Pro", value: '"Source Code Pro", monospace' },
  { label: "Menlo", value: "Menlo, monospace" },
  { label: "Consolas", value: "Consolas, monospace" },
];

const PREVIEW_PRESETS = [
  {
    label: "GitHub (既定)",
    value:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  {
    label: "游明朝",
    value: '"Yu Mincho", "游明朝", YuMincho, "Hiragino Mincho ProN", serif',
  },
  {
    label: "游ゴシック",
    value: '"Yu Gothic", "游ゴシック", YuGothic, "Hiragino Sans", sans-serif',
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onChange,
}: SettingsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="設定"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 className="settings-title">設定</h2>
          <button className="settings-close" onClick={onClose} aria-label="閉じる">
            <CloseIcon />
          </button>
        </div>

        <div className="settings-body">
          <FontSetting
            label="エディターフォント"
            description="エディター・シンタックスビューアーで使用するフォント"
            value={settings.fontEditor}
            presets={EDITOR_PRESETS}
            previewText={"const hello = 'world';\nfunction add(a, b) { return a + b; }"}
            monospace
            onChange={(fontEditor) => onChange({ ...settings, fontEditor })}
          />

          <div className="settings-divider" />

          <FontSetting
            label="プレビューフォント"
            description="Markdown プレビュー本文で使用するフォント"
            value={settings.fontPreview}
            presets={PREVIEW_PRESETS}
            previewText={"The quick brown fox jumps over the lazy dog.\nいろはにほへと ちりぬるを わかよたれそ"}
            monospace={false}
            onChange={(fontPreview) => onChange({ ...settings, fontPreview })}
          />
        </div>
      </div>
    </div>
  );
}

interface FontSettingProps {
  label: string;
  description: string;
  value: string;
  presets: { label: string; value: string }[];
  previewText: string;
  monospace: boolean;
  onChange: (value: string) => void;
}

function FontSetting({
  label,
  description,
  value,
  presets,
  previewText,
  monospace,
  onChange,
}: FontSettingProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commit = useCallback(
    (v: string) => {
      const trimmed = v.trim();
      if (trimmed) onChange(trimmed);
    },
    [onChange]
  );

  return (
    <section className="font-setting">
      <div className="font-setting-header">
        <span className="font-setting-label">{label}</span>
        <span className="font-setting-description">{description}</span>
      </div>

      <div className="font-presets">
        {presets.map((p) => (
          <button
            key={p.value}
            className={`preset-btn ${value === p.value ? "active" : ""}`}
            onClick={() => {
              setInputValue(p.value);
              onChange(p.value);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="font-input-row">
        <label className="font-input-label">カスタム</label>
        <input
          className="font-input"
          type="text"
          value={inputValue}
          placeholder="font-family の値を入力…"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => commit(inputValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(inputValue);
          }}
          spellCheck={false}
        />
      </div>

      <div
        className="font-preview"
        style={{ fontFamily: value, ...(monospace ? {} : {}) }}
      >
        {previewText.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
