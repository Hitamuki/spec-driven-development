import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ImageService } from '../services/imageService';
import {
  createPresignedUrlSchema,
  createImageMetadataSchema,
  getImageListResponse,
  createPresignedUrlResponse,
  createImageMetadataResponse,
  getImageUrlResponse
} from '@image-upload/domain';
import type {
  GetPresignedUrlBody,
  CompleteUploadBody,
  GetPresignedUrl200,
  CompleteUpload201,
  ListImages200Item,
  GetImage200
} from '@image-upload/api';

const images = new Hono();
const imageService = new ImageService();

// api001-upload: 署名付きURL発行
images.post(
  '/presigned-url',
  zValidator('json', createPresignedUrlSchema),
  async (c) => {
    const data = c.req.valid('json');
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();

    try {
      const result = await imageService.createPresignedUrl(data, traceId);
      return c.json<GetPresignedUrl200>(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('上限')) {
          return c.json({ error: error.message }, 409);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

// api002-upload: アップロード完了・メタデータ登録
images.post(
  '/',
  zValidator('json', createImageMetadataSchema),
  async (c) => {
    const data = c.req.valid('json');
    const traceId = c.req.header('X-Trace-ID') || crypto.randomUUID();

    try {
      const result = await imageService.createImageMetadata(data, traceId);
      return c.json<CompleteUpload201>(result, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('存在しません')) {
          return c.json({ error: error.message }, 404);
        }
        if (error.message.includes('不正です')) {
          return c.json({ error: error.message }, 422);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

// api003-upload: 画像一覧取得
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
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

// api004-upload: 画像閲覧用URL取得
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
        if (error.message.includes('存在しません')) {
          return c.json({ error: error.message }, 404);
        }
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

export { images as imagesRoutes };
