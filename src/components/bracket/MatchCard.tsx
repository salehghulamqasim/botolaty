'use client';

import { Match } from '@/types/tournament';
import { useTournamentStore } from '@/lib/tournamentStore';
import StatusBadge from '@/components/shared/StatusBadge';

interface Props {
  match: Match;
  isAdmin: boolean;
}

export default function MatchCard({ match, isAdmin }: Props) {
  const updateMatchScore = useTournamentStore((s) => s.updateMatchScore);
  const setMatchStatus = useTournamentStore((s) => s.setMatchStatus);

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';
  const hasTeams = match.teamA && match.teamB;

  const handleScoreChange = (team: 'A' | 'B', value: string) => {
    const num = parseInt(value) || 0;
    if (num < 0 || num > 99) return;
    const scoreA = team === 'A' ? num : (match.scoreA ?? 0);
    const scoreB = team === 'B' ? num : (match.scoreB ?? 0);
    updateMatchScore(match.id, scoreA, scoreB);
  };

  const borderClass = isLive
    ? 'border-primary/50 ring-1 ring-primary/30'
    : isCompleted
    ? 'border-outline-variant/30'
    : 'border-outline-variant/30';

  const topBarClass = isLive
    ? 'bg-primary'
    : isCompleted
    ? 'bg-surface-variant'
    : 'bg-surface-variant';

  return (
    <div className={`bg-surface-container-low rounded-lg border shadow-sm relative ${borderClass} transition-all hover:border-primary/50`}>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${topBarClass} rounded-t-lg`} />

      <div className="p-3 flex flex-col gap-2">
        {/* Header */}
        <div className="flex justify-between items-center text-xs">
          <StatusBadge status={match.status} />
          <span className="text-on-surface-variant">M{match.position + 1}</span>
        </div>

        {/* Team A */}
        <div className={`flex justify-between items-center p-2 rounded ${match.winnerId && match.winnerId === match.teamA?.id ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              match.teamA
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-variant text-on-surface-variant'
            }`}>
              {match.teamA?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className={`text-sm font-semibold ${match.winnerId && match.winnerId !== match.teamA?.id ? 'text-on-surface opacity-50' : 'text-on-surface'}`}>
              {match.teamA?.name || 'TBD'}
            </span>
          </div>
          {isAdmin && hasTeams ? (
            <input
              type="number"
              min={0}
              max={99}
              value={match.scoreA ?? ''}
              onChange={(e) => handleScoreChange('A', e.target.value)}
              className="w-12 score-input h-8 text-sm"
            />
          ) : (
            <span className={`text-lg font-extrabold font-[Sora] ${isCompleted ? 'text-primary' : 'text-on-surface'}`}>
              {match.scoreA ?? '-'}
            </span>
          )}
        </div>

        {/* Team B */}
        <div className={`flex justify-between items-center p-2 rounded ${match.winnerId && match.winnerId === match.teamB?.id ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              match.teamB
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-variant text-on-surface-variant'
            }`}>
              {match.teamB?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className={`text-sm font-semibold ${match.winnerId && match.winnerId !== match.teamB?.id ? 'text-on-surface opacity-50' : 'text-on-surface'}`}>
              {match.teamB?.name || 'TBD'}
            </span>
          </div>
          {isAdmin && hasTeams ? (
            <input
              type="number"
              min={0}
              max={99}
              value={match.scoreB ?? ''}
              onChange={(e) => handleScoreChange('B', e.target.value)}
              className="w-12 score-input h-8 text-sm"
            />
          ) : (
            <span className={`text-lg font-extrabold font-[Sora] ${isCompleted ? 'text-primary' : 'text-on-surface'}`}>
              {match.scoreB ?? '-'}
            </span>
          )}
        </div>

        {/* Actions */}
        {isAdmin && hasTeams && (
          <div className="flex gap-1 mt-1">
            {isUpcoming && (
              <button
                onClick={() => setMatchStatus(match.id, 'live')}
                className="flex-1 text-xs py-1 px-2 rounded bg-tertiary-container/20 text-tertiary hover:bg-tertiary-container/30 font-semibold transition-colors"
              >
                Start
              </button>
            )}
            {isLive && (
              <button
                onClick={() => setMatchStatus(match.id, 'completed')}
                className="flex-1 text-xs py-1 px-2 rounded bg-primary-container/20 text-primary hover:bg-primary-container/30 font-semibold transition-colors"
              >
                Finish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
