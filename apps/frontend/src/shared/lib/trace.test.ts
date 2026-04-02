import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('trace ユーティリティ', () => {
  beforeEach(async () => {
    // モジュールキャッシュをリセットして currentTraceId をクリアする
    await vi.resetModules();
  });

  describe('generateTraceId', () => {
    it('UUID v4 形式の文字列を返す', async () => {
      // Arrange
      const { generateTraceId } = await import('@/shared/lib/trace');

      // Act
      const id = generateTraceId();

      // Assert
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('呼び出すたびに異なるIDを返す', async () => {
      // Arrange
      const { generateTraceId } = await import('@/shared/lib/trace');

      // Act
      const id1 = generateTraceId();
      const id2 = generateTraceId();

      // Assert
      expect(id1).not.toBe(id2);
    });
  });

  describe('getTraceId', () => {
    it('UUID v4 形式の文字列を返す', async () => {
      // Arrange
      const { getTraceId } = await import('@/shared/lib/trace');

      // Act
      const id = getTraceId();

      // Assert
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('同じセッション内では同じIDを返す', async () => {
      // Arrange
      const { getTraceId } = await import('@/shared/lib/trace');

      // Act
      const id1 = getTraceId();
      const id2 = getTraceId();

      // Assert
      expect(id1).toBe(id2);
    });
  });

  describe('refreshTraceId', () => {
    it('UUID v4 形式の文字列を返す', async () => {
      // Arrange
      const { refreshTraceId } = await import('@/shared/lib/trace');

      // Act
      const id = refreshTraceId();

      // Assert
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('新しいIDを生成して返し、以降 getTraceId がそのIDを返す', async () => {
      // Arrange
      const { getTraceId, refreshTraceId } = await import('@/shared/lib/trace');
      const original = getTraceId();

      // Act
      const refreshed = refreshTraceId();

      // Assert
      expect(refreshed).not.toBe(original);
      expect(getTraceId()).toBe(refreshed);
    });
  });
});
