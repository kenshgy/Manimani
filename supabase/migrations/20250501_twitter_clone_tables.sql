-- ユーザー情報 (Auth の user_id に紐付け)
create table profiles (
  id uuid primary key references auth.users(id),
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- ツイート
create table tweets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- ハッシュタグ
create table hashtags (
  id serial primary key,
  name text unique not null
);

-- 多対多：ツイートとハッシュタグの関係
create table tweet_hashtags (
  tweet_id uuid references tweets(id) on delete cascade,
  hashtag_id int references hashtags(id) on delete cascade,
  primary key (tweet_id, hashtag_id)
);

-- いいね
create table likes (
  user_id uuid references profiles(id),
  tweet_id uuid references tweets(id),
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (user_id, tweet_id)
);

-- リツイート
create table retweets (
  user_id uuid references profiles(id),
  tweet_id uuid references tweets(id),
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (user_id, tweet_id)
);

-- フォロー
create table follows (
  follower_id uuid references profiles(id),
  followed_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc', now()),
  primary key (follower_id, followed_id)
);