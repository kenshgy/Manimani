'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="ja">
      <body className={inter.className}>
        {showSplash ? (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50 transition-opacity duration-1000">
            <div className="relative w-32 h-32 mb-8">
              <Image
                src="/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                日常のまにまに、
              </h1>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white self-end">
                心のまにまに
              </h1>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
