'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import { useRumble } from '@/hooks/useRumble';
import RoundColumn from './RoundColumn';
import MatchCard from './MatchCard';
import { Match } from '@/types/tournament';

export default function BracketTree() {
  const currentTournament = useTournamentStore((s) => s.getActiveTournament());
  const accessRole = useTournamentStore((s) => s.accessRole);
  const { t } = useI18n();
  const { buzz } = useRumble();

  const [activeMobileRound, setActiveMobileRound] = useState<number | 'all'>('all');
  const [view, setView] = useState<'default' | 'eagle'>('default');
  const [exporting, setExporting] = useState(false);
  const eagleRootRef = useRef<HTMLDivElement>(null);

  if (!currentTournament) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center">
          <svg className="w-8 h-8 text-outline-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-on-surface font-[Sora]">No tournament selected</h2>
        <p className="text-sm text-on-surface-variant max-w-md">Create a tournament from the Dashboard first</p>
      </div>
    );
  }

  const canView = accessRole === 'admin' || (currentTournament.isPublic && currentTournament.lifecycle !== 'draft');
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center">
          <svg className="w-8 h-8 text-outline-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-on-surface font-[Sora]">This tournament is private</h2>
        <p className="text-sm text-on-surface-variant max-w-md">
          The administrator has restricted access to this bracket. Switch to <span className="text-primary font-semibold">Admin Mode</span> in the navbar to view it, or ask the owner to make it public.
        </p>
      </div>
    );
  }

  const isAdmin = accessRole === 'admin';
  const totalMatches = currentTournament.matches.length || currentTournament.capacity || 2;
  const totalRounds = Math.ceil(Math.log2(totalMatches));
  const teams = useMemo(() => currentTournament.teams ?? [], [currentTournament.teams]);

  const rounds = useMemo(() => {
    const map: Record<number, Match[]> = {};
    const maxRoundEntries = Math.pow(2, totalRounds - 1);

    const roster: typeof teams = teams.slice();
    const seededFirst: typeof teams = [];
    const seededSecond: typeof teams = [];
    for (let i = 0; i < roster.length; i += 2) seededFirst.push(roster[i] ?? { id: `seed-${i}`, name: `TBD ${i}` });
    for (let i = 1; i < roster.length; i += 2) seededSecond.push(roster[i] ?? { id: `seed-${i}`, name: `TBD ${i}` });

    for (let r = 1; r <= totalRounds; r++) {
      const entries: Match[] = [];
      for (let i = 0; i < maxRoundEntries; i++) {
        if (r === 1) {
          const teamA = seededFirst[i] ?? seededFirst[0] ?? (i > 0 ? { id: `bye-${currentTournament.id}-${i}`, name: 'BYE' } : null);
          const teamB = seededSecond[i] ?? seededSecond[0] ?? (i > 0 ? { id: `bye-${currentTournament.id}-${i}`, name: 'BYE' } : null);
          entries.push({
            id: `${r}-${i}`,
            teamA: teamA,
            teamB: teamB,
            round: r,
            position: i,
            scoreA: 0,
            scoreB: 0,
            winnerId: null,
          } as Match);
        } else {
          entries.push({
            id: `${r}-${i}`,
            teamA: null,
            teamB: null,
            round: r,
            position: i,
            scoreA: 0,
            scoreB: 0,
            winnerId: null,
          } as Match);
        }
      }
      map[r] = entries;
    }

    const byMatchMap = new Map(currentTournament.matches.map(m => [`${m.round}-${m.position}`, m]));

    function winner(match: Match | undefined): { id: string; name: string } | null {
      if (!match || !match.winnerId) return null;
      return match.winnerId === match.teamA?.id ? match.teamA : match.winnerId === match.teamB?.id ? match.teamB : null;
    }

    for (let r = 2; r <= totalRounds; r++) {
      const parentEntries = map[r - 1];
      for (let i = 0; i < map[r]?.length; i++) {
        if (!map[r]) continue;
        const leftSlot = parentEntries[i * 2];
        const rightSlot = parentEntries[i * 2 + 1];
        const leftMatch = leftSlot ? byMatchMap.get(`${r - 1}-${leftSlot.id.split('-')[1]}`) : undefined;
        const rightMatch = rightSlot ? byMatchMap.get(`${r - 1}-${rightSlot.id.split('-')[1]}`) : undefined;
        const resolvedA = leftMatch ? winner(leftMatch) ?? leftSlot?.teamA : (leftSlot?.teamA ?? null);
        const resolvedB = rightMatch ? winner(rightMatch) ?? rightSlot?.teamB : (rightSlot?.teamB ?? null);
        map[r][i] = {
          ...(leftMatch ?? rightMatch ?? { id: `${r}-${i}`, round: r, position: i, scoreA: 0, scoreB: 0, winnerId: null }),
          teamA: resolvedA,
          teamB: resolvedB,
          round: r,
          position: i,
        } as Match;
      }
    }

    return map;
  }, [currentTournament.matches, currentTournament.capacity, currentTournament.id, teams, totalRounds]);

  const roundNumbers = Array.from({ length: totalRounds }, (_, i) => i + 1);

  const mobileMatches = useMemo(() => {
    if (activeMobileRound === 'all') {
      return roundNumbers.flatMap((r) => rounds[r] ?? []).map((entry, idx) => ({
        ...entry,
        round: Math.floor(idx / (Math.pow(2, Math.max(totalRounds - 1, 1)))) + 1,
        position: idx,
      })) as Match[];
    }
    return rounds[activeMobileRound] ?? [];
  }, [activeMobileRound, rounds, roundNumbers, totalRounds]);

  const setViewWithFeedback = (next: 'default' | 'eagle') => {
    buzz('light');
    setView(next);
  };

  const exportImage = useCallback(async () => {
    setExporting(true);
    try {
      if (!eagleRootRef.current) return;
      const dataUrl = await toPng(eagleRootRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `botolaty-bracket-${currentTournament.name || 'export'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  }, [currentTournament.name]);

  return (
    <div className="max-w-full mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold text-on-surface font-[Sora] tracking-tight">
              {currentTournament.name}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1.5 font-medium">
              {totalRounds} rounds · {teams.length} {t.dashboard.teamsCount}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container/80 p-1 rounded-xl border border-outline-variant/40">
            <span className="px-3.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              {t.bracket.knockout}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container/70 p-1 rounded-xl border border-outline-variant/40">
            <button
              type="button"
              onClick={() => setViewWithFeedback('default')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200
                ${view === 'default' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setViewWithFeedback('eagle')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200
                ${view === 'eagle' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Eagle Eye
            </button>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              buzz('light');
              exportImage();
            }}
            disabled={exporting || view !== 'eagle'}
            className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold
              bg-primary text-white border border-primary shadow-sm
              hover:shadow-md active:scale-[0.98]
              disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE VIEW (< 768px)
          ═══════════════════════════════════════════ */}
      {view === 'default' && (
        <div className="flex md:hidden flex-col gap-5 animate-card-enter">
          <div className="sticky top-[72px] z-30 -mx-4 px-4 py-4 bg-background/90 backdrop-blur-md border-b border-outline-variant/30">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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
          <div className="flex flex-col gap-3">
            {mobileMatches.length === 0 ? (
              <EmptyRoundState t={t} />
            ) : (
              mobileMatches.map((matchEntry, i) => (
                <MatchCard
                  key={`${matchEntry.round ?? 0}-${matchEntry.position ?? i}`}
                  match={matchEntry}
                  isAdmin={isAdmin}
                  index={i}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          DESKTOP VIEW (>= 768px) / DEFAULT
          ═══════════════════════════════════════════ */}
      {view === 'default' && (
        <div className="hidden md:block overflow-x-auto pb-10 animate-card-enter">
          <div className="flex gap-10 items-start min-w-fit">
            {roundNumbers.map((round) => (
              <div key={round} className="flex flex-col gap-4 w-[300px] shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${round === totalRounds ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {getRoundLabel(round, totalRounds, t)}
                  </h3>
                  <span className="text-[11px] text-on-surface-variant/70 font-medium tabular-nums">
                    {rounds[round]?.length ?? 0} matches
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {(rounds[round] ?? []).map((match, index) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isAdmin={isAdmin}
                      index={index}
                    />
                  ))}
                  {(rounds[round] ?? []).length === 0 && <EmptyRoundState t={t} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          EAGLE EYE VIEW
          ═══════════════════════════════════════════ */}
      {view === 'eagle' && (
        <div ref={eagleRootRef} className="md:block overflow-x-auto pb-10 animate-card-enter">
          <div className="min-w-fit rounded-2xl border border-outline-variant/40 bg-surface-container shadow-sm">
            <BracketHeader title="Bracket overview" subtitle="Best viewed horizontally" />
            <div className="p-4 md:p-6">
              <BracketGrid rounds={rounds} roundNumbers={roundNumbers} totalRounds={totalRounds} t={t} />
            </div>
          </div>
        </div>
      )}
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

/* ─── Shared UI ─── */

function TabChip({ active, onClick, label, emerald }: { active: boolean; onClick: () => void; label: string; emerald: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95
        ${active
          ? 'bg-primary/10 text-primary border border-primary/25 shadow-sm shadow-primary/10'
          : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high hover:text-on-surface'}`}
    >
      {label}
    </button>
  );
}

function EmptyRoundState({ t }: { t: any }) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-6 md:p-8 h-[160px] flex flex-col items-center justify-center gap-3 opacity-80">
      <svg className="w-10 h-10 text-outline-variant" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <span className="text-xs text-on-surface-variant font-medium">{t.bracket.awaitingFinalists}</span>
    </div>
  );
}

function BracketHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/30">
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{title}</p>
      <p className="text-[11px] text-on-surface-variant">{subtitle}</p>
    </div>
  );
}

/* ─── Eagle Eye Table ─── */

function BracketGrid({ rounds, roundNumbers, totalRounds, t }: { rounds: Record<number, Match[]>; roundNumbers: number[]; totalRounds: number; t: any }) {
  const teamBadge = (name: string) => (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center border border-primary/20 shrink-0 leading-none">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="truncate text-on-surface text-sm font-medium">{name}</span>
    </span>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 min-w-[56px]">Slot</th>
            {roundNumbers.map((round) => (
              <th key={round} className="px-4 py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 min-w-[180px]">
                {getRoundLabel(round, totalRounds, t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rounds[totalRounds] ?? []).map((match, row) => {
            const rowMatches = roundNumbers.map((round) => {
              const roundMatches = rounds[round] ?? [];
              return roundMatches[row] ?? match;
            });
            return (
              <tr key={match.id} className="border-b border-outline-variant/20 last:border-b-0">
                <td className="px-4 py-4 text-xs font-bold text-on-surface-variant tabular-nums">{row + 1}</td>
                {rowMatches.map((entry, roundIndex) => {
                  const side = roundIndex % 2 === 0 ? entry.teamA : entry.teamB;
                  return (
                    <td key={`${entry.id}-${roundIndex}`} className="px-4 py-4">
                      {side ? teamBadge(side.name) : <span className="text-on-surface-variant/50 text-xs font-medium">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
