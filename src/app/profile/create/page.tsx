'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Hashtag } from '@/types';

export default function CreateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    prefecture: '',
    city: '',
    street: '',
    postal_code: '',
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [step, setStep] = useState<'profile' | 'community'>('profile');
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  // ユーザー名の重複チェック
  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116はレコードが見つからない場合のエラー
        throw error;
      }

      if (data) {
        setUsernameError('このユーザー名は既に使用されています');
      } else {
        setUsernameError(null);
      }
    } catch (err) {
      console.error('ユーザー名チェックエラー:', err);
      setUsernameError('ユーザー名の確認中にエラーが発生しました');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // ユーザー名の変更を監視
  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(formData.username);
    }, 500); // 500msのディレイを設定

    return () => clearTimeout(timer);
  }, [formData.username]);

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
    setError(null);

    if (usernameError) {
      setError('ユーザー名が重複しています');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      let avatarUrl = '/logo.svg';

      if (selectedImage) {
        try {
          const fileExt = selectedImage.name.split('.').pop();
          const fileName = `${user.id}/avatar.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, selectedImage, { upsert: true });

          if (uploadError) {
            console.error('画像アップロードエラー:', uploadError);
            throw new Error('画像のアップロードに失敗しました');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          avatarUrl = publicUrl;
        } catch (error) {
          console.error('画像処理エラー:', error);
          throw new Error('画像の処理に失敗しました');
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: formData.name,
          username: formData.username,
          email: user.email,
          avatar_url: avatarUrl,
          prefecture: formData.prefecture,
          city: formData.city,
          street: formData.street,
          postal_code: formData.postal_code,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      setStep('community');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityComplete = async (selectedHashtags: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (selectedHashtags.length > 0) {
        const { error } = await supabase
          .from('user_hashtags')
          .insert(
            selectedHashtags.map(hashtagId => ({
              user_id: user.id,
              hashtag_id: hashtagId
            }))
          );

        if (error) throw error;
      }

      router.push('/home');
    } catch (error) {
      console.error('Error joining communities:', error);
      setError('コミュニティへの参加に失敗しました');
    }
  };

  const handleCommunitySkip = () => {
    router.push('/home');
  };

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
      setError('ハッシュタグの取得に失敗しました');
    }
  };

  const handleJoinCommunity = (hashtagId: string) => {
    setSelectedHashtags(prev => [...prev, hashtagId]);
  };

  const handleLeaveCommunity = (hashtagId: string) => {
    setSelectedHashtags(prev => prev.filter(id => id !== hashtagId));
  };

  useEffect(() => {
    if (step === 'community') {
      fetchHashtags();
    }
  }, [step]);

  if (step === 'community') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                コミュニティに参加
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                興味のあるコミュニティを選択してください（任意）
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <div className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {hashtags.map((hashtag) => (
                    <div
                      key={hashtag.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {hashtag.name}
                      </span>
                      {selectedHashtags.includes(hashtag.id) ? (
                        <button
                          onClick={() => handleLeaveCommunity(hashtag.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          退出
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(hashtag.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          参加
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleCommunitySkip}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    スキップ
                  </button>
                  <button
                    onClick={() => handleCommunityComplete(selectedHashtags)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              プロフィール作成
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              プロフィール情報を入力してください
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32">
                  <Image
                    src={imagePreview || '/logo.svg'}
                    alt="プロフィール画像"
                    fill
                    sizes="128px"
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex space-x-2">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    画像を選択
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  名前
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ユーザー名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    className={`w-full px-4 py-2 border ${
                      usernameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={loading}
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {usernameError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                disabled={loading || !!usernameError}
              >
                {loading ? '作成中...' : 'プロフィールを作成'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 