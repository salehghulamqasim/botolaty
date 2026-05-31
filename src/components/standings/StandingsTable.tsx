'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';

export default function StandingsTable() {
  const currentTournament = useTournamentStore((s) => s.currentTournament);
  const standings = useTournamentStore((s) => s.getStandings());
  const { t } = useI18n();

  if (!currentTournament) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <svg className="w-16 h-16 text-outline-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <p className="text-on-surface-variant text-lg">{t.shared.noData}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <section className="hidden md:block glass-panel rounded-xl overflow-hidden shadow-lg border border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant text-on-surface-variant text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 w-16 text-center">{t.standings.pos}</th>
                <th className="p-4">{t.standings.team}</th>
                <th className="p-4 text-center">{t.standings.mp}</th>
                <th className="p-4 text-center text-primary-fixed">{t.standings.w}</th>
                <th className="p-4 text-center text-tertiary-fixed">{t.standings.d}</th>
                <th className="p-4 text-center text-error">{t.standings.l}</th>
                <th className="p-4 text-center">{t.standings.pts}</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {standings.map((entry, idx) => (
                <tr
                  key={entry.teamId}
                  className="border-b border-outline-variant/50 hover:bg-surface-container-highest transition-colors cursor-pointer emerald-glow relative group"
                >
                  <td className={`p-4 text-center text-2xl font-extrabold font-[Sora] ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {idx + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <span className="text-base font-bold">{entry.teamName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-on-surface-variant">{entry.played}</td>
                  <td className="p-4 text-center">{entry.wins}</td>
                  <td className="p-4 text-center">{entry.draws}</td>
                  <td className="p-4 text-center">{entry.losses}</td>
                  <td className="p-4 text-center text-2xl font-extrabold font-[Sora] text-on-surface">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Cards */}
      <section className="md:hidden space-y-2">
        {standings.map((entry, idx) => (
          <div key={entry.teamId} className="standings-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-extrabold font-[Sora] ${idx === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  #{idx + 1}
                </span>
                <span className="text-sm font-bold">{entry.teamName}</span>
              </div>
              <span className="text-xl font-extrabold font-[Sora] text-on-surface">{entry.points}pts</span>
            </div>
            <div className="flex gap-3 text-xs text-on-surface-variant">
              <span>MP: {entry.played}</span>
              <span className="text-primary-fixed">W: {entry.wins}</span>
              <span className="text-tertiary-fixed">D: {entry.draws}</span>
              <span className="text-error">L: {entry.losses}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
