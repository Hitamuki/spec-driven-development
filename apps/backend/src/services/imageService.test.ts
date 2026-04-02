import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRepository = vi.hoisted(() => ({
  count: vi.fn(),
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
}));

const mockSend = vi.hoisted(() => vi.fn());
const mockGetSignedUrl = vi.hoisted(() => vi.fn());

vi.mock('@image-upload/db', () => ({
  prisma: {},
  ImageRepository: vi.fn(function MockImageRepository() {
    return mockRepository;
  }),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function MockS3Client() {
    return { send: mockSend };
  }),
  PutObjectCommand: vi.fn(function MockPutObjectCommand(args) {
    return args;
  }),
  GetObjectCommand: vi.fn(function MockGetObjectCommand(args) {
    return args;
  }),
  HeadObjectCommand: vi.fn(function MockHeadObjectCommand(args) {
    return args;
  }),
  DeleteObjectCommand: vi.fn(function MockDeleteObjectCommand(args) {
    return args;
  }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

import { ImageService } from './imageService';

const createMockS3Body = (bytes: number[]) => ({
  [Symbol.asyncIterator]: async function* () {
    yield new Uint8Array(bytes);
  },
});

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ImageService();
    mockGetSignedUrl.mockResolvedValue('https://s3.amazonaws.com/bucket/key?signed');
  });

  // api001-upload: 署名付きURL発行
  describe('createPresignedUrl', () => {
    it('正常系: 署名付きURLとキーを返す', async () => {
      // Arrange
      mockRepository.count.mockResolvedValue(0);

      // Act

      const result = await service.createPresignedUrl(
        { fileName: 'test.jpg', fileSize: 1024, contentType: 'image/jpeg' },
        'trace-id-001',
      );
      // Assert


      expect(result).toHaveProperty('uploadUrl', 'https://s3.amazonaws.com/bucket/key?signed');
      // Assert

      expect(result).toHaveProperty('key');
      // Assert

      expect(result.key).toContain('test.jpg');
    });

    it('アップロード上限エラー: 枚数が上限（5枚）に達している場合エラーをスローする', async () => {
      // Arrange
      mockRepository.count.mockResolvedValue(5);

      // Act

      await expect(
        service.createPresignedUrl(
          { fileName: 'test.jpg', fileSize: 1024, contentType: 'image/jpeg' },
          'trace-id-001',
        ),
      ).rejects.toThrow('上限');
    });

    it('ファイル名エラー: パストラバーサル文字を含む場合エラーをスローする', async () => {
      // Arrange
      mockRepository.count.mockResolvedValue(0);

      // Act

      await expect(
        service.createPresignedUrl(
          { fileName: '../../../etc/passwd', fileSize: 1024, contentType: 'image/jpeg' },
          'trace-id-001',
        ),
      ).rejects.toThrow('不正');
    });

    it('ファイル名エラー: スラッシュを含む場合エラーをスローする', async () => {
      // Arrange
      mockRepository.count.mockResolvedValue(0);

      // Act

      await expect(
        service.createPresignedUrl(
          { fileName: 'path/to/file.jpg', fileSize: 1024, contentType: 'image/jpeg' },
          'trace-id-001',
        ),
      ).rejects.toThrow('不正');
    });
  });

  // api002-upload: アップロード完了・メタデータ登録
  describe('createImageMetadata', () => {
    it('正常系: メタデータを保存して画像IDとURLを返す', async () => {
      // Arrange
      const jpegMagicBytes = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
      mockSend
        .mockResolvedValueOnce({}) // HeadObjectCommand
        .mockResolvedValueOnce({ Body: createMockS3Body(jpegMagicBytes) }); // GetObjectCommand

      mockRepository.create.mockResolvedValue({
        id: 'image-id-001',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        s3Key: 'images/test.jpg',
        traceId: 'trace-id-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act

      const result = await service.createImageMetadata(
        {
          key: 'images/test.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        },
        'trace-id-001',
      );
      // Assert


      expect(result).toHaveProperty('id', 'image-id-001');
      // Assert

      expect(result).toHaveProperty('url');
      // Assert

      expect(mockRepository.create).toHaveBeenCalledOnce();
    });

    it('S3ファイル未存在エラー: HeadObjectが失敗した場合エラーをスローする', async () => {
      // Arrange
      mockSend.mockRejectedValueOnce(new Error('NoSuchKey'));

      // Act

      await expect(
        service.createImageMetadata(
          {
            key: 'images/nonexistent.jpg',
            fileName: 'nonexistent.jpg',
            fileSize: 1024,
            contentType: 'image/jpeg',
          },
          'trace-id-001',
        ),
      ).rejects.toThrow('S3上にファイルが存在しません');
    });

    it('マジックナンバーエラー: 不正なバイト列の場合エラーをスローしS3から削除する', async () => {
      // Arrange
      const invalidBytes = [0x00, 0x00, 0x00, 0x00];
      mockSend
        .mockResolvedValueOnce({}) // HeadObjectCommand
        .mockResolvedValueOnce({ Body: createMockS3Body(invalidBytes) }) // GetObjectCommand
        .mockResolvedValueOnce({}); // DeleteObjectCommand

      // Act

      await expect(
        service.createImageMetadata(
          {
            key: 'images/fake.jpg',
            fileName: 'fake.jpg',
            fileSize: 1024,
            contentType: 'image/jpeg',
          },
          'trace-id-001',
        ),
      ).rejects.toThrow('ファイル形式が不正です');

      // 不正なファイルがS3から削除されることを確認
      // Assert

      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('正常系: PNGマジックバイトで検証が通る', async () => {
      // Arrange
      const pngMagicBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      mockSend
        .mockResolvedValueOnce({}) // HeadObjectCommand
        .mockResolvedValueOnce({ Body: createMockS3Body(pngMagicBytes) }); // GetObjectCommand

      mockRepository.create.mockResolvedValue({
        id: 'image-id-002',
        fileName: 'test.png',
        fileSize: 2048,
        contentType: 'image/png',
        s3Key: 'images/test.png',
        traceId: 'trace-id-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act

      const result = await service.createImageMetadata(
        {
          key: 'images/test.png',
          fileName: 'test.png',
          fileSize: 2048,
          contentType: 'image/png',
        },
        'trace-id-001',
      );
      // Assert


      expect(result).toHaveProperty('id', 'image-id-002');
    });
  });

  // api003-upload: 画像一覧取得
  describe('getImageList', () => {
    it('正常系: 画像一覧をISO文字列のcreatedAt付きで返す', async () => {
      // Arrange
      const now = new Date('2024-01-15T10:00:00.000Z');
      mockRepository.findAll.mockResolvedValue([
        {
          id: 'image-1',
          fileName: 'test1.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
          s3Key: 'key1',
          traceId: 'trace1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'image-2',
          fileName: 'test2.png',
          fileSize: 2048,
          contentType: 'image/png',
          s3Key: 'key2',
          traceId: 'trace2',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Act

      const result = await service.getImageList('trace-id-001');
      // Assert


      expect(result).toHaveLength(2);
      // Assert

      expect(result[0]).toEqual({
        id: 'image-1',
        fileName: 'test1.jpg',
        createdAt: now.toISOString(),
      });
      // Assert

      expect(result[1]).toEqual({
        id: 'image-2',
        fileName: 'test2.png',
        createdAt: now.toISOString(),
      });
    });

    it('正常系: 画像がない場合空配列を返す', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act

      const result = await service.getImageList('trace-id-001');
      // Assert


      expect(result).toHaveLength(0);
    });
  });

  // api004-upload: 画像閲覧用URL取得
  describe('getImageUrl', () => {
    it('正常系: 閲覧用URLと有効期限を返す', async () => {
      // Arrange
      const now = new Date();
      mockRepository.findById.mockResolvedValue({
        id: 'image-id-001',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
        s3Key: 'images/test.jpg',
        traceId: 'trace1',
        createdAt: now,
        updatedAt: now,
      });

      // Act

      const result = await service.getImageUrl('image-id-001', 'trace-id-001');
      // Assert


      expect(result).toHaveProperty('url', 'https://s3.amazonaws.com/bucket/key?signed');
      // Assert

      expect(result).toHaveProperty('expiresAt');
      // Assert

      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('404エラー: 画像が存在しない場合エラーをスローする', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act

      await expect(
        service.getImageUrl('non-existent-id', 'trace-id-001'),
      ).rejects.toThrow('画像が存在しません');
    });
  });
});
