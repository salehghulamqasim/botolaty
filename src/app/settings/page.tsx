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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface font-[Sora] tracking-tight">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your preferences and app data
        </p>
      </div>

      {/* Language */}
      <Section
        title={t.settings.language}
        desc={t.settings.languageDesc}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {lang === 'ar' ? t.settings.arabic : t.settings.english}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </Section>

      {/* App Info */}
      <Section
        title={t.settings.appInfo}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8 0l2.272.286M5 14.5v-2.086c0-.76-.202-1.474-.555-2.104M5 12.414V9.75m0 0L2.728 9.464A2.25 2.25 0 001.5 11.25v2.086c0 .76.202 1.474.555 2.104M5 12.414l2.272.286M5 12.414l2.272-.286M5 14.5l2.272.286M12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoBadge label={t.settings.version} value={t.app.version} />
          <InfoBadge label={t.settings.developer} value="Saleh Ghulam" />
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Pill label="Next.js 16" />
            <Pill label="TypeScript" />
            <Pill label="Tailwind v4" />
            <Pill label="Zustand" />
          </div>
        </div>
      </Section>

      {/* Data Management */}
      <Section
        title={t.settings.dataManagement}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M4.875 12c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125M4.875 12c0-2.278 3.694-4.125 8.25-4.125s8.25 1.847 8.25 4.125m0 0v3.75m-8.25-3.75v3.75m8.25-3.75v3.75M12 3.75c-2.278 0-4.394 1.125-6.375 3.375M12 3.75c2.278 0 4.394 1.125 6.375 3.375M12 3.75v3.75" />
          </svg>
        }
      >
        <div className="space-y-4">
          {/* Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/10">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-on-surface">{t.settings.exportData}</p>
              <p className="text-xs text-on-surface-variant">{t.settings.exportDataDesc}</p>
            </div>
            <button
              onClick={handleExport}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                bg-surface-container-high hover:bg-primary/10
                text-primary border border-primary/20 hover:border-primary/40
                transition-all duration-200 active:scale-[0.97]
                flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {exported ? t.settings.exported : t.settings.exportData}
            </button>
          </div>

          {/* Clear data */}
          <div className="p-3 rounded-xl bg-error/5 border border-error/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-error">{t.settings.clearData}</p>
                <p className="text-xs text-on-surface-variant">{t.settings.clearDataDesc}</p>
              </div>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                    bg-error/10 text-error border border-error/20
                    hover:bg-error/20 hover:border-error/30
                    transition-all duration-200 active:scale-[0.97]"
                >
                  {t.settings.clearData}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-error font-semibold">{t.settings.clearDataConfirm}</span>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-error text-white hover:bg-error/80 transition-colors shadow-sm"
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
            </div>
            {cleared && (
              <p className="text-xs text-success mt-2 font-medium animate-card-enter">
                ✓ {t.settings.dataCleared}
              </p>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  desc,
  icon,
  children,
}: {
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm">
      <div className="flex items-center gap-2.5 mb-1">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="text-lg font-bold text-on-surface font-[Sora]">{title}</h2>
      </div>
      {desc && <p className="text-sm text-on-surface-variant mb-4 ml-[28px]">{desc}</p>}
      <div className={desc ? '' : 'mt-4'}>{children}</div>
    </div>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface-container/80 border border-outline-variant/10">
      <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/8 text-primary border border-primary/15">
      {label}
    </span>
  );
}
