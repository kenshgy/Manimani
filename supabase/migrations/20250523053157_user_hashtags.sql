-- ユーザーとハッシュタグの関連付けテーブル
create table if not exists user_hashtags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  hashtag_id uuid references hashtags(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, hashtag_id)
);

-- RLSを有効化
alter table user_hashtags enable row level security;

-- ポリシーの作成
create policy "ユーザーは自分のコミュニティ参加情報を閲覧可能"
  on user_hashtags for select
  using (auth.uid() = user_id);

create policy "ユーザーは自分のコミュニティ参加情報を更新可能"
  on user_hashtags for insert
  with check (auth.uid() = user_id);

create policy "ユーザーは自分のコミュニティ参加情報を削除可能"
  on user_hashtags for delete
  using (auth.uid() = user_id); 