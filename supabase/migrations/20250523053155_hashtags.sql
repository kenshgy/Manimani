-- ハッシュタグ
create table public.hashtags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSを有効化
alter table public.hashtags enable row level security;

-- 既存のポリシーを削除
drop policy if exists "hashtags_insert" on public.hashtags;
drop policy if exists "hashtags_select" on public.hashtags;

-- ポリシーの作成
create policy "ハッシュタグは誰でも参照可能"
  on public.hashtags for select
  using ( true );

create policy "ハッシュタグは認証済みユーザーのみ作成可能"
  on public.hashtags for insert
  with check ( auth.role() = 'authenticated' );

create policy "ハッシュタグは認証済みユーザーのみ更新可能"
  on public.hashtags for update
  using ( auth.role() = 'authenticated' ); 