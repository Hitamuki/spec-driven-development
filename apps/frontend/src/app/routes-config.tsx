import type { RouteObject, LoaderFunctionArgs } from 'react-router';
import { RootLayout } from '@/app/root';
import { UploadPage } from '@/pages/upload-page';
import { queryClient } from '@/app/providers';
import {
  getListImagesQueryKey,
  listImages,
  getGetImageQueryKey,
  getImage,
} from '@image-upload/api';

/**
 * UploadPageのLoader
 * 画像一覧を先読み取得してTanStack Queryのキャッシュに乗せる
 * キャッシュがある場合はAPIリクエストをスキップする
 * @param _args - React RouterのLoaderFunctionArgs（未使用）
 * @returns 画像一覧データ、またはキャッシュ済みデータ
 */
export async function uploadPageLoader(_args: LoaderFunctionArgs) {
  const queryKey = getListImagesQueryKey();

  // 既にキャッシュがあればそれを使用
  const cachedData = queryClient.getQueryData(queryKey);
  if (cachedData) {
    return cachedData;
  }

  // キャッシュがなければ取得
  try {
    const data = await queryClient.fetchQuery({
      queryKey,
      queryFn: () => listImages(),
    });
    return data;
  } catch (error) {
    console.error('Failed to load images:', error);
    // ローダーが失敗してもページは表示する（フォールバック）
    return { data: [] };
  }
}

/**
 * 画像のプレビューLoader
 * 特定の画像の閲覧用URLをTanStack Queryキャッシュ経由で取得する
 * @param params - `id` を含むルートパラメータ
 * @returns 画像の閲覧用URLデータ
 * @throws 画像IDが指定されていない場合（400）または画像が見つからない場合（404）
 */
export async function getImageLoader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    throw new Response('Image ID is required', { status: 400 });
  }

  const queryKey = getGetImageQueryKey(id);

  try {
    const data = await queryClient.fetchQuery({
      queryKey,
      queryFn: () => getImage(id),
    });
    return data;
  } catch (error) {
    console.error('Failed to load image:', error);
    throw new Response('Image not found', { status: 404 });
  }
}

/**
 * Data Router のルート定義
 * createBrowserRouter で使用するルートオブジェクトの配列
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <UploadPage />,
        loader: uploadPageLoader,
      },
    ],
  },
];
