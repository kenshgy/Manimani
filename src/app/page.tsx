'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tweet } from '@/types/index';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTweets();
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tweets.length);
    }, 3000); // 5秒ごとにスライド

    return () => clearInterval(interval);
  }, [tweets.length]);

  const fetchTweets = async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*, profile:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTweets(data || []);
    } catch (error) {
      console.error('ツイートの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* ロゴ */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Manimani
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              日常のまにまに、心のまにまに
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="w-full max-w-md space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 inline-block text-center"
                >
                  ログイン
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition duration-200 inline-block text-center"
                >
                  アカウント作成
                </button>
              </div>
            </div>

            {/* 最新ツイートスライドショー */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  最新の投稿
                </h2>
                <button
                  onClick={() => router.push('/view')}
                  className="ml-4 bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                >
                  ログインせずに投稿をみる
                </button>
              </div>
              <div className="relative h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : tweets.length > 0 ? (
                  <div className="h-full">
                    {tweets.map((tweet, index) => (
                      <div
                        key={tweet.id}
                        className={`absolute inset-0 p-4 transition-opacity duration-500 ${
                          index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="relative w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              {tweet.profile?.avatar_url && (
                                <Image
                                  src={tweet.profile.avatar_url}
                                  alt={tweet.profile.username || ''}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  priority={index === currentIndex}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {tweet.profile?.username || '匿名ユーザー'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(tweet.created_at).toLocaleString('ja-JP')}
                            </p>
                            <p className="mt-1 text-gray-900 dark:text-white">
                              {tweet.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* インジケーター */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {tweets.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === currentIndex
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    ツイートはまだありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
