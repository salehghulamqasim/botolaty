'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';

export default function RecentResults() {
  const currentTournament = useTournamentStore((s) => s.currentTournament);
  const { t } = useI18n();

  if (!currentTournament) return null;

  const completedMatches = currentTournament.matches
    .filter((m) => m.status === 'completed' || m.status === 'live')
    .slice(-6)
    .reverse();

  if (completedMatches.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-on-surface font-[Sora]">
          {t.standings.recentResults}
        </h3>
        <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
          {t.standings.viewAll}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedMatches.map((match) => (
          <div
            key={match.id}
            className={`glass-panel p-4 rounded-xl border-t-2 cursor-pointer emerald-glow flex flex-col gap-2 relative overflow-hidden ${
              match.status === 'live' ? 'border-t-tertiary shadow-[0_0_15px_rgba(255,185,95,0.15)]' : 'border-t-outline-variant'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Round {match.round} • M{match.position + 1}</span>
              <span className={`flex items-center gap-1 font-bold uppercase ${
                match.status === 'live' ? 'text-tertiary' : ''
              }`}>
                {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-tertiary pulse-live" />}
                {match.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 flex-1">
                <span className={`text-sm font-bold ${match.winnerId === match.teamA?.id ? 'text-primary' : 'text-on-surface'}`}>
                  {match.teamA?.name || 'TBD'}
                </span>
                <span className={`text-sm font-bold ${match.winnerId === match.teamB?.id ? 'text-primary' : 'text-on-surface opacity-60'}`}>
                  {match.teamB?.name || 'TBD'}
                </span>
              </div>
              <div className="flex flex-col gap-1 items-end w-10">
                <span className={`text-lg font-extrabold font-[Sora] ${match.winnerId === match.teamA?.id ? 'text-primary' : 'text-on-surface'}`}>
                  {match.scoreA}
                </span>
                <span className={`text-lg font-extrabold font-[Sora] ${match.winnerId === match.teamB?.id ? 'text-primary' : 'text-on-surface opacity-60'}`}>
                  {match.scoreB}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
