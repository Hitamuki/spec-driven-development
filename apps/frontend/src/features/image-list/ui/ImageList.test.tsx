import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { ImageList } from "@/features/image-list/ui/ImageList";

vi.mock("@image-upload/ui", async () => {
  const ReactMod = await import("react");
  const c =
    (tag: string) =>
    ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) =>
      ReactMod.createElement(tag, props, children);
  return {
    Card: c("div"),
    CardContent: c("div"),
    CardDescription: c("p"),
    CardHeader: c("div"),
    CardTitle: c("h3"),
  };
});

const mockImages = [
  {
    id: "img-1",
    fileName: "photo1.jpg",
    createdAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "img-2",
    fileName: "photo2.png",
    createdAt: "2024-01-16T12:00:00.000Z",
  },
];

describe("ImageList", () => {
  it("ローディング中はスピナーと「読み込み中」を表示する", () => {
    // Arrange
    render(
      <ImageList
        images={[]}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={true}
      />,
    );

    // Act
    const loadingText = screen.getByText("読み込み中...");
    const emptyMessage =
      screen.queryByText("まだ画像がアップロードされていません");

    // Assert
    expect(loadingText).toBeInTheDocument();
    expect(emptyMessage).not.toBeInTheDocument();
  });

  it("画像がないとき空状態メッセージを表示する", () => {
    // Arrange
    render(
      <ImageList
        images={[]}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    // Act
    const emptyMessage =
      screen.getByText("まだ画像がアップロードされていません");

    // Assert
    expect(emptyMessage).toBeInTheDocument();
  });

  it("画像一覧を表示する", () => {
    // Arrange
    render(
      <ImageList
        images={mockImages}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    // Act
    const image1 = screen.getByText("photo1.jpg");
    const image2 = screen.getByText("photo2.png");

    // Assert
    expect(image1).toBeInTheDocument();
    expect(image2).toBeInTheDocument();
  });

  it("画像ボタンをクリックすると onImageClick が呼ばれる", () => {
    // Arrange
    const onImageClick = vi.fn();
    render(
      <ImageList
        images={mockImages}
        maxCount={5}
        selectedImageId=""
        onImageClick={onImageClick}
        isLoading={false}
      />,
    );

    // Act
    fireEvent.click(screen.getByText("photo1.jpg").closest("button")!);

    // Assert
    expect(onImageClick).toHaveBeenCalledOnce();
    expect(onImageClick).toHaveBeenCalledWith("img-1", "photo1.jpg");
  });

  it("選択中の画像には選択スタイルが適用されている", () => {
    // Arrange
    render(
      <ImageList
        images={mockImages}
        maxCount={5}
        selectedImageId="img-1"
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    // Act
    const button = screen.getByText("photo1.jpg").closest("button")!;

    // Assert
    expect(button.className).toContain("ring-1");
  });
});
