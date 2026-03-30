import { Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@image-upload/ui";
import { UploadedImage } from "@/entities/image/types";
import { UI_TEXT } from "@/shared/config/constants";

interface ImageListProps {
  images: UploadedImage[];
  maxCount: number;
  selectedImageName: string;
  onImageClick: (filename: string) => void;
}

export function ImageList({ images, maxCount, selectedImageName, onImageClick }: ImageListProps) {
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
        {images.length === 0 ? (
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
                  onClick={() => onImageClick(image.filename)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all hover:bg-accent hover:border-primary ${
                    selectedImageName === image.filename ? "bg-accent border-primary ring-1 ring-primary" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{image.filename}</p>
                      <p className="text-xs text-muted-foreground mt-1">{image.uploadedAt}</p>
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
