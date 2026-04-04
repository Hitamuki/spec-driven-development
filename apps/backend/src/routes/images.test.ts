import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { idempotencyStore } from '../services/idempotencyStore';

const mocks = vi.hoisted(() => ({
  createPresignedUrl: vi.fn(),
  createImageMetadata: vi.fn(),
  getImageList: vi.fn(),
  getImageUrl: vi.fn(),
}));

vi.mock('../services/imageService', () => ({
  ImageService: vi.fn(function MockImageService() {
    return mocks;
  }),
}));

import { imagesRoutes } from './images';

describe('imagesRoutes', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    idempotencyStore.clear();
    app = new Hono();
    app.route('/api/v1/images', imagesRoutes);
  });

  // api001-upload: 署名付きURL発行
  describe('POST /api/v1/images/presigned-url', () => {
    it('正常系: 署名付きURLとキーを返す', async () => {
      // Arrange
      mocks.createPresignedUrl.mockResolvedValue({
        uploadUrl: 'https://s3.amazonaws.com/test-bucket/images/test.jpg',
        key: 'images/2024-01-01T00-00-00-000Z/trace-id/test.jpg',
      });

      // Act

      const res = await app.request('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(200);
      const body = await res.json();
      // Assert

      expect(body).toHaveProperty('uploadUrl');
      // Assert

      expect(body).toHaveProperty('key');
    });

    it('バリデーションエラー: 不正なcontentTypeのとき400を返す', async () => {
      // Arrange
      // Act
      const res = await app.request('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.txt',
          fileSize: 1024,
          contentType: 'text/plain',
        }),
      });
      // Assert


      expect(res.status).toBe(400);
    });

    it('バリデーションエラー: 必須フィールド不足のとき400を返す', async () => {
      // Arrange
      // Act
      const res = await app.request('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
        }),
      });
      // Assert


      expect(res.status).toBe(400);
    });

    it('アップロード上限エラー: 上限に達したとき409を返す', async () => {
      // Arrange
      mocks.createPresignedUrl.mockRejectedValue(
        new Error('アップロード可能な枚数の上限（5枚）に達しています'),
      );

      // Act

      const res = await app.request('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(409);
    });

    it('サービスエラー: その他エラーのとき400を返す', async () => {
      // Arrange
      mocks.createPresignedUrl.mockRejectedValue(new Error('ファイル名が不正です'));

      // Act

      const res = await app.request('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(400);
    });
  });

  // api002-upload: アップロード完了・メタデータ登録
  describe('POST /api/v1/images', () => {
    it('正常系: 画像メタデータを登録して201を返す', async () => {
      // Arrange
      mocks.createImageMetadata.mockResolvedValue({
        id: 'test-image-id',
        url: 'https://s3.amazonaws.com/test-bucket/images/test.jpg?signed',
      });

      // Act

      const res = await app.request('/api/v1/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'images/test.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(201);
      const body = await res.json();
      // Assert

      expect(body).toHaveProperty('id', 'test-image-id');
      // Assert

      expect(body).toHaveProperty('url');
    });

    it('バリデーションエラー: 必須フィールドが不足のとき400を返す', async () => {
      // Arrange
      // Act
      const res = await app.request('/api/v1/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
        }),
      });
      // Assert


      expect(res.status).toBe(400);
    });

    it('404: S3にファイルが存在しないとき404を返す', async () => {
      // Arrange
      mocks.createImageMetadata.mockRejectedValue(
        new Error('S3上にファイルが存在しません'),
      );

      // Act

      const res = await app.request('/api/v1/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'images/test.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(404);
    });

    it('422: ファイル形式が不正なとき422を返す', async () => {
      // Arrange
      mocks.createImageMetadata.mockRejectedValue(
        new Error('ファイル形式が不正です'),
      );

      // Act

      const res = await app.request('/api/v1/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'images/test.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      // Assert


      expect(res.status).toBe(422);
    });

    it('冪等性: 同一X-Request-IDの再送時は同じレスポンスを返し、サービスは1回だけ呼ばれる', async () => {
      // Arrange
      mocks.createImageMetadata.mockResolvedValue({
        id: 'test-image-id',
        url: 'https://s3.amazonaws.com/test-bucket/images/test.jpg?signed',
      });

      const body = JSON.stringify({
        key: 'images/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        contentType: 'image/jpeg',
      });
      const headers = {
        'Content-Type': 'application/json',
        'X-Request-ID': 'request-id-001',
      };

      // Act
      const first = await app.request('/api/v1/images', {
        method: 'POST',
        headers,
        body,
      });
      const second = await app.request('/api/v1/images', {
        method: 'POST',
        headers,
        body,
      });

      // Assert
      expect(first.status).toBe(201);
      expect(second.status).toBe(201);
      expect(await first.json()).toEqual(await second.json());
      expect(mocks.createImageMetadata).toHaveBeenCalledTimes(1);
    });

    it('冪等性: 同一X-Request-IDで異なるボディの場合は409を返す', async () => {
      // Arrange
      mocks.createImageMetadata.mockResolvedValue({
        id: 'test-image-id',
        url: 'https://s3.amazonaws.com/test-bucket/images/test.jpg?signed',
      });

      const headers = {
        'Content-Type': 'application/json',
        'X-Request-ID': 'request-id-002',
      };

      // Act
      const first = await app.request('/api/v1/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'images/test-a.jpg',
          fileName: 'test-a.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });
      const second = await app.request('/api/v1/images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: 'images/test-b.jpg',
          fileName: 'test-b.jpg',
          fileSize: 1024,
          contentType: 'image/jpeg',
        }),
      });

      // Assert
      expect(first.status).toBe(201);
      expect(second.status).toBe(409);
      expect(mocks.createImageMetadata).toHaveBeenCalledTimes(1);
    });
  });

  // api003-upload: 画像一覧取得
  describe('GET /api/v1/images', () => {
    it('正常系: 画像一覧を返す', async () => {
      // Arrange
      mocks.getImageList.mockResolvedValue([
        { id: 'image-1', fileName: 'test1.jpg', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'image-2', fileName: 'test2.png', createdAt: '2024-01-02T00:00:00.000Z' },
      ]);

      // Act

      const res = await app.request('/api/v1/images');
      // Assert


      expect(res.status).toBe(200);
      const body = await res.json();
      // Assert

      expect(body).toHaveLength(2);
      // Assert

      expect(body[0]).toHaveProperty('id', 'image-1');
    });

    it('正常系: 画像がないとき空配列を返す', async () => {
      // Arrange
      mocks.getImageList.mockResolvedValue([]);

      // Act

      const res = await app.request('/api/v1/images');
      // Assert


      expect(res.status).toBe(200);
      const body = await res.json();
      // Assert

      expect(body).toHaveLength(0);
    });

    it('サービスエラー: エラーが発生したとき400を返す', async () => {
      // Arrange
      mocks.getImageList.mockRejectedValue(new Error('DB接続エラー'));

      // Act

      const res = await app.request('/api/v1/images');
      // Assert


      expect(res.status).toBe(400);
    });
  });

  // api004-upload: 画像閲覧用URL取得
  describe('GET /api/v1/images/:id', () => {
    it('正常系: 署名付き閲覧URLと有効期限を返す', async () => {
      // Arrange
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      mocks.getImageUrl.mockResolvedValue({
        url: 'https://s3.amazonaws.com/test-bucket/images/test.jpg?signed',
        expiresAt,
      });

      // Act

      const res = await app.request('/api/v1/images/test-image-id');
      // Assert


      expect(res.status).toBe(200);
      const body = await res.json();
      // Assert

      expect(body).toHaveProperty('url');
      // Assert

      expect(body).toHaveProperty('expiresAt');
    });

    it('404: 画像が存在しないとき404を返す', async () => {
      // Arrange
      mocks.getImageUrl.mockRejectedValue(
        new Error('指定された画像が存在しません（id: non-existent-id）'),
      );

      // Act

      const res = await app.request('/api/v1/images/non-existent-id');
      // Assert


      expect(res.status).toBe(404);
    });

    it('サービスエラー: その他エラーのとき400を返す', async () => {
      // Arrange
      mocks.getImageUrl.mockRejectedValue(new Error('内部エラー'));

      // Act

      const res = await app.request('/api/v1/images/test-image-id');
      // Assert


      expect(res.status).toBe(400);
    });
  });
});
