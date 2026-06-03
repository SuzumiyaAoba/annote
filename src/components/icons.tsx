/**
 * アプリ全体で使う SVG アイコン集。
 *
 * インライン SVG の定型コード（viewBox / stroke 設定など）を 2 つの基底
 * コンポーネントに集約している。
 * - {@link Outline}: 線画アイコン（fill なし・stroke currentColor）
 * - {@link Solid}: 塗りアイコン（fill currentColor）
 *
 * 各アイコンは元の見た目に合わせた既定サイズ・線幅を持ち、props で上書きできる。
 */
import type { ReactNode } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

function Outline({
  size = 16,
  strokeWidth = 2,
  className,
  children,
}: IconProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function Solid({
  size = 16,
  opacity,
  className,
  children,
}: IconProps & { opacity?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      opacity={opacity}
      className={className}
    >
      {children}
    </svg>
  );
}

/* ── 汎用 / ツールバー ────────────────────────────── */

export function FolderIcon({ size = 16 }: IconProps) {
  return (
    <Solid size={size}>
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </Solid>
  );
}

export function NoteIcon({ size = 48 }: IconProps) {
  return (
    <Solid size={size} opacity={0.3}>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
    </Solid>
  );
}

export function SunIcon({ size = 15 }: IconProps) {
  return (
    <Outline size={size}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Outline>
  );
}

export function MoonIcon({ size = 15 }: IconProps) {
  return (
    <Outline size={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Outline>
  );
}

export function GearIcon({ size = 15 }: IconProps) {
  return (
    <Outline size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Outline>
  );
}

export function CloseIcon({ size = 16, strokeWidth = 2 }: IconProps & { strokeWidth?: number }) {
  return (
    <Outline size={size} strokeWidth={strokeWidth}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Outline>
  );
}

/* ── サイドバー（ファイル操作） ──────────────────── */

export function FolderOpenIcon({ size = 14 }: IconProps) {
  return (
    <Solid size={size}>
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
    </Solid>
  );
}

export function NewFileIcon({ size = 13 }: IconProps) {
  return (
    <Outline size={size}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </Outline>
  );
}

export function NewFolderIcon({ size = 13 }: IconProps) {
  return (
    <Outline size={size}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </Outline>
  );
}

export function RenameIcon({ size = 13 }: IconProps) {
  return (
    <Outline size={size}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Outline>
  );
}

export function DeleteIcon({ size = 13 }: IconProps) {
  return (
    <Outline size={size}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Outline>
  );
}

/* ── Markdown ツールバー ────────────────────────── */

export function BoldIcon() {
  return (
    <Outline size={14} strokeWidth={2.5}>
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </Outline>
  );
}

export function ItalicIcon() {
  return (
    <Outline size={14}>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </Outline>
  );
}

export function StrikethroughIcon() {
  return (
    <Outline size={14}>
      <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6.8 3.3h.4M8.6 19c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-6.8-3.3H13" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </Outline>
  );
}

export function UlIcon() {
  return (
    <Outline size={14}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </Outline>
  );
}

export function OlIcon() {
  return (
    <Outline size={14}>
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </Outline>
  );
}

export function TaskIcon() {
  return (
    <Outline size={14}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </Outline>
  );
}

export function QuoteIcon() {
  return (
    <Outline size={14}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </Outline>
  );
}

export function CodeIcon() {
  return (
    <Outline size={14}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Outline>
  );
}

export function CodeBlockIcon() {
  return (
    <Outline size={14}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </Outline>
  );
}

export function LinkIcon() {
  return (
    <Outline size={14}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Outline>
  );
}

export function ImageIcon() {
  return (
    <Outline size={14}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </Outline>
  );
}

export function TableIcon() {
  return (
    <Outline size={14}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </Outline>
  );
}

export function HrIcon() {
  return (
    <Outline size={14}>
      <line x1="3" y1="12" x2="21" y2="12" />
    </Outline>
  );
}

/* ── エクスポートメニュー ────────────────────────── */

export function ExportIcon({ size = 15 }: IconProps) {
  return (
    <Outline size={size}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Outline>
  );
}

export function HtmlIcon({ size = 14 }: IconProps) {
  return (
    <Outline size={size}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Outline>
  );
}

export function PrintIcon({ size = 14 }: IconProps) {
  return (
    <Outline size={size}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </Outline>
  );
}
