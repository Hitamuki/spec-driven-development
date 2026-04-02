import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { ImageList } from '@/features/image-list/ui/ImageList';

vi.mock('@image-upload/ui', async () => {
  const ReactMod = await import('react');
  const c =
    (tag: string) =>
    ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) =>
      ReactMod.createElement(tag, props, children);
  return {
    Card: c('div'),
    CardContent: c('div'),
    CardDescription: c('p'),
    CardHeader: c('div'),
    CardTitle: c('h3'),
  };
});

const mockImages = [
  { id: 'img-1', fileName: 'photo1.jpg', createdAt: '2024-01-15T10:00:00.000Z' },
  { id: 'img-2', fileName: 'photo2.png', createdAt: '2024-01-16T12:00:00.000Z' },
];

describe('ImageList', () => {
  it('ローディング中はスピナーと「読み込み中」を表示する', () => {
    render(
      <ImageList
        images={[]}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={true}
      />,
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(screen.queryByText('まだ画像がアップロードされていません')).not.toBeInTheDocument();
  });

  it('画像がないとき空状態メッセージを表示する', () => {
    render(
      <ImageList
        images={[]}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText('まだ画像がアップロードされていません')).toBeInTheDocument();
  });

  it('画像一覧を表示する', () => {
    render(
      <ImageList
        images={mockImages}
        maxCount={5}
        selectedImageId=""
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
    expect(screen.getByText('photo2.png')).toBeInTheDocument();
  });

  it('画像ボタンをクリックすると onImageClick が呼ばれる', () => {
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

    fireEvent.click(screen.getByText('photo1.jpg').closest('button')!);

    expect(onImageClick).toHaveBeenCalledOnce();
    expect(onImageClick).toHaveBeenCalledWith('img-1', 'photo1.jpg');
  });

  it('選択中の画像には選択スタイルが適用されている', () => {
    render(
      <ImageList
        images={mockImages}
        maxCount={5}
        selectedImageId="img-1"
        onImageClick={vi.fn()}
        isLoading={false}
      />,
    );

    const button = screen.getByText('photo1.jpg').closest('button')!;
    expect(button.className).toContain('ring-1');
  });
});
