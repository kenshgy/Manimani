-- 参加人数を取得するためのビュー
create or replace view hashtag_member_counts as
select 
  h.id,
  h.name,
  h.created_at,
  count(uh.user_id) as member_count
from hashtags h
left join user_hashtags uh on h.id = uh.hashtag_id
group by h.id, h.name, h.created_at; 