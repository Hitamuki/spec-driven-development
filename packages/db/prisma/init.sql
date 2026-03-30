-- PostgreSQL初期化スクリプト
-- UTF-8エンコーディングとタイムゾーン設定

SET client_encoding = 'UTF8';
SET timezone = 'UTC';

-- 拡張機能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- アプリケーション用ユーザー（必要な場合）
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE image_upload TO app_user;
