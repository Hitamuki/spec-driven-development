import { Image as ImageIcon, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@image-upload/ui";
import type { UploadedImage } from "@/entities/image/types";
import { UI_TEXT } from "@/shared/config/constants";

interface ImageListProps {
  images: UploadedImage[];
  maxCount: number;
  selectedImageId: string;
  onImageClick: (id: string, fileName: string) => void;
  isLoading?: boolean;
}

export function ImageList({ images, maxCount, selectedImageId, onImageClick, isLoading }: ImageListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-5" />
          {UI_TEXT.IMAGE_LIST.TITLE(images.length, maxCount)}
        </CardTitle>
        <CardDescription>{UI_TEXT.IMAGE_LIST.DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="size-8 mx-auto mb-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p>読み込み中...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="size-12 mx-auto mb-3 opacity-20" />
            <p>{UI_TEXT.IMAGE_LIST.EMPTY_STATE}</p>
          </div>
        ) : (
          <ul className="grid gap-2">
            {images.map((image) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => onImageClick(image.id ?? "", image.fileName ?? "")}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all hover:bg-accent hover:border-primary ${
                    selectedImageId === image.id ? "bg-accent border-primary ring-1 ring-primary" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{image.fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="size-3" />
                        {image.createdAt ? new Date(image.createdAt).toLocaleString("ja-JP") : ""}
                      </p>
                    </div>
                    <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
