import { Toaster } from "@image-upload/ui";
import { HomePage } from "../pages/home/ui/HomePage";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <HomePage />
      <Toaster />
    </div>
  );
}