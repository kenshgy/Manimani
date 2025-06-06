-- ユーザーとハッシュタグの関連付けテーブル
create table public.user_hashtags (
  user_id uuid references public.profiles(id) on delete cascade not null,
  hashtag_id uuid references public.hashtags(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, hashtag_id)
);

-- RLSを有効化
alter table public.user_hashtags enable row level security;

-- ポリシーの作成
create policy "ユーザーハッシュタグは誰でも参照可能"
  on public.user_hashtags for select
  using ( true );

create policy "ユーザーハッシュタグは本人のみ作成可能"
  on public.user_hashtags for insert
  with check ( auth.uid() = user_id );

create policy "ユーザーハッシュタグは本人のみ削除可能"
  on public.user_hashtags for delete
  using ( auth.uid() = user_id ); 