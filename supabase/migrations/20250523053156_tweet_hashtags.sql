-- ツイートとハッシュタグの中間テーブル
create table if not exists tweet_hashtags (
  tweet_id uuid references tweets(id) on delete cascade,
  hashtag_id uuid references hashtags(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (tweet_id, hashtag_id)
);

-- RLSを有効化
alter table tweet_hashtags enable row level security;

-- 既存のポリシーを削除
drop policy if exists "tweet_hashtags_insert" on tweet_hashtags;
drop policy if exists "tweet_hashtags_select" on tweet_hashtags;

-- ポリシーの作成
create policy "tweet_hashtags_insert"
  on tweet_hashtags for insert
  with check (true);

create policy "tweet_hashtags_select"
  on tweet_hashtags for select
  using (true); 