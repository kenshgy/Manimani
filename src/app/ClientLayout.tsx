'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowSplash(true);
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {showSplash && (
        <div className={`fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
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
      )}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main>{children}</main>
        <footer className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <a
            href="https://www.code4noto.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            ©️Code For Noto
          </a>
        </footer>
      </div>
    </>
  );
} 