import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { Providers } from "./app/providers";
import { routes } from "./app/routes-config";
import "./styles/globals.css";

const router = createBrowserRouter(routes);

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}
