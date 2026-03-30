import pino from 'pino';

/**
 * 構造化ロガー
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
 * trace_id付きロガーを生成する
 */
export function createLoggerWithTrace(traceId: string) {
  return logger.child({ traceId });
}

/**
 * リクエストログを記録する
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
 * レスポンスログを記録する
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
