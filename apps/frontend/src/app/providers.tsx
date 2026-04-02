import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// axios のグローバル設定を副作用として読み込む
import "@/shared/lib/api";

/**
 * グローバルQueryClientインスタンス
 * Loaderからもアクセスされるため、モジュール外で定義
 * staleTime 30秒で不要なリフェッチを抑制する
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30秒
    },
  },
});

/**
 * ProvidersコンポーネントのProps
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * アプリケーション全体のProviderをまとめるコンポーネント
 * 現在はTanStack QueryのQueryClientProviderを提供する
 * 将来的にProviderが増えた場合もここに追加する
 * @param props - {@link ProvidersProps}
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
