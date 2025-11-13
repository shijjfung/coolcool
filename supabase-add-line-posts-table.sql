-- ========================================
-- 添加 LINE 賣文記錄表
-- 在 Supabase Dashboard > SQL Editor 中執行此腳本
-- ========================================

-- 建立 LINE 賣文記錄表
CREATE TABLE IF NOT EXISTS line_posts (
  id BIGSERIAL PRIMARY KEY,
  form_id BIGINT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL,
  message_id TEXT,
  sender_name TEXT NOT NULL,
  post_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_line_posts_form_id ON line_posts(form_id);
CREATE INDEX IF NOT EXISTS idx_line_posts_group_id ON line_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_line_posts_created_at ON line_posts(created_at DESC);

