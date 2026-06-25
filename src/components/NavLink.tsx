'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={
        active
          ? 'text-sm font-bold text-ws-primary border-b-2 border-ws-primary pb-0.5'
          : 'text-sm text-ws-mid hover:text-ws-text transition-colors'
      }
    >
      {children}
    </Link>
  );
}
