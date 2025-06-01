-- ツイート
create table if not exists tweets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- updated_atを自動更新するトリガーを作成
drop trigger if exists update_tweets_updated_at on tweets;
create trigger update_tweets_updated_at
  before update on tweets
  for each row
  execute function update_updated_at_column();

-- RLSを有効化
alter table tweets enable row level security;

-- 既存のポリシーを削除
drop policy if exists "tweets_insert" on tweets;
drop policy if exists "tweets_update" on tweets;
drop policy if exists "tweets_select" on tweets;

-- ポリシーの作成
create policy "tweets_insert"
  on tweets for insert
  with check (auth.uid() = user_id);

create policy "tweets_update"
  on tweets for update
  using (auth.uid() = user_id);

create policy "tweets_select"
  on tweets for select
  using (true); 