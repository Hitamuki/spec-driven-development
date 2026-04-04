/**
 * axios のグローバル設定
 * Orval 生成クライアントは axios をデフォルトで使用するため、
 * baseURL と共通ヘッダーをここで設定する。
 */
import axios from 'axios';
import { getTraceId } from './trace';

/**
 * Vite proxy が /api/v1 → http://localhost:3001/api/v1 に転送するため、
 * baseURL は相対パス /api/v1 を指定する。
 */
axios.defaults.baseURL = '/api/v1';

/**
 * リクエストインターセプターで X-Trace-ID / X-Request-ID を自動付与する
 */
axios.interceptors.request.use((config) => {
  config.headers['X-Trace-ID'] = getTraceId();
  if (!config.headers['X-Request-ID']) {
    config.headers['X-Request-ID'] = crypto.randomUUID();
  }
  return config;
});
