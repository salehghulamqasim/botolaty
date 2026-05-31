import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'بطولتي - Botolaty | Tournament Bracket Manager',
  description: 'Bilingual (Arabic/English) tournament bracket management application. Create, manage, and share tournament brackets.',
  keywords: ['tournament', 'bracket', 'esports', 'football', 'knockout', 'بطولة', 'بطولتي'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-sans antialiased overflow-x-hidden min-h-dvh flex flex-col">
        <I18nProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 lg:px-12 py-6 pb-20 md:pb-8 max-w-[1440px] mx-auto w-full">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </I18nProvider>
      </body>
    </html>
  );
}
