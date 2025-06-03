-- ツイート
create table public.tweets (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  image_url text,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシーの設定
alter table public.tweets enable row level security;

create policy "ツイートは誰でも参照可能"
  on public.tweets for select
  using ( true );

create policy "ツイートは本人のみ更新可能"
  on public.tweets for update
  using ( auth.uid() = user_id );

create policy "ツイートは本人のみ削除可能"
  on public.tweets for delete
  using ( auth.uid() = user_id );

create policy "ツイートは認証済みユーザーのみ作成可能"
  on public.tweets for insert
  with check ( auth.uid() = user_id );

-- 更新時のタイムスタンプ自動更新
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.tweets
  for each row
  execute procedure public.handle_updated_at(); 