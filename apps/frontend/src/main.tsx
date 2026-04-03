import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Providers } from "./app/providers";
import { routes } from "./app/routes-config";
import "./styles/globals.css";

/** Data RouterインスタンスをルートConfig定義から生成する */
const router = createBrowserRouter(routes);

/**
 * ReactアプリをDOMにマウントするエントリポイント
 * `#root` 要素が存在する場合のみレンダリングを実行する
 */
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}
