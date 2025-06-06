'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hashtag } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function Setting() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [userHashtags, setUserHashtags] = useState<string[]>([]);
  const [tempSelectedHashtags, setTempSelectedHashtags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserHashtags();
      fetchHashtags();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setTempSelectedHashtags(userHashtags);
  }, [userHashtags]);

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

  const handleJoinCommunity = (hashtagId: string) => {
    setTempSelectedHashtags(prev => [...prev, hashtagId]);
  };

  const handleLeaveCommunity = (hashtagId: string) => {
    setTempSelectedHashtags(prev => prev.filter(id => id !== hashtagId));
  };

  const handleApplyChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 追加するコミュニティ
      const toAdd = tempSelectedHashtags.filter(id => !userHashtags.includes(id));
      // 削除するコミュニティ
      const toRemove = userHashtags.filter(id => !tempSelectedHashtags.includes(id));

      // 追加処理
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('user_hashtags')
          .insert(
            toAdd.map(hashtagId => ({
              user_id: user.id,
              hashtag_id: hashtagId
            }))
          );

        if (insertError) throw insertError;
      }

      // 削除処理
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_hashtags')
          .delete()
          .eq('user_id', user.id)
          .in('hashtag_id', toRemove);

        if (deleteError) throw deleteError;
      }

      setUserHashtags(tempSelectedHashtags);
      setError(null);
      setSuccess('コミュニティの設定を更新しました');

      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // ハッシュタグ一覧を更新
      await fetchHashtags();
    } catch (error) {
      console.error('Error updating communities:', error);
      setError('コミュニティの更新に失敗しました');
      setSuccess(null);
    }
  };

  const handleAddHashtag = async () => {
    try {
      setIsAdding(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newHashtagData, error: createHashtagError } = await supabase
        .from('hashtags')
        .insert([{ name: newHashtag }])
        .select()
        .single();

      if (createHashtagError) throw createHashtagError;

      const { error: relationError } = await supabase
        .from('user_hashtags')
        .insert([{
          user_id: user.id,
          hashtag_id: newHashtagData.id
        }]);

      if (relationError) throw relationError;

      setUserHashtags(prev => [...prev, newHashtagData.id]);
      setShowAddModal(false);
      setNewHashtag('');
      setError(null);
      
      // コミュニティ一覧を更新
      await fetchHashtags();
    } catch (error) {
      console.error('Error adding hashtag:', error);
      setError('コミュニティの追加に失敗しました');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">ログインが必要です</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              コミュニティ設定
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              参加したいコミュニティを選択してください
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {hashtags.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {hashtag.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {hashtag.memberCount}人参加
                      </span>
                    </div>
                    {tempSelectedHashtags.includes(hashtag.id) ? (
                      <button
                        onClick={() => handleLeaveCommunity(hashtag.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        退出
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(hashtag.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        参加
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleApplyChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  変更を適用
                </button>
              </div>

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg">
                  {success}
                </div>
              )}

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>新しいコミュニティを作成</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* コミュニティ追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                新しいコミュニティを作成
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewHashtag('');
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="newHashtag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  コミュニティ名
                </label>
                <input
                  type="text"
                  id="newHashtag"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="コミュニティ名を入力"
                  disabled={isAdding}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewHashtag('');
                    setError(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  disabled={isAdding}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddHashtag}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAdding || !newHashtag.trim()}
                >
                  {isAdding ? '追加中...' : '追加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 