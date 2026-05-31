'use client';

import { useState, useEffect } from 'react';
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
  const confirmMatchScore = useTournamentStore((s) => s.confirmMatchScore);
  const setMatchStatus = useTournamentStore((s) => s.setMatchStatus);
  const { t } = useI18n();

  // ─── Local pending scores before confirm ───
  const [pendingA, setPendingA] = useState<number | null>(match.scoreA);
  const [pendingB, setPendingB] = useState<number | null>(match.scoreB);
  const [saved, setSaved] = useState(false);

  // Sync when match changes externally (e.g. switch tournaments)
  useEffect(() => {
    setPendingA(match.scoreA);
    setPendingB(match.scoreB);
    setSaved(false);
  }, [match.id, match.scoreA, match.scoreB]);

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';

  const isByeA = !!match.teamA?.id?.startsWith('bye-');
  const isByeB = !!match.teamB?.id?.startsWith('bye-');
  const hasBye = isByeA || isByeB;
  const hasTeams = !!(match.teamA && match.teamB);
  const isTBD = !match.teamA || !match.teamB;

  // Only show winner/loser when explicitly completed
  const showWinner = isCompleted && !!match.winnerId;
  const winnerIsA = showWinner && match.winnerId === match.teamA?.id;
  const winnerIsB = showWinner && match.winnerId === match.teamB?.id;

  // Confirm is available when both scores are filled and match is live/upcoming
  const bothPending = pendingA !== null && pendingB !== null;
  const hasChanges = pendingA !== match.scoreA || pendingB !== match.scoreB;
  const canConfirm = isAdmin && hasTeams && !hasBye && !isTBD && bothPending && !isCompleted;
  const showConfirm = canConfirm && hasChanges;

  const handleConfirm = () => {
    if (!canConfirm || pendingA === null || pendingB === null) return;
    confirmMatchScore(match.id, pendingA, pendingB);
    setSaved(true);
  };

  const isReadOnly = !isAdmin;

  // Border styling
  const borderClass = isLive
    ? 'border-primary/60 ring-1 ring-primary/40 shadow-lg shadow-primary/10'
    : isCompleted
    ? 'border-outline-variant/20'
    : 'border-outline-variant/30';

  const staggerDelay = `${index * 80}ms`;

  return (
    <div
      className={`bg-surface-container-low rounded-xl border shadow-sm relative overflow-hidden
        ${borderClass}
        ${isLive ? 'animate-card-pulse' : ''}
        transition-all duration-300 ease-out
        hover:border-primary/40 hover:shadow-md
        animate-card-enter`}
      style={{ animationDelay: staggerDelay }}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 w-full h-1 rounded-t-xl transition-all duration-500
          ${isLive ? 'bg-gradient-to-r from-primary via-emerald-300 to-primary animate-shimmer' : ''}
          ${isCompleted ? 'bg-surface-variant' : ''}
          ${isUpcoming && !isLive ? 'bg-gradient-to-r from-outline-variant/40 to-transparent' : ''}`}
      />

      <div className="p-3 pt-4 flex flex-col gap-3">
        {/* Header row: status + match number */}
        <div className="flex justify-between items-center text-xs">
          <StatusBadge status={match.status} />
          <span className="text-on-surface-variant/60 text-[11px] tabular-nums tracking-wider">
            M{match.position + 1}
          </span>
        </div>

        {/* ─── Grid scoring layout ─── */}
        <div className="grid grid-cols-12 items-center gap-1.5">
          {/* Team A: cols 1-5 */}
          <TeamBlock
            team={match.teamA}
            score={pendingA}
            isWinner={winnerIsA}
            isLoser={isCompleted && showWinner && !winnerIsA}
            isBye={isByeA}
            isCompleted={isCompleted}
            isReadOnly={isReadOnly || isByeA}
            onChange={(v) => { setPendingA(v); setSaved(false); }}
            byeLabel={t.bracket.bye}
          />

          {/* VS divider: cols 6-7 */}
          <div className="col-span-2 flex flex-col items-center justify-center gap-0.5">
            <span className="text-[9px] font-extrabold text-outline-variant/50 uppercase tracking-[0.15em] leading-none">
              VS
            </span>
            <div className="w-full h-px bg-outline-variant/20" />
          </div>

          {/* Team B: cols 8-12 */}
          <TeamBlock
            team={match.teamB}
            score={pendingB}
            isWinner={winnerIsB}
            isLoser={isCompleted && showWinner && !winnerIsB}
            isBye={isByeB}
            isCompleted={isCompleted}
            isReadOnly={isReadOnly || isByeB}
            onChange={(v) => { setPendingB(v); setSaved(false); }}
            byeLabel={t.bracket.bye}
          />
        </div>

        {/* ─── Confirm & Save button ─── */}
        {showConfirm && (
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 rounded-xl text-sm font-bold
              bg-primary/15 text-primary
              hover:bg-primary/25 hover:shadow-lg hover:shadow-primary/10
              active:scale-[0.98]
              transition-all duration-200
              border border-primary/30
              flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirm & Save Match Score
          </button>
        )}

        {/* Saved confirmation flash */}
        {saved && !hasChanges && isCompleted && (
          <div className="text-center text-xs text-primary/70 font-semibold animate-card-enter">
            ✓ Score saved · Winner advanced
          </div>
        )}

        {/* ─── Action buttons ─── */}
        {isAdmin && hasTeams && !hasBye && !isTBD && (
          <div className="flex gap-2 mt-0.5">
            {isUpcoming && (
              <button
                onClick={() => setMatchStatus(match.id, 'live')}
                className="flex-1 text-xs py-2.5 px-3 rounded-xl
                  bg-tertiary-container/10 text-tertiary
                  hover:bg-tertiary-container/25 hover:shadow-md
                  active:scale-[0.97]
                  font-semibold transition-all duration-200
                  border border-tertiary/15
                  flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t.bracket.start}
              </button>
            )}
            {isLive && (
              <button
                onClick={() => setMatchStatus(match.id, 'completed')}
                className="flex-1 text-xs py-2.5 px-3 rounded-xl
                  bg-primary-container/10 text-primary
                  hover:bg-primary-container/25 hover:shadow-md
                  active:scale-[0.97]
                  font-semibold transition-all duration-200
                  border border-primary/15
                  flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
                {t.bracket.finish}
              </button>
            )}
          </div>
        )}

        {/* BYE auto-advance */}
        {hasBye && isAdmin && !isCompleted && (
          <button
            onClick={() => {
              if (isByeA && match.teamB) confirmMatchScore(match.id, 0, 3);
              else if (isByeB && match.teamA) confirmMatchScore(match.id, 3, 0);
            }}
            className="text-xs py-2 rounded-xl
              bg-surface-container-highest/40 text-on-surface-variant
              hover:bg-surface-container-highest hover:text-primary
              active:scale-[0.97]
              font-medium transition-all duration-200
              border border-outline-variant/20 hover:border-primary/30"
          >
            {t.bracket.bye} — advance winner automatically
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TeamBlock — avatar + name + score input
   ═══════════════════════════════════════════ */

function TeamBlock({
  team,
  score,
  isWinner,
  isLoser,
  isBye,
  isCompleted,
  isReadOnly,
  onChange,
  byeLabel,
}: {
  team: { id: string; name: string } | null;
  score: number | null;
  isWinner: boolean;
  isLoser: boolean;
  isBye: boolean;
  isCompleted: boolean;
  isReadOnly: boolean;
  onChange: (v: number | null) => void;
  byeLabel: string;
}) {
  const isTBD = !team;
  const name = isBye ? byeLabel : (team?.name || 'TBD');

  return (
    <div
      className={`col-span-5 flex items-center gap-2 p-2.5 rounded-xl transition-all duration-300
        ${isBye ? 'opacity-40 bg-surface-variant/20' : ''}
        ${isWinner ? 'bg-primary/10 border border-primary/30 shadow-sm shadow-primary/5' : ''}
        ${isLoser && !isBye ? 'bg-surface-container opacity-50' : ''}
        ${!isWinner && !isLoser && !isBye && !isTBD ? 'bg-surface-container' : ''}
        ${isTBD ? 'bg-surface-container-lowest/50' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
          transition-all duration-300
          ${isBye ? 'bg-surface-variant text-on-surface-variant/40' : ''}
          ${isWinner ? 'bg-primary-container text-primary scale-110 ring-2 ring-primary/30' : ''}
          ${isLoser && !isBye ? 'bg-surface-variant text-on-surface-variant/50' : ''}
          ${!isWinner && !isLoser && !isBye && !isTBD ? 'bg-primary-container/70 text-primary' : ''}
          ${isTBD ? 'bg-surface-variant text-on-surface-variant/40' : ''}`}
      >
        {isBye ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Name + Score vertically stacked on small screens, row on larger */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <span
          className={`text-sm font-semibold truncate transition-all duration-300
            ${isWinner ? 'text-primary font-bold' : ''}
            ${isLoser && !isBye ? 'text-on-surface-variant/60' : ''}
            ${!isWinner && !isLoser && !isBye && !isTBD ? 'text-on-surface' : ''}
            ${isTBD || isBye ? 'text-on-surface-variant/50' : ''}`}
        >
          {name}
        </span>

        {/* Score field */}
        {isReadOnly || isCompleted ? (
          <span
            className={`text-lg font-extrabold font-[Sora] tabular-nums shrink-0 transition-all duration-300
              ${isWinner ? 'text-primary scale-110' : ''}
              ${isLoser ? 'text-on-surface-variant/50' : ''}
              ${!isWinner && !isLoser ? 'text-on-surface-variant' : ''}`}
          >
            {score ?? '-'}
          </span>
        ) : (
          <input
            type="number"
            min={0}
            max={99}
            value={score ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              const n = v === '' ? null : Math.max(0, Math.min(99, parseInt(v) || 0));
              onChange(n);
            }}
            className="w-14 h-10 score-input text-base shrink-0 rounded-xl
              transition-all duration-200
              focus:ring-2 focus:ring-primary/40 focus:border-primary
              hover:border-secondary/50
              font-extrabold"
            placeholder="-"
          />
        )}
      </div>
    </div>
  );
}
