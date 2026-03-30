import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@image-upload/ui";
import { UploadDropzone, MAX_FILE_SIZE, ALLOWED_TYPES } from "./UploadDropzone";
import { UploadedImageCard, type UploadedImage, type UploadStatus } from "../../../entities/image/ui/UploadedImageCard";

// API呼び出しのモック関数 (後のステップで Orval/TanStack Query に移行)
async function mockUploadImage(file: File): Promise<{ success: boolean; url?: string }> {
  // 実際のアップロードフローをシミュレート
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 20%の確率で失敗をシミュレート
  const success = Math.random() > 0.2;

  if (success) {
    return {
      success: true,
      url: `https://example.com/uploads/${Date.now()}-${file.name}`,
    };
  } else {
    throw new Error("アップロードに失敗しました");
  }
}

type AppState = "idle" | "validating" | "uploading" | "success" | "error";

export function ImageUpload() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "対応していないファイル形式です" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "ファイルサイズは5MB以下にしてください" };
    }
    return { valid: true };
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    // 制限チェック (最大5枚)
    if (uploadedImages.length >= 5) {
      toast.error("制限エラー", {
        description: "アップロードできる画像は最大5枚までです",
      });
      return;
    }

    // バリデーション
    setAppState("validating");
    const validation = validateFile(file);

    if (!validation.valid) {
      setAppState("error");
      toast.error("バリデーションエラー", {
        description: validation.error,
      });
      setTimeout(() => setAppState("idle"), 1000);
      return;
    }

    // プレビュー画像の作成
    const preview = URL.createObjectURL(file);
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // アップロード中の画像を追加
    const newImage: UploadedImage = {
      id: imageId,
      file,
      preview,
      status: "uploading",
    };

    setUploadedImages(prev => [newImage, ...prev]);
    setAppState("uploading");

    try {
      // モックAPIコール
      const result = await mockUploadImage(file);

      if (result.success) {
        // 成功
        setUploadedImages(prev =>
          prev.map(img =>
            img.id === imageId
              ? { ...img, status: "success" as UploadStatus, uploadedAt: new Date() }
              : img
          )
        );
        setAppState("success");
        toast.success("アップロード成功", {
          description: `${file.name} をアップロードしました`,
        });
        setTimeout(() => setAppState("idle"), 1000);
      }
    } catch (error) {
      // エラー
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === imageId
            ? { ...img, status: "error" as UploadStatus }
            : img
        )
      );
      setAppState("error");
      toast.error("アップロード失敗", {
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
      });
      setTimeout(() => setAppState("idle"), 1000);
    }
  }, [validateFile, uploadedImages.length]);

  const isUploading = appState === "uploading" || appState === "validating";

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">画像アップロード</h1>
        <p className="text-muted-foreground">
          画像ファイルをアップロードして管理します
        </p>
      </div>

      {/* アップロードエリア */}
      <Card>
        <CardHeader>
          <CardTitle>新規アップロード</CardTitle>
          <CardDescription>
            JPEG, PNG, GIF, WebP 形式のファイルを選択してください（最大5MB）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadDropzone
            onFileSelect={handleFileSelect}
            disabled={isUploading}
          />
        </CardContent>
      </Card>

      {/* アップロード済み画像一覧 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            アップロード履歴 ({uploadedImages.length}/5)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedImages.map(image => (
              <UploadedImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      )}

      {/* 空状態 */}
      {uploadedImages.length === 0 && appState === "idle" && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              まだ画像がアップロードされていません
              <br />
              上のエリアからファイルをアップロードしてください
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
