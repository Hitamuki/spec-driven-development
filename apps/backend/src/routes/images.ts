import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ImageService } from '../services/imageService';
import { idempotencyStore } from '../services/idempotencyStore';
import {
  createPresignedUrlSchema,
  createImageMetadataSchema,
  getImageListResponse,
  createPresignedUrlResponse,
  createImageMetadataResponse,
  getImageUrlResponse,
  MAX_UPLOAD_COUNT,
  API_MESSAGES,
  API_MESSAGE_CODES,
  DOMAIN_ERROR_MESSAGES,
} from '@image-upload/domain';
import type {
  GetPresignedUrlBody,
  CompleteUploadBody,
  GetPresignedUrl200,
  CompleteUpload201,
  ListImages200Item,
  GetImage200
} from '@image-upload/api';

/**
 * 画像APIのルート定義
 * /api/v1/images 配下のエンドポイントを管理し、
 * リクエストの入力バリデーションとエラーレスポンスのマッピングを担う
 */
const images = new Hono();
const imageService = new ImageService();

const getIdempotencyKey = (method: string, path: string, requestId: string): string => {
  return `${method}:${path}:${requestId}`;
};

/**
 * api001-upload: 署名付きURL発行
 * クライアントがS3に直接アップロードするためのPresigned URLを返す
 * アップロード枚数上限（409）やバリデーションエラー（400）を処理する
 */
images.post(
  '/presigned-url',
  zValidator('json', createPresignedUrlSchema),
  async (c) => {
    const data = c.req.valid('json');
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();
    const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();

    const key = getIdempotencyKey('POST', '/images/presigned-url', requestId);
    const payload = JSON.stringify(data);

    try {
      const result = await idempotencyStore.execute(key, payload, async () => {
        const response = await imageService.createPresignedUrl(data, traceId);
        return { status: 200, body: response };
      });

      if ('conflict' in result) {
        return c.json({ error: 'X-Request-IDが別リクエストで再利用されています' }, 409);
      }

      return c.json<GetPresignedUrl200>(result.body as GetPresignedUrl200, result.status as 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === API_MESSAGES[API_MESSAGE_CODES.UPLOAD_LIMIT_EXCEEDED](MAX_UPLOAD_COUNT)) {
          return c.json({ error: error.message }, 409);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: API_MESSAGES[API_MESSAGE_CODES.INTERNAL_SERVER_ERROR] }, 500);
    }
  }
);

/**
 * api002-upload: アップロード完了・メタデータ登録
 * S3アップロード後にマジックナンバー検証を行い、正当な画像のみDBに登録する
 * ファイル不正（422）やS3未存在（404）をエラーとして返す
 */
images.post(
  '/',
  zValidator('json', createImageMetadataSchema),
  async (c) => {
    const data = c.req.valid('json');
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();
    const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();

    const key = getIdempotencyKey('POST', '/images', requestId);
    const payload = JSON.stringify(data);

    try {
      const result = await idempotencyStore.execute(key, payload, async () => {
        const response = await imageService.createImageMetadata(data, traceId);
        return { status: 201, body: response };
      });

      if ('conflict' in result) {
        return c.json({ error: 'X-Request-IDが別リクエストで再利用されています' }, 409);
      }

      return c.json<CompleteUpload201>(result.body as CompleteUpload201, result.status as 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === API_MESSAGES[API_MESSAGE_CODES.FILE_NOT_FOUND_ON_S3]) {
          return c.json({ error: error.message }, 404);
        }
        if (error.message === DOMAIN_ERROR_MESSAGES.INVALID_FILE_FORMAT) {
          return c.json({ error: error.message }, 422);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: API_MESSAGES[API_MESSAGE_CODES.INTERNAL_SERVER_ERROR] }, 500);
    }
  }
);

/**
 * api003-upload: 画像一覧取得
 * DBに登録されているすべての画像のメタデータを返す
 */
images.get(
  '/',
  async (c) => {
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();

    try {
      const result = await imageService.getImageList(traceId);
      return c.json<ListImages200Item[]>(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: API_MESSAGES[API_MESSAGE_CODES.INTERNAL_SERVER_ERROR] }, 500);
    }
  }
);

/**
 * api004-upload: 画像閲覧用URL取得
 * 指定IDの画像に対して有効期限付きPresigned URLを発行する
 * 画像が存在しない場合は404を返す
 */
images.get(
  '/:id',
  async (c) => {
    const id = c.req.param('id');
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();

    try {
      const result = await imageService.getImageUrl(id, traceId);
      return c.json<GetImage200>(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === API_MESSAGES[API_MESSAGE_CODES.IMAGE_NOT_FOUND](id)) {
          return c.json({ error: error.message }, 404);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: API_MESSAGES[API_MESSAGE_CODES.INTERNAL_SERVER_ERROR] }, 500);
    }
  }
);

export { images as imagesRoutes };
