'use client';

import { useI18n } from '@/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="w-full mt-auto bg-surface-container-lowest border-t border-outline-variant/50">
      <div className="w-full py-6 px-4 md:px-12 flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto gap-4">
        <span className="text-sm font-semibold text-on-surface">
          {t.footer.rights}
        </span>
        <div className="flex gap-6">
          <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            {t.footer.support}
          </a>
          <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            {t.footer.privacy}
          </a>
          <a className="text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            {t.footer.terms}
          </a>
        </div>
      </div>
    </footer>
  );
}
