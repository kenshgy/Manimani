'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  HomeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 認証状態の確認と監視
  useEffect(() => {
    // 初期認証状態の確認
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // メニューの外側をクリックした時の処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHomeClick = () => {
    router.push('/home');
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile/edit');
    setIsOpen(false);
  };

  const handleSettingClick = () => {
    router.push('/setting');
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    router.push('/login');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.push('/');
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              まにまに
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-6 h-6 text-gray-300" />
              ) : (
                <MoonIcon className="w-6 h-6 text-gray-700" />
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="メニューを開く"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={handleHomeClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <HomeIcon className="h-5 w-5 mr-2" />
                            ホーム
                          </div>
                        </button>
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-2" />
                            プロフィール
                          </div>
                        </button>
                        <button
                          onClick={handleSettingClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            設定
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/invite');
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <UserPlusIcon className="h-5 w-5 mr-2" />
                            ユーザーを招待
                          </div>
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                            ログアウト
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleLoginClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        <div className="flex items-center">
                          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2" />
                          ログイン
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 