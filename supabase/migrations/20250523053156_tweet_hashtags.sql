-- ツイートとハッシュタグの中間テーブル
create table public.tweet_hashtags (
  tweet_id uuid references public.tweets(id) on delete cascade not null,
  hashtag_id uuid references public.hashtags(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (tweet_id, hashtag_id)
);

-- RLSを有効化
alter table public.tweet_hashtags enable row level security;

-- 既存のポリシーを削除
drop policy if exists "tweet_hashtags_insert" on public.tweet_hashtags;
drop policy if exists "tweet_hashtags_select" on public.tweet_hashtags;

-- ポリシーの作成
create policy "ツイートハッシュタグは誰でも参照可能"
  on public.tweet_hashtags for select
  using ( true );

create policy "ツイートハッシュタグはツイート作成者のみ作成可能"
  on public.tweet_hashtags for insert
  with check (
    exists (
      select 1 from public.tweets
      where id = tweet_id and user_id = auth.uid()
    )
  );

create policy "ツイートハッシュタグはツイート作成者のみ削除可能"
  on public.tweet_hashtags for delete
  using (
    exists (
      select 1 from public.tweets
      where id = tweet_id and user_id = auth.uid()
    )
  ); 