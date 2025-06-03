import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hashtag } from '@/types';

interface CommunitySelectorProps {
  onComplete: (selectedHashtags: string[]) => void;
  onSkip: () => void;
  initialSelectedHashtags?: string[];
  title?: string;
  description?: string;
}

export default function CommunitySelector({
  onComplete,
  onSkip,
  initialSelectedHashtags = [],
  title = 'コミュニティに参加',
  description = '興味のあるコミュニティを選択してください（任意）'
}: CommunitySelectorProps) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(initialSelectedHashtags);
  const [tempSelectedHashtags, setTempSelectedHashtags] = useState<string[]>(initialSelectedHashtags);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchHashtags();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(selectedHashtags) !== JSON.stringify(tempSelectedHashtags));
  }, [selectedHashtags, tempSelectedHashtags]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = (hashtagId: string) => {
    setTempSelectedHashtags(prev => [...prev, hashtagId]);
  };

  const handleLeaveCommunity = (hashtagId: string) => {
    setTempSelectedHashtags(prev => prev.filter(id => id !== hashtagId));
  };

  const handleApplyChanges = () => {
    setSelectedHashtags(tempSelectedHashtags);
    setHasChanges(false);
  };

  const handleCancelChanges = () => {
    setTempSelectedHashtags(selectedHashtags);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {description}
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
                      #{hashtag.name}
                    </span>
                    {tempSelectedHashtags.includes(hashtag.id) ? (
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

              {hasChanges && (
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleCancelChanges}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    変更をキャンセル
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    変更を適用
                  </button>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={onSkip}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  スキップ
                </button>
                <button
                  onClick={() => onComplete(selectedHashtags)}
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