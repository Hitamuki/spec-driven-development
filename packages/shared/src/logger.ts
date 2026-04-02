import pino from 'pino';

/**
 * アプリケーション全体で使用する構造化ロガー（Pino）
 * JSON形式で出力し、CloudWatch Logs Insightsでの横断検索を可能にする
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
  },
});

/**
 * trace_idを持つ子ロガーを生成する
 * 生成した子ロガーはすべてのログにtraceIdフィールドを自動付与する
 * @param traceId - フロントエンドで生成したUUID v4のトレースID
 * @returns traceId付きの子ロガー
 */
export function createLoggerWithTrace(traceId: string) {
  return logger.child({ traceId });
}

/**
 * リクエスト受信ログを記録する
 * 認証ヘッダーはマスクして出力する
 * @param traceId - トレースID
 * @param method - HTTPメソッド
 * @param url - リクエストURL
 * @param headers - リクエストヘッダー（センシティブな値は自動マスク）
 */
export function logRequest(traceId: string, method: string, url: string, headers: Record<string, string>) {
  const childLogger = createLoggerWithTrace(traceId);
  childLogger.info({
    event: 'request_start',
    method,
    url,
    headers: {
      ...headers,
      // センシティブなヘッダーはマスク
      authorization: headers.authorization ? '[MASKED]' : undefined,
    },
  }, 'Request started');
}

/**
 * レスポンス送信ログを記録する
 * @param traceId - トレースID
 * @param statusCode - HTTPステータスコード
 * @param duration - リクエスト処理時間（ミリ秒）
 */
export function logResponse(traceId: string, statusCode: number, duration: number) {
  const childLogger = createLoggerWithTrace(traceId);
  childLogger.info({
    event: 'request_end',
    statusCode,
    duration,
  }, 'Request completed');
}

/**
 * エラーログを記録する
 * スタックトレースと任意のコンテキスト情報を含める
 * @param traceId - トレースID
 * @param error - 発生したエラーオブジェクト
 * @param context - エラー発生時の追加コンテキスト情報（任意）
 */
export function logError(traceId: string, error: Error, context?: Record<string, any>) {
  const childLogger = createLoggerWithTrace(traceId);
  childLogger.error({
    event: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  }, 'Error occurred');
}
