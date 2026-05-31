'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n';
import LanguageToggle from '@/components/shared/LanguageToggle';
import AdminToggle from '@/components/shared/AdminToggle';
import VisibilityToggle from '@/components/shared/VisibilityToggle';

export default function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/bracket', label: t.nav.brackets, icon: 'M10 3.22l-.66-.1a2 2 0 00-2.39 1.46l-2.57 7.72a2 2 0 00.34 1.7l5.28 7.92a2 2 0 002.54.67l7.72-2.57a2 2 0 001.46-2.39l-.1-.66M14 10l6 6m-6 0l6-6' },
    { href: '/standings', label: t.nav.standings, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <header className="w-full h-16 bg-surface-container-lowest border-b border-outline-variant/50 shadow-sm z-40 sticky top-0 flex-shrink-0">
      <div className="flex items-center justify-between px-4 md:px-12 w-full max-w-[1440px] mx-auto h-full">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-7 h-7 text-primary group-hover:text-primary-fixed transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xl font-bold text-primary tracking-tight font-[Sora]">
              {t.app.name}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-surface-container-high'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <AdminToggle />
          <VisibilityToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
