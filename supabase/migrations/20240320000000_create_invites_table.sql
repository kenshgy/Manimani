-- 招待テーブルの作成
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシーの設定
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみが招待を作成できる
CREATE POLICY "認証済みユーザーは招待を作成できる" ON invites
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 認証済みユーザーは招待を閲覧できる
CREATE POLICY "認証済みユーザーは招待を閲覧できる" ON invites
  FOR SELECT TO authenticated
  USING (true);

-- 認証済みユーザーは招待を更新できる
CREATE POLICY "認証済みユーザーは招待を更新できる" ON invites
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true); 