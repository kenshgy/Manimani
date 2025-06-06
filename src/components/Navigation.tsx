import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import { supabase } from '@/lib/supabase';

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
    <div className="fixed top-4 right-4 z-50">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
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
                    onClick={() => {
                      // コミュニティモーダルを表示する処理を追加
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      コミュニティ
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
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
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
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    ログイン
                  </div>
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <div className="flex items-center">
                  {theme === 'dark' ? (
                    <>
                      <SunIcon className="h-5 w-5 mr-2" />
                      ライトモード
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5 mr-2" />
                      ダークモード
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 