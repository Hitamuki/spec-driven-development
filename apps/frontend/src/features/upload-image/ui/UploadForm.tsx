import { useState, useRef, ChangeEvent } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@image-upload/ui";
import { Button } from "@image-upload/ui";
import { Alert, AlertDescription } from "@image-upload/ui";
import { useGetPresignedUrl, useCompleteUpload } from "@image-upload/api";
import {
  MESSAGES,
  UI_TEXT,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
} from "@/shared/config/constants";
import type { UploadedImage, StatusMessage } from "@/entities/image/types";

/**
 * UploadFormコンポーネントのProps
 */
interface UploadFormProps {
  /** 現在のアップロード済み枚数 */
  uploadedCount: number;
  /** アップロード可能な最大枚数 */
  maxCount: number;
  /** アップロード成功時のコールバック */
  onUploadSuccess: (image: UploadedImage) => void;
}

/**
 * 画像アップロードフォームコンポーネント
 * ファイル選択・プレビュー・S3へのアップロードを一元管理する
 * Presigned URLを使ってクライアントからS3に直接アップロードする3ステップを実行する
 * @param props - {@link UploadFormProps}
 */
export function UploadForm({
  uploadedCount,
  maxCount,
  onUploadSuccess,
}: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presignedUrlMutation = useGetPresignedUrl();
  const completeUploadMutation = useCompleteUpload();
  const skipS3Upload = import.meta.env.VITE_SKIP_S3_UPLOAD === "true";

  const isMaxUploaded = uploadedCount >= maxCount;

  /**
   * ファイル選択時のバリデーションハンドラ
   * 拡張子・MIMEタイプ・ファイルサイズを検証してプレビューを生成する
   * @param e - ファイル入力のChangeイベント
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);

    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    if (!hasValidExtension) {
      setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-001"] });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-001"] });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-002"] });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  /**
   * アップロード実行ハンドラ（3ステップ）
   * 1. Presigned URL取得 → 2. S3へ直接PUT → 3. バックエンドに完了通知
   * @remarks 副作用: S3へのファイルアップロード・DBへのメタデータ登録
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      // Step 1: 署名付きURL取得
      const presignedResult = await presignedUrlMutation.mutateAsync({
        data: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          contentType: selectedFile.type,
        },
      });

      const { uploadUrl, key } = presignedResult.data;

      if (!uploadUrl || !key) {
        setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-007"] });
        return;
      }

      // Step 2: S3に直接アップロード（ローカルデバッグ時はスキップ可能）
      if (!skipS3Upload) {
        await axios.put(uploadUrl, selectedFile, {
          headers: {
            "Content-Type": selectedFile.type,
          },
          // baseURL を使わず絶対URLでリクエスト
          baseURL: "",
        });
      }

      // Step 3: バックエンドにアップロード完了を通知
      const completeResult = await completeUploadMutation.mutateAsync({
        data: {
          key,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          contentType: selectedFile.type,
        },
      });

      const newImage: UploadedImage = {
        id: completeResult.data.id,
        fileName: selectedFile.name,
        createdAt: new Date().toISOString(),
      };

      onUploadSuccess(newImage);
      toast.success(UI_TEXT.UPLOAD_FORM.SUCCESS_TOAST);

      clearPreview();
    } catch (error) {
      console.error(UI_TEXT.UPLOAD_FORM.ERROR_LOG_PREFIX, error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 409) {
          setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-006"] });
        } else if (status === 429) {
          setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-003"] });
        } else if (status && status >= 500) {
          setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-C005"] });
        } else {
          setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-C004"] });
        }
      } else {
        setStatusMessage({ type: "error", text: MESSAGES["MSG-UI-C004"] });
      }
      toast.error(UI_TEXT.UPLOAD_FORM.FAILURE_TOAST);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 選択ファイルとプレビューをリセットする
   * @remarks 副作用: fileInputのvalueをクリアする
   */
  const clearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          {UI_TEXT.UPLOAD_FORM.TITLE}
        </CardTitle>
        <CardDescription>
          {UI_TEXT.UPLOAD_FORM.DESCRIPTION(maxCount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusMessage && (
          <Alert
            variant={statusMessage.type === "error" ? "destructive" : "default"}
          >
            {statusMessage.type === "success" && (
              <CheckCircle2 className="text-green-600 size-4" />
            )}
            {statusMessage.type === "error" && (
              <AlertCircle className="size-4" />
            )}
            {statusMessage.type === "warning" && (
              <AlertCircle className="text-amber-600 size-4" />
            )}
            <AlertDescription>{statusMessage.text}</AlertDescription>
          </Alert>
        )}

        {isMaxUploaded && !statusMessage && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{MESSAGES["MSG-UI-006"]}</AlertDescription>
          </Alert>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleFileSelect}
            disabled={isMaxUploaded || isUploading}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              type="button"
              variant="outline"
              disabled={isMaxUploaded || isUploading}
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="mr-2 size-4" />
              {UI_TEXT.UPLOAD_FORM.SELECT_BUTTON}
            </Button>
          </label>
        </div>

        {previewUrl && selectedFile && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm truncate">
                {UI_TEXT.UPLOAD_FORM.SELECTED_LABEL}
                {selectedFile.name}
              </span>
              <Button variant="ghost" size="icon" onClick={clearPreview}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-muted h-64 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="選択画像プレビュー"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 size-4 animate-spin" />
              {UI_TEXT.UPLOAD_FORM.UPLOADING_BUTTON}
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              {UI_TEXT.UPLOAD_FORM.UPLOAD_BUTTON}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
