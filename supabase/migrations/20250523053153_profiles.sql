-- ユーザー情報 (Auth の user_id に紐付け)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  username text not null unique,
  email text,
  avatar_url text,
  bio text,
  prefecture text,      -- 例: 東京都
  city text,            -- 例: 港区
  street text,          -- 例: 芝公園4-2-8
  postal_code text,     -- 例: 105-0011
  date_of_birth text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーの設定
alter table public.profiles enable row level security;

create policy "プロフィールは誰でも参照可能"
  on public.profiles for select
  using ( true );

create policy "プロフィールは本人のみ更新可能"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "プロフィールは本人のみ作成可能"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- 更新時のタイムスタンプ自動更新
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at(); 