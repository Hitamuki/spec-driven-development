import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を安全に結合するユーティリティ関数
 * clsxで条件付きクラスを処理し、tailwind-mergeで競合するクラスを解決する
 * @param inputs - 結合するクラス名（文字列・配列・オブジェクト形式に対応）
 * @returns 結合・最適化されたクラス名文字列
 * @example
 * cn("px-2 py-1", isActive && "bg-primary", "text-sm")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
