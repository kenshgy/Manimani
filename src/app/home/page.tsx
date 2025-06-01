'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Hashtag, Tweet } from '@/types';

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [newTweet, setNewTweet] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 環境情報の出力
    console.log('環境情報:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // 機密情報は出力しない
    });

    // 初期ロード時にセッションを確認
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setNewTweet('');
      }
    });

    fetchHashtags();
    fetchTweets();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('name');

      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      console.error('Error fetching hashtags:', error);
    }
  };

  const fetchTweets = async (hashtagId?: string) => {
    try {
      let query = supabase
        .from('tweets')
        .select(`
          *,
          profile:profiles(id, name, username, avatar_url),
          hashtags:hashtags!tweet_hashtags(id, name)
        `)
        .order('created_at', { ascending: false });

      if (hashtagId) {
        query = supabase
          .from('tweets')
          .select(`
            *,
            profile:profiles(id, name, username, avatar_url),
            hashtags:hashtags!tweet_hashtags(id, name),
            tweet_hashtags!inner(hashtag_id)
          `)
          .eq('tweet_hashtags.hashtag_id', hashtagId)
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

  const handleHashtagClick = (hashtagId: string) => {
    setSelectedHashtag(hashtagId);
    fetchTweets(hashtagId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!newTweet.trim()) {
      setError('ツイート内容を入力してください');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // ハッシュタグを抽出
      const hashtagMatches = newTweet.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || [];
      const hashtagNames = hashtagMatches.map(tag => tag.slice(1));

      // ツイートを投稿
      const { data: tweet, error: tweetError } = await supabase
        .from('tweets')
        .insert([{
          content: newTweet,
          user_id: user.id
        }])
        .select()
        .single();

      if (tweetError) throw tweetError;

      // ハッシュタグを処理
      for (const name of hashtagNames) {
        // ハッシュタグが存在するか確認
        const { data: existingHashtag, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .eq('name', name)
          .single();

        if (hashtagError && hashtagError.code !== 'PGRST116') throw hashtagError;

        let hashtagId;
        if (existingHashtag) {
          hashtagId = existingHashtag.id;
        } else {
          // 新しいハッシュタグを作成
          const { data: newHashtag, error: createHashtagError } = await supabase
            .from('hashtags')
            .insert([{ name }])
            .select()
            .single();

          if (createHashtagError) throw createHashtagError;
          hashtagId = newHashtag.id;
        }

        // ツイートとハッシュタグを関連付け
        const { error: relationError } = await supabase
          .from('tweet_hashtags')
          .insert([{
            tweet_id: tweet.id,
            hashtag_id: hashtagId
          }]);

        if (relationError) throw relationError;
      }

      setNewTweet('');
      setError(null);
      fetchTweets();
    } catch (error) {
      console.error('ツイート投稿エラー:', error);
      setError('ツイートの投稿に失敗しました。もう一度お試しください。');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* メニューボタン */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 dark:text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      プロフィール
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    ログイン
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* ハッシュタグタブ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 p-4 min-w-max">
                <button
                  onClick={() => {
                    setSelectedHashtag(null);
                    fetchTweets();
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedHashtag === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  すべて
                </button>
                {hashtags.map((hashtag) => (
                  <button
                    key={hashtag.id}
                    onClick={() => handleHashtagClick(hashtag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedHashtag === hashtag.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{hashtag.name}
                  </button>
                ))}
              </div>
            </div>
            {/* スクロールインジケーター */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* ツイート投稿フォーム */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="いまどうしてる？"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newTweet.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ツイートする
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

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
                      @{tweet.author_username}
                    </p>
                    <span className="text-gray-500 dark:text-gray-400">·</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tweet.timestamp}
                    </p>
                  </div>
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {tweet.content}
                  </p>
                  {tweet.hashtags && tweet.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tweet.hashtags.map((hashtag) => (
                        <button
                          key={hashtag.id}
                          onClick={() => handleHashtagClick(hashtag.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          #{hashtag.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {tweet.image_url && (
                    <div className="mt-3 relative aspect-video w-full">
                      <Image
                        src={tweet.image_url}
                        alt="Tweet image"
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="rounded-lg object-cover"
                        priority={tweets.indexOf(tweet) === 0}
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