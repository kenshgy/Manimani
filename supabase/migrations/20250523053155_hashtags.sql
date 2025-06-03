-- ハッシュタグ
create table if not exists hashtags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamp with time zone default timezone('utc', now())
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