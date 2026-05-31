'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import RoundColumn from './RoundColumn';

export default function BracketTree() {
  const currentTournament = useTournamentStore((s) => s.currentTournament);
  const viewMode = useTournamentStore((s) => s.viewMode);
  const { t } = useI18n();

  if (!currentTournament) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <svg className="w-16 h-16 text-outline-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        <p className="text-on-surface-variant text-lg">{t.shared.noData}</p>
        <p className="text-on-surface-variant/60 text-sm">Create a tournament from the Dashboard first</p>
      </div>
    );
  }

  const isAdmin = viewMode === 'admin';
  const totalRounds = Math.log2(currentTournament.capacity);

  // Group matches by round
  const rounds: Record<number, typeof currentTournament.matches> = {};
  for (let r = 1; r <= totalRounds; r++) {
    rounds[r] = currentTournament.matches
      .filter((m) => m.round === r)
      .sort((a, b) => a.position - b.position);
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface font-[Sora] tracking-tight">
            {currentTournament.name}
          </h1>
          <p className="text-base text-on-surface-variant mt-1">
            {Object.keys(rounds).length} rounds · {currentTournament.teams.length} {t.dashboard.teamsCount}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant">
          <span className="px-3 py-1.5 rounded-md bg-surface-container-highest text-on-surface text-sm font-semibold shadow-sm">
            {t.bracket.knockout}
          </span>
        </div>
      </div>

      {/* Bracket Canvas — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-8 items-start min-w-fit pb-4">
          {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
            <RoundColumn
              key={round}
              round={round}
              matches={rounds[round] || []}
              capacity={currentTournament.capacity}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
