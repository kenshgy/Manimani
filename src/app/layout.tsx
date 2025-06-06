import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import ClientLayout from '@/app/ClientLayout';
import { ThemeProvider } from './context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'まにまに - 日常のまにまに、心のまにまに',
  description: '日常のまにまに、心のまにまに',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
