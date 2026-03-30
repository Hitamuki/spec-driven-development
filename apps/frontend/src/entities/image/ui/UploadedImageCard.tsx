import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, Skeleton, cn } from "@image-upload/ui";

export type UploadStatus = "uploading" | "success" | "error";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  uploadedAt?: Date;
}

interface UploadedImageCardProps {
  image: UploadedImage;
}

export function UploadedImageCard({ image }: UploadedImageCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      image.status === "error" && "border-destructive"
    )}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          {image.status === "uploading" ? (
            <Skeleton className="size-full rounded-none" />
          ) : (
            <img
              src={image.preview}
              alt={image.file.name}
              className="size-full object-cover"
            />
          )}

          {/* ステータスバッジ */}
          <div className="absolute right-2 top-2">
            {image.status === "success" && (
              <div className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-white">
                <CheckCircle2 className="size-3" />
                <span className="text-xs font-medium">完了</span>
              </div>
            )}
            {image.status === "error" && (
              <div className="flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-white">
                <XCircle className="size-3" />
                <span className="text-xs font-medium">失敗</span>
              </div>
            )}
          </div>
        </div>

        {/* ファイル情報 */}
        <div className="p-3">
          <p className="mb-1 truncate text-sm font-medium">
            {image.file.name}
          </p>
          <p className="text-muted-foreground text-xs">
            {(image.file.size / 1024).toFixed(1)} KB
            {image.uploadedAt && ` • ${image.uploadedAt.toLocaleTimeString("ja-JP")}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
