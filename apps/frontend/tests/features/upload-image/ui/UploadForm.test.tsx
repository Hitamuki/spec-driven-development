import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { UploadForm } from '@/features/upload-image/ui/UploadForm';
import { MESSAGES } from '@/shared/config/constants';

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
    Button: ({
      children,
      onClick,
      disabled,
      type,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: string;
    }) =>
      ReactMod.createElement(
        'button',
        { onClick, disabled, type: type ?? 'button' },
        children,
      ),
    Alert: ({
      children,
      variant,
    }: {
      children?: React.ReactNode;
      variant?: string;
    }) => ReactMod.createElement('div', { role: 'alert', 'data-variant': variant }, children),
    AlertDescription: c('p'),
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockPresignedUrlMutateAsync = vi.fn();
const mockCompleteUploadMutateAsync = vi.fn();

vi.mock('@image-upload/api', () => ({
  useGetPresignedUrl: () => ({ mutateAsync: mockPresignedUrlMutateAsync }),
  useCompleteUpload: () => ({ mutateAsync: mockCompleteUploadMutateAsync }),
}));

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...(actual.default as object),
      put: vi.fn().mockResolvedValue({}),
      isAxiosError: vi.fn().mockReturnValue(false),
    },
    isAxiosError: vi.fn().mockReturnValue(false),
  };
});

const defaultProps = {
  uploadedCount: 0,
  maxCount: 5,
  onUploadSuccess: vi.fn(),
};

const selectFile = (
  file: File,
  container: HTMLElement = document.body,
): void => {
  const input = container.querySelector<HTMLInputElement>('#file-input');
  expect(input, 'ファイル入力要素が見つかりません').not.toBeNull();
  fireEvent.change(input!, { target: { files: [file] } });
};

describe('UploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態: アップロードボタンが無効化されている', () => {
    render(<UploadForm {...defaultProps} />);
    const button = screen.getByRole('button', { name: /アップロード/ });
    expect(button).toBeDisabled();
  });

  it('初期状態: エラーメッセージが表示されていない', () => {
    render(<UploadForm {...defaultProps} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('MSG-UI-001: 対応していない拡張子(.txt)のファイルを選択するとエラーを表示する', () => {
    const { container } = render(<UploadForm {...defaultProps} />);
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    selectFile(file, container);
    expect(screen.getByText(MESSAGES['MSG-UI-001'])).toBeInTheDocument();
  });

  it('MSG-UI-001: 対応していないMIMEタイプのファイルを選択するとエラーを表示する', () => {
    const { container } = render(<UploadForm {...defaultProps} />);
    // 拡張子は.jpgだが MIME タイプが不正
    const file = new File(['content'], 'document.jpg', { type: 'application/octet-stream' });
    selectFile(file, container);
    expect(screen.getByText(MESSAGES['MSG-UI-001'])).toBeInTheDocument();
  });

  it('MSG-UI-002: 5MBを超えるファイルを選択するとサイズエラーを表示する', () => {
    const { container } = render(<UploadForm {...defaultProps} />);
    const oversizedContent = new Array(6 * 1024 * 1024).fill('a').join('');
    const file = new File([oversizedContent], 'large.jpg', { type: 'image/jpeg' });
    selectFile(file, container);
    expect(screen.getByText(MESSAGES['MSG-UI-002'])).toBeInTheDocument();
  });

  it('有効なファイルを選択するとプレビューと選択ファイル名が表示される', () => {
    const { container } = render(<UploadForm {...defaultProps} />);
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(file, container);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/photo\.jpg/)).toBeInTheDocument();
  });

  it('有効なファイル選択後はアップロードボタンが有効化される', () => {
    const { container } = render(<UploadForm {...defaultProps} />);
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(file, container);
    const button = screen.getByRole('button', { name: /アップロード/ });
    expect(button).toBeEnabled();
  });

  it('MSG-UI-006: 最大アップロード数に達した場合、ファイル入力とボタンが無効化される', () => {
    const { container } = render(<UploadForm {...defaultProps} uploadedCount={5} />);
    const input = container.querySelector<HTMLInputElement>('#file-input')!;
    expect(input).toBeDisabled();
    // アップロードボタンは既に無効（ファイル未選択）
    const button = screen.getByRole('button', { name: /アップロード/ });
    expect(button).toBeDisabled();
  });

  it('MSG-UI-006: 最大枚数到達時に警告メッセージが表示される', () => {
    render(<UploadForm {...defaultProps} uploadedCount={5} />);
    expect(screen.getByText(MESSAGES['MSG-UI-006'])).toBeInTheDocument();
  });

  it('正常系: アップロード成功後にsuccessメッセージが表示される', async () => {
    const onUploadSuccess = vi.fn();
    const { container } = render(
      <UploadForm {...defaultProps} onUploadSuccess={onUploadSuccess} />,
    );

    mockPresignedUrlMutateAsync.mockResolvedValue({
      data: { uploadUrl: 'https://s3.amazonaws.com/bucket/key', key: 'images/photo.jpg' },
    });
    mockCompleteUploadMutateAsync.mockResolvedValue({
      data: { id: 'new-image-id' },
    });

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(file, container);

    const button = screen.getByRole('button', { name: /アップロード/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(MESSAGES['MSG-UI-C001'])).toBeInTheDocument();
    });

    expect(onUploadSuccess).toHaveBeenCalledOnce();
  });

  it('エラー系: アップロード上限(409)エラー時にMSG-UI-006が表示される', async () => {
    const axiosMod = await import('axios');
    const axiosDefault = axiosMod.default as { isAxiosError: ReturnType<typeof vi.fn> };
    axiosDefault.isAxiosError.mockReturnValue(true);
    mockPresignedUrlMutateAsync.mockRejectedValue(
      Object.assign(new Error('Conflict'), {
        response: { status: 409 },
        isAxiosError: true,
      }),
    );

    const { container } = render(<UploadForm {...defaultProps} />);
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(file, container);

    fireEvent.click(screen.getByRole('button', { name: /アップロード/ }));

    await waitFor(() => {
      expect(screen.getByText(MESSAGES['MSG-UI-006'])).toBeInTheDocument();
    });
  });
});
