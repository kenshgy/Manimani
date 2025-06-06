'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 現在のユーザー情報を取得
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('ユーザー情報が見つかりません');

      // APIルートを呼び出して招待メールを送信
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          invited_by: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.includes('A user with this email address has already been registered')) {
          throw new Error('このメールアドレスは既に登録されています');
        } else if (data.error?.includes('このメールアドレスは既に招待済みです')) {
          throw new Error('このメールアドレスは既に招待済みです');
        } else {
          throw new Error(data.error || '招待メールの送信に失敗しました');
        }
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '招待メールの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ユーザーを招待
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              招待したいユーザーのメールアドレスを入力してください
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="example@example.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg">
                  招待メールを送信しました
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : '招待メールを送信'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 