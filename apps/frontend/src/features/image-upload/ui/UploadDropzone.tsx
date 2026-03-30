import { useCallback, useState } from "react";
import { Upload, Image } from "lucide-react";
import { cn, Button } from "@image-upload/ui";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function UploadDropzone({ onFileSelect, disabled }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onFileSelect(file);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors",
        isDragOver && "border-primary bg-primary/5",
        !isDragOver && "border-border hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Image className="size-8 text-primary" />
      </div>

      <div className="text-center">
        <p className="mb-1">
          ファイルをドラッグ&ドロップ
        </p>
        <p className="text-muted-foreground text-sm">
          または
        </p>
      </div>

      <label className="cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInput}
          disabled={disabled}
        />
        <Button variant="default" asChild disabled={disabled}>
           <div className="flex items-center gap-2">
            <Upload className="size-4" />
            <span className="text-sm font-medium">ファイルを選択</span>
          </div>
        </Button>
      </label>

      <p className="text-muted-foreground text-xs">
        JPEG, PNG, GIF, WebP • 最大5MB
      </p>
    </div>
  );
}

export { MAX_FILE_SIZE, ALLOWED_TYPES };
