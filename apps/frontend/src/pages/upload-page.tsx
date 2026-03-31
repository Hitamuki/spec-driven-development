import { useState } from "react";
import { useLoaderData } from "react-router";
import { Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@image-upload/ui";
import { Button } from "@image-upload/ui";
import {
  useListImages,
  useGetImage,
  getListImagesQueryKey,
  getGetImageQueryKey,
} from "@image-upload/api";
import { useQueryClient } from "@tanstack/react-query";
import { UploadForm } from "@/features/upload-image/ui/UploadForm";
import { ImageList } from "@/features/image-list/ui/ImageList";
import type { UploadedImage } from "@/entities/image/types";
import { MAX_UPLOAD_COUNT, UI_TEXT } from "@/shared/config/constants";

export function UploadPage() {
  const [selectedImageId, setSelectedImageId] = useState<string>("");
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const queryClient = useQueryClient();

  // Loader からの初期データを取得（SSR的な先読み）
  const loaderData = useLoaderData() as any;
  const initialImages = loaderData?.data ?? [];

  // api003: 画像一覧取得
  const { data: imagesResponse, isLoading: isLoadingImages } = useListImages();
  const images: UploadedImage[] = imagesResponse?.data ?? initialImages;

  // api004: 画像閲覧用URL取得（選択時のみ）
  const { data: imageUrlResponse } = useGetImage(selectedImageId, {
    query: {
      queryKey: getGetImageQueryKey(selectedImageId),
      enabled: !!selectedImageId,
    },
  });
  const galleryPreviewUrl = imageUrlResponse?.data?.url ?? "";

  const handleUploadSuccess = (_newImage: UploadedImage) => {
    // 一覧を再取得して最新状態に同期
    queryClient.invalidateQueries({ queryKey: getListImagesQueryKey() });
  };

  const handleImageClick = (id: string, fileName: string) => {
    setSelectedImageId(id);
    setSelectedImageName(fileName);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {UI_TEXT.UPLOAD_PAGE.TITLE}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            {UI_TEXT.UPLOAD_PAGE.DESCRIPTION}
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-6">
            <UploadForm
              uploadedCount={images.length}
              maxCount={MAX_UPLOAD_COUNT}
              onUploadSuccess={handleUploadSuccess}
            />
          </section>

          <section className="space-y-6">
            <ImageList
              images={images}
              maxCount={MAX_UPLOAD_COUNT}
              selectedImageId={selectedImageId}
              onImageClick={handleImageClick}
              isLoading={isLoadingImages}
            />
          </section>
        </main>

        {galleryPreviewUrl && (
          <aside>
            <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <ImageIcon className="size-5 text-primary" />
                    <span className="truncate">
                      {UI_TEXT.UPLOAD_PAGE.PREVIEW_TITLE}
                      {selectedImageName}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedImageId("");
                      setSelectedImageName("");
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200/30">
                <div className="flex items-center justify-center p-8 bg-dot-slate-200">
                  <img
                    src={galleryPreviewUrl}
                    alt={selectedImageName}
                    className="max-w-full h-auto max-h-[600px] rounded-sm shadow-2xl object-contain bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
