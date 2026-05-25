import { useState, useEffect, useCallback } from "react";
import { useSettingsStore, KeymapMode } from "../stores/settingsStore";
import "./Settings.css";

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

const KEYMAP_OPTIONS: { label: string; value: KeymapMode }[] = [
  { label: "標準", value: "default" },
  { label: "Vim", value: "vim" },
  { label: "Emacs", value: "emacs" },
];

const AUTOSAVE_OPTIONS = [
  { label: "OFF", value: 0 },
  { label: "300ms", value: 300 },
  { label: "800ms (既定)", value: 800 },
  { label: "2s", value: 2000 },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    fontEditor,
    fontPreview,
    keymap,
    autosaveMs,
    scrollSync,
    tocOpen,
    setFontEditor,
    setFontPreview,
    setKeymap,
    setAutosaveMs,
    setScrollSync,
    setTocOpen,
  } = useSettingsStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="settings-backdrop" data-testid="settings-backdrop" onClick={onClose}>
      <div
        className="settings-modal"
        data-testid="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="設定"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 className="settings-title">設定</h2>
          <button
            className="settings-close"
            data-testid="settings-close-btn"
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="settings-body">
          <FontSetting
            label="エディターフォント"
            description="エディター・シンタックスビューアーで使用するフォント"
            value={fontEditor}
            presets={EDITOR_PRESETS}
            previewText={"const hello = 'world';\nfunction add(a, b) { return a + b; }"}
            monospace
            onChange={setFontEditor}
          />

          <div className="settings-divider" />

          <FontSetting
            label="プレビューフォント"
            description="Markdown プレビュー本文で使用するフォント"
            value={fontPreview}
            presets={PREVIEW_PRESETS}
            previewText={
              "The quick brown fox jumps over the lazy dog.\nいろはにほへと ちりぬるを わかよたれそ"
            }
            monospace={false}
            onChange={setFontPreview}
          />

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-label">キーバインド</span>
              <span className="settings-section-description">エディターのキーバインドモード</span>
            </div>
            <div className="settings-option-row" data-testid="keymap-options">
              {KEYMAP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`preset-btn ${keymap === opt.value ? "active" : ""}`}
                  data-testid={`keymap-${opt.value}-btn`}
                  onClick={() => setKeymap(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-label">自動保存</span>
              <span className="settings-section-description">変更後の自動保存タイミング</span>
            </div>
            <div className="settings-option-row" data-testid="autosave-options">
              {AUTOSAVE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`preset-btn ${autosaveMs === opt.value ? "active" : ""}`}
                  data-testid={`autosave-${opt.value}-btn`}
                  onClick={() => setAutosaveMs(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-label">表示</span>
              <span className="settings-section-description">プレビュー表示の設定</span>
            </div>
            <div className="settings-toggle-row">
              <label className="settings-toggle-label">
                <input
                  type="checkbox"
                  data-testid="scroll-sync-checkbox"
                  checked={scrollSync}
                  onChange={(e) => setScrollSync(e.target.checked)}
                />
                スクロール同期
              </label>
              <label className="settings-toggle-label">
                <input
                  type="checkbox"
                  data-testid="toc-open-checkbox"
                  checked={tocOpen}
                  onChange={(e) => setTocOpen(e.target.checked)}
                />
                目次 (TOC) を表示
              </label>
            </div>
          </section>
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
    [onChange],
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

      <div className="font-preview" style={{ fontFamily: value, ...(monospace ? {} : {}) }}>
        {previewText.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
