'use client';

import { useState, useMemo } from 'react';
import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import RoundColumn from './RoundColumn';
import MatchCard from './MatchCard';
import { Match } from '@/types/tournament';

export default function BracketTree() {
  const currentTournament = useTournamentStore((s) => s.getActiveTournament());
  const accessRole = useTournamentStore((s) => s.accessRole);
  const { t } = useI18n();

  // ─── Mobile: active round filter ───
  const [activeMobileRound, setActiveMobileRound] = useState<number | 'all'>('all');

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

  const isAdmin = accessRole === 'admin';
  const totalRounds = Math.log2(currentTournament.capacity);

  // Group matches by round
  const rounds = useMemo(() => {
    const map: Record<number, Match[]> = {};
    for (let r = 1; r <= totalRounds; r++) {
      map[r] = currentTournament.matches
        .filter((m) => m.round === r)
        .sort((a, b) => a.position - b.position);
    }
    return map;
  }, [currentTournament.matches, totalRounds]);

  const roundNumbers = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Mobile: flatten filtered matches
  const mobileMatches = useMemo(() => {
    if (activeMobileRound === 'all') {
      return roundNumbers.flatMap((r) => rounds[r] || []);
    }
    return rounds[activeMobileRound] || [];
  }, [activeMobileRound, rounds, roundNumbers]);

  return (
    <div className="max-w-full mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface font-[Sora] tracking-tight
            animate-slide-down">
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

      {/* ═══════════════════════════════════════════
          MOBILE VIEW (< 768px)
          Tab bar + filtered vertical column
          ═══════════════════════════════════════════ */}
      <div className="flex md:hidden flex-col gap-4">
        {/* Round Tab Bar — sticky, horizontally scrollable */}
        <div className="sticky top-[72px] z-30 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-md border-b border-outline-variant/30">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {/* All rounds tab */}
            <TabChip
              active={activeMobileRound === 'all'}
              onClick={() => setActiveMobileRound('all')}
              label={t.bracket.allRounds}
              emerald
            />
            {roundNumbers.map((r) => (
              <TabChip
                key={r}
                active={activeMobileRound === r}
                onClick={() => setActiveMobileRound(r)}
                label={getRoundLabel(r, totalRounds, t)}
                emerald={false}
              />
            ))}
          </div>
        </div>

        {/* Filtered Match Cards — vertical stack */}
        <div className="flex flex-col gap-3 px-0.5 pb-8">
          {mobileMatches.length === 0 ? (
            <EmptyRoundState t={t} />
          ) : (
            mobileMatches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                isAdmin={isAdmin}
                index={i}
              />
            ))
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          DESKTOP VIEW (>= 768px)
          Horizontal multi-column bracket tree
          ═══════════════════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto pb-6">
        <div className="flex gap-8 items-start min-w-fit pb-4">
          {roundNumbers.map((round) => (
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

/* ─── Round Label Helper ─── */

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

/* ─── Tab Chip ─── */

function TabChip({
  active,
  onClick,
  label,
  emerald,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emerald: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap
        transition-all duration-300 ease-out
        active:scale-95
        ${active
          ? 'bg-primary/15 text-primary border border-primary/40 shadow-sm shadow-primary/10'
          : 'bg-surface-container text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high hover:text-on-surface'}`}
    >
      {label}
    </button>
  );
}

/* ─── Empty Round State ─── */

function EmptyRoundState({ t }: { t: any }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm opacity-70 flex flex-col items-center justify-center p-8 h-[140px] animate-card-enter">
      <svg className="w-10 h-10 text-outline-variant mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <span className="text-sm text-on-surface-variant text-center">{t.bracket.awaitingFinalists}</span>
    </div>
  );
}
