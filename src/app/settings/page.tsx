'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n';
import { useTournamentStore } from '@/lib/tournamentStore';
import LanguageToggle from '@/components/shared/LanguageToggle';

export default function SettingsPage() {
  const { t, lang } = useI18n();
  const exportAllData = useTournamentStore((s) => s.exportAllData);
  const clearAllData = useTournamentStore((s) => s.clearAllData);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botolaty-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleClear = () => {
    clearAllData();
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-on-surface font-[Sora] tracking-tight mb-8 animate-slide-down">
        {t.settings.title}
      </h1>

      {/* Language */}
      <Section title={t.settings.language} desc={t.settings.languageDesc}>
        <div className="flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">
            {lang === 'ar' ? t.settings.arabic : t.settings.english}
          </span>
          <LanguageToggle />
        </div>
      </Section>

      {/* App Info */}
      <Section title={t.settings.appInfo}>
        <div className="space-y-2">
          <InfoRow label={t.settings.version} value={t.app.version} />
          <InfoRow label={t.settings.developer} value="Saleh Ghulam" />
          <InfoRow label="Stack" value="Next.js 16 · TypeScript · Tailwind v4 · Zustand" />
          <InfoRow label="Repo" value="github.com/salehghulamqasim/botolaty" />
        </div>
      </Section>

      {/* Data Management */}
      <Section title={t.settings.dataManagement}>
        {/* Export */}
        <div className="mb-4">
          <p className="text-sm text-on-surface-variant mb-2">{t.settings.exportDataDesc}</p>
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-surface-container hover:bg-surface-container-high
              text-primary border border-primary/20 hover:border-primary/40
              transition-all duration-200 active:scale-[0.97]
              flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {t.settings.exportData}
          </button>
          {exported && <p className="text-xs text-primary mt-2 animate-card-enter">{t.settings.exported}</p>}
        </div>

        {/* Clear data */}
        <div>
          <p className="text-sm text-on-surface-variant mb-2">{t.settings.clearDataDesc}</p>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-error/10 text-error border border-error/20
                hover:bg-error/20 hover:border-error/30
                transition-all duration-200 active:scale-[0.97]"
            >
              {t.settings.clearData}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-error/5 border border-error/20">
              <span className="text-sm text-error font-semibold">{t.settings.clearDataConfirm}</span>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-error text-white hover:bg-error/80 transition-colors"
              >
                {t.settings.clearDataConfirmBtn}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                {t.settings.clearDataCancel}
              </button>
            </div>
          )}
          {cleared && <p className="text-xs text-primary mt-2 animate-card-enter">{t.settings.dataCleared}</p>}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
      <h2 className="text-lg font-bold text-on-surface font-[Sora] mb-1">{title}</h2>
      {desc && <p className="text-sm text-on-surface-variant mb-4">{desc}</p>}
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
    </div>
  );
}
