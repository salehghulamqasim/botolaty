'use client';

import { useState } from 'react';
import { Match } from '@/types/tournament';
import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import StatusBadge from '@/components/shared/StatusBadge';

interface Props {
  match: Match;
  isAdmin: boolean;
  index?: number;
}

export default function MatchCard({ match, isAdmin, index = 0 }: Props) {
  const updateMatchScore = useTournamentStore((s) => s.updateMatchScore);
  const setMatchStatus = useTournamentStore((s) => s.setMatchStatus);
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';

  const isByeA = !!match.teamA?.id?.startsWith('bye-');
  const isByeB = !!match.teamB?.id?.startsWith('bye-');
  const hasBye = isByeA || isByeB;
  const hasTeams = !!(match.teamA && match.teamB);
  const isTBD = !match.teamA || !match.teamB;

  const handleScoreChange = (team: 'A' | 'B', value: string) => {
    const num = parseInt(value) || 0;
    if (num < 0 || num > 99) return;
    const scoreA = team === 'A' ? num : (match.scoreA ?? 0);
    const scoreB = team === 'B' ? num : (match.scoreB ?? 0);
    updateMatchScore(match.id, scoreA, scoreB);
  };

  // Border + glow based on status
  const borderClass = isLive
    ? 'border-primary/60 ring-1 ring-primary/40 shadow-lg shadow-primary/10'
    : isCompleted
    ? 'border-outline-variant/20'
    : 'border-outline-variant/30';

  const cardGlow = isLive ? 'animate-card-pulse' : '';

  // Staggered entrance delay
  const staggerDelay = `${index * 80}ms`;

  return (
    <div
      className={`bg-surface-container-low rounded-xl border shadow-sm relative overflow-hidden
        ${borderClass} ${cardGlow}
        transition-all duration-300 ease-out
        hover:border-primary/50 hover:shadow-md hover:shadow-primary/5
        animate-card-enter`}
      style={{ animationDelay: staggerDelay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent bar — animated gradient for live */}
      <div
        className={`absolute top-0 left-0 w-full h-1 rounded-t-xl transition-all duration-500
          ${isLive ? 'bg-gradient-to-r from-primary via-emerald-300 to-primary animate-shimmer' : ''}
          ${isCompleted ? 'bg-surface-variant' : ''}
          ${isUpcoming && !isLive ? 'bg-gradient-to-r from-outline-variant/40 to-transparent' : ''}`}
      />

      <div className="p-3 pt-4 flex flex-col gap-2">
        {/* Header: status badge + match number */}
        <div className="flex justify-between items-center text-xs">
          <StatusBadge status={match.status} />
          <span className="text-on-surface-variant/60 text-[11px] tabular-nums tracking-wider">
            M{match.position + 1}
          </span>
        </div>

        {/* Team A */}
        <TeamRow
          team={match.teamA}
          score={match.scoreA}
          isWinner={match.winnerId === match.teamA?.id}
          isLoser={!!match.winnerId && match.winnerId !== match.teamA?.id}
          isAdmin={isAdmin}
          canScore={hasTeams && !isByeA}
          isBye={isByeA}
          isCompleted={isCompleted}
          onChange={(v) => handleScoreChange('A', v)}
          byeLabel={t.bracket.bye}
        />

        {/* VS divider */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="text-[10px] font-extrabold text-outline-variant/50 uppercase tracking-[0.2em]">
            vs
          </span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Team B */}
        <TeamRow
          team={match.teamB}
          score={match.scoreB}
          isWinner={match.winnerId === match.teamB?.id}
          isLoser={!!match.winnerId && match.winnerId !== match.teamB?.id}
          isAdmin={isAdmin}
          canScore={hasTeams && !isByeB}
          isBye={isByeB}
          isCompleted={isCompleted}
          onChange={(v) => handleScoreChange('B', v)}
          byeLabel={t.bracket.bye}
        />

        {/* Action buttons */}
        {isAdmin && hasTeams && !hasBye && !isTBD && (
          <div className="flex gap-2 mt-1">
            {isUpcoming && (
              <button
                onClick={() => setMatchStatus(match.id, 'live')}
                className="flex-1 text-xs py-2 px-3 rounded-lg
                  bg-tertiary-container/10 text-tertiary
                  hover:bg-tertiary-container/25 hover:shadow-md hover:shadow-tertiary/10
                  active:scale-[0.97]
                  font-semibold transition-all duration-200
                  border border-tertiary/20"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {t.bracket.start}
                </span>
              </button>
            )}
            {isLive && (
              <button
                onClick={() => setMatchStatus(match.id, 'completed')}
                className="flex-1 text-xs py-2 px-3 rounded-lg
                  bg-primary-container/10 text-primary
                  hover:bg-primary-container/25 hover:shadow-md hover:shadow-primary/10
                  active:scale-[0.97]
                  font-semibold transition-all duration-200
                  border border-primary/20"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                  </svg>
                  {t.bracket.finish}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Show BYE badge when match is a walkover */}
        {hasBye && isAdmin && !isCompleted && (
          <button
            onClick={() => {
              if (isByeA && match.teamB) {
                updateMatchScore(match.id, 0, 3);
              } else if (isByeB && match.teamA) {
                updateMatchScore(match.id, 3, 0);
              }
            }}
            className="text-xs py-1.5 px-3 rounded-lg
              bg-surface-container-highest/50 text-on-surface-variant
              hover:bg-surface-container-highest hover:text-primary
              active:scale-[0.97]
              font-medium transition-all duration-200
              border border-outline-variant/20 hover:border-primary/30"
          >
            Advance winner automatically
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Team Row Sub-Component ─── */

function TeamRow({
  team,
  score,
  isWinner,
  isLoser,
  isAdmin,
  canScore,
  isBye,
  isCompleted,
  onChange,
  byeLabel,
}: {
  team: { id: string; name: string } | null;
  score: number | null;
  isWinner: boolean;
  isLoser: boolean;
  isAdmin: boolean;
  canScore: boolean;
  isBye: boolean;
  isCompleted: boolean;
  onChange: (v: string) => void;
  byeLabel: string;
}) {
  const isTBD = !team;
  const name = isBye ? byeLabel : (team?.name || 'TBD');

  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-300
        ${isBye ? 'opacity-40 bg-surface-variant/30' : ''}
        ${isWinner ? 'bg-surface-container-high border border-primary/30 shadow-sm shadow-primary/5' : ''}
        ${isLoser && !isBye ? 'bg-surface-container opacity-50' : ''}
        ${!isWinner && !isLoser && !isBye && !isTBD ? 'bg-surface-container hover:bg-surface-container-high' : ''}
        ${isTBD ? 'bg-surface-container-lowest/50' : ''}`}
    >
      {/* Left: avatar + name */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
            transition-all duration-300
            ${isBye ? 'bg-surface-variant text-on-surface-variant/40' : ''}
            ${isWinner ? 'bg-primary-container text-primary scale-110 ring-2 ring-primary/30' : ''}
            ${isLoser && !isBye ? 'bg-surface-variant text-on-surface-variant/50' : ''}
            ${!isWinner && !isLoser && !isBye && !isTBD ? 'bg-primary-container/70 text-primary' : ''}
            ${isTBD ? 'bg-surface-variant text-on-surface-variant/40' : ''}`}
        >
          {isBye ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <span
          className={`text-sm font-semibold truncate transition-all duration-300
            ${isWinner ? 'text-on-surface font-bold' : ''}
            ${isLoser && !isBye ? 'text-on-surface-variant' : ''}
            ${!isWinner && !isLoser && !isBye && !isTBD ? 'text-on-surface' : ''}
            ${isTBD || isBye ? 'text-on-surface-variant/60' : ''}`}
        >
          {name}
        </span>
      </div>

      {/* Right: score or placeholder */}
      {isAdmin && canScore && !isBye ? (
        <input
          type="number"
          min={0}
          max={99}
          value={score ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-9 score-input text-sm shrink-0 rounded-lg
            transition-all duration-200
            focus:ring-2 focus:ring-primary/40 focus:border-primary
            hover:border-secondary/50"
          placeholder="-"
        />
      ) : (
        <span
          className={`text-lg font-extrabold font-[Sora] tabular-nums shrink-0 min-w-[1.5rem] text-right
            transition-all duration-300
            ${isCompleted && isWinner ? 'text-primary scale-110' : ''}
            ${isCompleted && isLoser ? 'text-on-surface-variant/50' : ''}
            ${!isCompleted ? 'text-on-surface-variant' : ''}`}
        >
          {score ?? '-'}
        </span>
      )}
    </div>
  );
}
