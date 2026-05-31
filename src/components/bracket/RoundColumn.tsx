'use client';

import { Match, TeamCapacity } from '@/types/tournament';
import { useI18n } from '@/i18n';
import MatchCard from './MatchCard';

interface Props {
  round: number;
  matches: Match[];
  capacity: TeamCapacity;
  isAdmin: boolean;
}

function getRoundLabel(round: number, totalRounds: number, t: any): string {
  const remaining = totalRounds - round + 1;
  switch (remaining) {
    case 1: return t.bracket.rounds.finals;
    case 2: return t.bracket.rounds.semifinals;
    case 3: return t.bracket.rounds.quarterfinals;
    case 4: return t.bracket.rounds.roundOf16;
    case 5: return t.bracket.rounds.roundOf32;
    default: return `Round ${round}`;
  }
}

export default function RoundColumn({ round, matches, capacity, isAdmin }: Props) {
  const { t } = useI18n();
  const totalRounds = Math.log2(capacity);
  const label = getRoundLabel(round, totalRounds, t);
  const isFinalRound = round === totalRounds;

  return (
    <div className="flex flex-col gap-4 w-[280px] shrink-0">
      <h3 className={`text-sm font-semibold text-center uppercase tracking-wider ${
        isFinalRound
          ? 'text-primary font-bold flex items-center justify-center gap-1'
          : 'text-on-surface-variant'
      }`}>
        {isFinalRound && (
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
        {label}
      </h3>

      {matches.map((match, i) => (
        <MatchCard key={match.id} match={match} isAdmin={isAdmin} index={i} />
      ))}

      {/* Empty state for placeholder slots */}
      {matches.length === 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm opacity-70 flex flex-col items-center justify-center p-6 h-[120px]">
          <svg className="w-8 h-8 text-outline-variant mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span className="text-sm text-on-surface-variant text-center">{t.bracket.awaitingFinalists}</span>
        </div>
      )}
    </div>
  );
}
