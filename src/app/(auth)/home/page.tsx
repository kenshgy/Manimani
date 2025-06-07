'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Hashtag, Tweet } from '@/types';
import LinkifyIt from 'linkify-it';
import { useAuth } from '@/hooks/useAuth';

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
    // URLの前のテキストを追加
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    // URLをリンクとして追加
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

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
};

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [newTweet, setNewTweet] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [userHashtags, setUserHashtags] = useState<string[]>([]);
  const { isAuthenticated } = useAuth(true);

  useEffect(() => {
    // 初期ロード時にセッションを確認
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchUserHashtags();
        fetchTweets();
      }
    };
    checkSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setNewTweet('');
        setTweets([]);
        setUserHashtags([]);
      }
    });

    fetchHashtags();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserHashtags = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_hashtags')
        .select('hashtag_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserHashtags(data.map(item => item.hashtag_id));
    } catch (error) {
      console.error('Error fetching user hashtags:', error);
    }
  };

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
    }
  };

  const handleHashtagClick = (hashtagId: string) => {
    setSelectedHashtag(hashtagId);
    fetchTweets(hashtagId);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        setError('画像サイズは5MB以下にしてください');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTweet.trim()) {
      setError('ツイート内容を入力してください');
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      let imageUrl = null;

      // 画像がある場合はアップロード
      if (selectedImage) {
        try {
          const fileExt = selectedImage.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, selectedImage);

          if (uploadError) {
            console.error('画像アップロードエラー:', uploadError);
            throw new Error('画像のアップロードに失敗しました');
          }

          // 画像のURLを取得
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          imageUrl = publicUrl;
        } catch (error) {
          console.error('画像処理エラー:', error);
          throw new Error('画像の処理に失敗しました');
        }
      }

      // ハッシュタグを抽出
      const hashtagMatches = newTweet.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || [];
      const hashtagNames = hashtagMatches.map(tag => tag.slice(1));

      // ツイートを投稿
      const { data: tweet, error: tweetError } = await supabase
        .from('tweets')
        .insert([{
          content: newTweet,
          user_id: user.id,
          image_url: imageUrl
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
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
      fetchTweets();
    } catch (error) {
      console.error('ツイート投稿エラー:', error);
      setError('ツイートの投稿に失敗しました。もう一度お試しください。');
    }
  };

  if (!isAuthenticated) {
    return null; // useAuthフックがリダイレクトを処理するため、ここでは何も返さない
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-2xl mx-auto p-4 pt-8">
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

        {/* ハッシュタグタブ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 p-4 min-w-max">
                
                  <>
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
                    {hashtags
                      .filter(hashtag => userHashtags.includes(hashtag.id))
                      .map((hashtag) => (
                        <button
                          key={hashtag.id}
                          onClick={() => handleHashtagClick(hashtag.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                            selectedHashtag === hashtag.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {hashtag.name}
                        </button>
                      ))}
                  </>
              </div>
            </div>
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-gray-900 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="tweet-image-upload"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('tweet-image-upload')?.click()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      tabIndex={0}
                      aria-label="画像をアップロード"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </button>
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      tabIndex={0}
                      aria-label="画像を削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!newTweet.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  つぶやく
                </button>
              </div>
              {imagePreview && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
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