import { Outlet } from "react-router";
import { Toaster } from "@image-upload/ui";

/**
 * ルートレイアウト
 * すべてのページの共通レイアウトを定義
 */
export function RootLayout() {
  return (
    <>
      <Toaster position="top-right" />
      <Outlet />
    </>
  );
}
