'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';

interface Props {
  teamName: string;
  onClose: () => void;
}

export default function TeamProfileModal({ teamName, onClose }: Props) {
  const getTeamProfile = useTournamentStore((s) => s.getTeamProfile);
  const { t } = useI18n();
  const stats = getTeamProfile(teamName);

  const winRate = stats.totalWins + stats.totalLosses > 0
    ? ((stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-card-enter">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-lg font-bold">
              {teamName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface font-[Sora]">{teamName}</h2>
              <p className="text-xs text-on-surface-variant">{t.team.profile}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <StatCard label={t.team.totalWins} value={stats.totalWins} color="text-primary" bg="bg-primary/5" />
          <StatCard label={t.team.totalLosses} value={stats.totalLosses} color="text-tertiary" bg="bg-tertiary/5" />
          <StatCard label={t.team.totalDraws} value={stats.totalDraws} color="text-secondary" bg="bg-secondary/5" />
          <StatCard label={t.team.winRate} value={`${winRate}%`} color="text-primary" bg="bg-primary/5" />
          <div className="col-span-2">
            <StatCard label={t.team.tournamentsPlayed} value={stats.tournamentsPlayed} color="text-on-surface" bg="bg-surface-container" />
          </div>
        </div>

        {/* Match history */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">{t.team.matchHistory}</h3>
          {stats.matchHistory.length === 0 ? (
            <p className="text-sm text-on-surface-variant/60 text-center py-4">{t.team.noHistory}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.matchHistory.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20 transition-all hover:border-outline-variant/40">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-on-surface-variant/60">{m.tournamentName} · R{m.round}</div>
                    <div className="text-sm font-semibold text-on-surface truncate">vs {m.opponentName}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${m.result === 'win' ? 'bg-primary/10 text-primary' : ''}
                      ${m.result === 'loss' ? 'bg-tertiary/10 text-tertiary' : ''}
                      ${m.result === 'draw' ? 'bg-secondary/10 text-secondary' : ''}`}
                    >
                      {m.scoreFor} - {m.scoreAgainst}
                    </span>
                    <span className={`text-[10px] font-bold uppercase
                      ${m.result === 'win' ? 'text-primary' : ''}
                      ${m.result === 'loss' ? 'text-tertiary' : ''}
                      ${m.result === 'draw' ? 'text-secondary' : ''}`}
                    >
                      {m.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-4 pt-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold
              bg-surface-container hover:bg-surface-container-high
              text-on-surface-variant hover:text-on-surface
              transition-all duration-200"
          >
            {t.team.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`rounded-xl p-3 ${bg}`}>
      <div className="text-xs text-on-surface-variant/70 mb-0.5">{label}</div>
      <div className={`text-2xl font-extrabold font-[Sora] ${color}`}>{value}</div>
    </div>
  );
}
