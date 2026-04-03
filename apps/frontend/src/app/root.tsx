import { Outlet } from "react-router";
import { Toaster } from "@image-upload/ui";

/**
 * ルートレイアウトコンポーネント
 * すべてのページに共通する外枠を定義する
 * Toasterを配置してアプリ全体でトースト通知を使えるようにする
 */
export function RootLayout() {
  return (
    <>
      <Toaster position="top-right" />
      <Outlet />
    </>
  );
}
