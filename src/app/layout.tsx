import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { NavLink } from '@/components/NavLink';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'WorShift',
  description: '예배 인도자를 위한 스마트 악보 관리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full`}>
      <body className="min-h-full bg-ws-bg" style={{ fontFamily: 'var(--font-noto), sans-serif' }}>
        <nav className="sticky top-0 z-10 bg-ws-card border-b border-ws-border">
          <div className="max-w-2xl mx-auto px-5 flex items-center gap-6 h-14">
            <a href="/" className="font-bold text-ws-text text-base mr-2 hover:opacity-75 transition-opacity">🎼 WorShift</a>
            <NavLink href="/songs">곡 DB</NavLink>
            <NavLink href="/contis">콘티</NavLink>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-5 py-7">{children}</main>
      </body>
    </html>
  );
}
