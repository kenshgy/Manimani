-- ハッシュタグ
create table if not exists hashtags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- RLSを有効化
alter table hashtags enable row level security;

-- 既存のポリシーを削除
drop policy if exists "hashtags_insert" on hashtags;
drop policy if exists "hashtags_select" on hashtags;

-- ポリシーの作成
create policy "hashtags_insert"
  on hashtags for insert
  with check (true);

create policy "hashtags_select"
  on hashtags for select
  using (true); 