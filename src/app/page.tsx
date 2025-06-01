export default function Home() {
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
              あなたの新しいアプリケーション
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="w-full max-w-md space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <div className="space-y-4">
                <a
                  href="/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 inline-block text-center"
                >
                  ログイン
                </a>
                <a
                  href="/signup"
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition duration-200 inline-block text-center"
                >
                  アカウント作成
                </a>
              </div>
            </div>

            {/* 特徴説明 */}
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                主な機能
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300">シンプル</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300">使いやすい</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <p className="text-gray-600 dark:text-gray-300">セキュア</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
