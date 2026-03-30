import { Toaster } from "@image-upload/ui";
import { UploadPage } from "@/pages/upload-page";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <UploadPage />
    </>
  );
}
