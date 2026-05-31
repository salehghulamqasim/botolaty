'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en, { Translations } from './en';
import ar from './ar';
import { Language } from '@/types/tournament';

const translations: Record<Language, Translations> = { en, ar };

interface I18nContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: en,
  setLang: () => {},
  isRtl: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
    if (typeof window !== 'undefined') {
      localStorage.setItem('botolaty_lang', l);
    }
  }, []);

  const value: I18nContextType = {
    lang,
    t: translations[lang],
    setLang,
    isRtl: lang === 'ar',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('botolaty_lang');
  if (stored === 'ar' || stored === 'en') return stored;
  return 'en';
}
