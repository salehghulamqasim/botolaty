'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';

export default function AdminToggle() {
  const { viewMode, setViewMode } = useTournamentStore();
  const { t } = useI18n();

  return (
    <div className="hidden sm:flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/50">
      <button
        onClick={() => setViewMode('admin')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
          viewMode === 'admin'
            ? 'bg-primary/20 text-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        {t.nav.adminMode}
      </button>
      <button
        onClick={() => setViewMode('spectator')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
          viewMode === 'spectator'
            ? 'bg-primary/20 text-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        {t.nav.spectatorMode}
      </button>
    </div>
  );
}
