-- ユーザー情報 (Auth の user_id に紐付け)
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  name text,
  username text unique not null,
  email text,
  avatar_url text,
  bio text,
  prefecture text,      -- 例: 東京都
  city text,            -- 例: 港区
  street text,          -- 例: 芝公園4-2-8
  postal_code text,     -- 例: 105-0011
  date_of_birth date,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- updated_atを自動更新するトリガーを作成
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- RLSを有効化
alter table profiles enable row level security;

-- 既存のポリシーを削除
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
drop policy if exists "profiles_select" on profiles;

-- ポリシーの作成
create policy "profiles_insert"
  on profiles for insert
  with check (true);  -- anon権限でも作成可能

create policy "profiles_update"
  on profiles for update
  using (auth.uid() = id);  -- 認証済みユーザーのみ更新可能

create policy "profiles_select"
  on profiles for select
  using (true);  -- 誰でも閲覧可能 