'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Tweet, Hashtag } from '@/types';
import LinkifyIt from 'linkify-it';
import { useSearchParams, useRouter } from 'next/navigation';

const linkify = new LinkifyIt({
  fuzzyLink: false,
  fuzzyEmail: false,
  fuzzyIP: false,
});

// URLをリンクに変換する関数
const convertUrlsToLinks = (text: string) => {
  const matches = linkify.match(text);
  if (!matches) return text;

  let lastIndex = 0;
  const result = [];

  matches.forEach((match, index) => {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    result.push(
      <a
        key={index}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
      >
        {match.text}
      </a>
    );

    lastIndex = match.lastIndex;
  });

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
};

function ViewContent() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const region = searchParams.get('region');

  useEffect(() => {
    fetchHashtags();
    fetchTweets(region);
  }, [region]);

  const fetchHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtag_member_counts')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;

      if (data) {
        setHashtags(data.map(hashtag => ({
          id: hashtag.id,
          name: hashtag.name,
          memberCount: hashtag.member_count,
          created_at: hashtag.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching hashtags:', error);
      setError('ハッシュタグの取得に失敗しました');
    }
  };

  const fetchTweets = async (regionName: string | null) => {
    try {
      let query = supabase
        .from('tweets')
        .select(`
          *,
          profile:profiles(id, name, username, avatar_url),
          hashtags:hashtags!tweet_hashtags(id, name),
          tweet_hashtags!inner(hashtag_id)
        `)
        .order('created_at', { ascending: false });

      if (regionName) {
        // まず、指定された地域名のハッシュタグを検索
        const { data: hashtagData, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .eq('name', regionName)
          .single();

        if (hashtagError) {
          throw new Error('指定された地域のコミュニティが見つかりません');
        }

        query = query.eq('tweet_hashtags.hashtag_id', hashtagData.id);
      } else {
        // 地域が指定されていない場合は、tweet_hashtagsのinner joinを削除
        query = supabase
          .from('tweets')
          .select(`
            *,
            profile:profiles(id, name, username, avatar_url),
            hashtags:hashtags!tweet_hashtags(id, name)
          `)
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedTweets = data.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        image_url: tweet.image_url,
        created_at: tweet.created_at,
        updated_at: tweet.updated_at,
        user_id: tweet.user_id,
        profile: tweet.profile,
        hashtags: tweet.hashtags,
        author_name: tweet.profile.name || tweet.profile.username,
        author_username: tweet.profile.username,
        author_avatar: tweet.profile.avatar_url || '/images/default-avatar.png',
        timestamp: new Date(tweet.created_at).toLocaleString('ja-JP')
      })) as Tweet[];

      setTweets(formattedTweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setError('ツイートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtagName: string) => {
    router.push(`/view?region=${hashtagName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 画像拡大表示用モーダル */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full p-4">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full">
              <Image
                src={expandedImage}
                alt="Expanded image"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-20 mb-6 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {region ? `${region} の最新情報` : 'すべての最新情報'}
            </h1>
          </div>

          {/* ハッシュタグタブ */}
          <div className="relative">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex space-x-2 min-w-max">
                <button
                  onClick={() => router.push('/view')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    !region
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  すべて
                </button>
                {hashtags.map((hashtag) => (
                  <button
                    key={hashtag.id}
                    onClick={() => handleHashtagClick(hashtag.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      region === hashtag.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {hashtag.name}
                  </button>
                ))}
              </div>
            </div>
            {/* スクロールインジケーター */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* ツイート一覧 */}
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12">
                    <Image
                      src={tweet.author_avatar}
                      alt={tweet.author_name}
                      fill
                      sizes="48px"
                      className="rounded-full object-cover"
                      priority={tweets.indexOf(tweet) === 0}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tweet.author_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tweet.timestamp}
                    </p>
                  </div>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {convertUrlsToLinks(tweet.content)}
                  </p>
                  {tweet.image_url && (
                    <div className="mt-3 relative aspect-video w-full">
                      <Image
                        src={tweet.image_url}
                        alt="Tweet image"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        priority={tweets.indexOf(tweet) === 0}
                        onClick={() => setExpandedImage(tweet.image_url)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    }>
      <ViewContent />
    </Suspense>
  );
} 