/**
 * trace_id は Frontend で生成（UUID v4）し、全リクエストのヘッダー X-Trace-ID に付与する。
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * 以前に生成された trace_id を取得、または新規生成する（セッション内での追跡用など）
 */
let currentTraceId: string | null = null;

export function getTraceId(): string {
  if (!currentTraceId) {
    currentTraceId = generateTraceId();
  }
  return currentTraceId;
}

export function refreshTraceId(): string {
  currentTraceId = generateTraceId();
  return currentTraceId;
}
