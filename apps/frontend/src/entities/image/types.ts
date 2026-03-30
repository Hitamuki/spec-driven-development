export interface UploadedImage {
  id: number;
  filename: string;
  uploadedAt: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface StatusMessage {
  type: "success" | "error" | "warning";
  text: string;
}
