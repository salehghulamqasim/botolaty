'use client';

import { useI18n } from '@/i18n';
import { useTournamentStore } from '@/lib/tournamentStore';
import StandingsTable from '@/components/standings/StandingsTable';
import RecentResults from '@/components/standings/RecentResults';

export default function StandingsPage() {
  const { t } = useI18n();
  const currentTournament = useTournamentStore((s) => s.currentTournament);
  const viewMode = useTournamentStore((s) => s.viewMode);

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-on-surface font-[Sora] tracking-tight">
            {currentTournament?.name || t.standings.title}
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant mt-1">
            {currentTournament
              ? `${currentTournament.teams.length} ${t.dashboard.teamsCount} · ${currentTournament.matches.filter(m => m.status === 'completed').length} matches played`
              : t.standings.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-highest rounded-lg hover:bg-surface-bright transition-colors text-sm font-semibold border border-outline-variant text-on-surface-variant">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            {t.standings.filter}
          </button>
        </div>
      </header>

      <StandingsTable />
      <RecentResults />
    </div>
  );
}
