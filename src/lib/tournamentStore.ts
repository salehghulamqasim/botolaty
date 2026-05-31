'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Tournament, Team, Match, TeamCapacity, BracketFormat,
  AccessRole, MatchStatus, TournamentLifecycle, TeamProfileStats, TeamMatchRecord,
} from '@/types/tournament';
import { generateBracket, advanceWinner, calculateStandings, uid } from './bracketEngine';

interface TournamentState {
  // ─── Multi-tournament catalog ───
  tournaments: Tournament[];
  activeTournamentId: string | null;

  // ─── Access control ───
  accessRole: AccessRole;
  selectedTeamId: string | null;

  // ─── Computed getters ───
  getActiveTournament: () => Tournament | null;
  getTournamentById: (id: string) => Tournament | undefined;
  getArchivedTournaments: () => Tournament[];
  getActiveTournaments: () => Tournament[];
  getVisibleTournaments: () => Tournament[];
  canViewActiveTournament: () => boolean;

  // ─── Access control actions ───
  setAccessRole: (role: AccessRole) => void;
  setSelectedTeam: (teamId: string | null) => void;

  // ─── Tournament lifecycle ───
  createTournament: (name: string, capacity: TeamCapacity, format: BracketFormat, teamNames: string[]) => Tournament;
  setActiveTournament: (id: string | null) => void;
  updateTournamentStatus: (id: string, lifecycle: TournamentLifecycle) => void;
  deleteTournament: (id: string) => void;
  toggleVisibility: () => void;

  // ─── Match operations ───
  generateBracketForCurrent: (seed?: number) => void;
  updateMatchScore: (matchId: string, scoreA: number, scoreB: number) => void;
  confirmMatchScore: (matchId: string, scoreA: number, scoreB: number) => void;
  setMatchStatus: (matchId: string, status: MatchStatus) => void;

  // ─── Data management ───
  exportAllData: () => string;
  clearAllData: () => void;

  // ─── Standings ───
  getStandings: (tournamentId?: string) => ReturnType<typeof calculateStandings>;

  // ─── Team profiles ───
  getTeamProfile: (teamName: string) => TeamProfileStats;
  getAllTeamNames: () => string[];
}

function makeTeam(name: string, index: number): Team {
  return { id: uid(), name, seed: index + 1 };
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],
      activeTournamentId: null,
      accessRole: 'public' as AccessRole,
      selectedTeamId: null,

      // ─── Computed getters ───

      getActiveTournament: () => {
        const { tournaments, activeTournamentId } = get();
        if (!activeTournamentId) return null;
        return tournaments.find((t) => t.id === activeTournamentId) ?? null;
      },

      getTournamentById: (id) => get().tournaments.find((t) => t.id === id),

      getArchivedTournaments: () => {
        return get().tournaments.filter((t) => t.lifecycle === 'completed');
      },

      getActiveTournaments: () => {
        return get().tournaments.filter((t) => t.lifecycle !== 'completed');
      },

      /** Visibility-filtered: admin sees all; public/team only isPublic + non-draft */
      getVisibleTournaments: () => {
        const { tournaments, accessRole } = get();
        if (accessRole === 'admin') return tournaments;
        return tournaments.filter((t) => t.isPublic && t.lifecycle !== 'draft');
      },

      /** Route guard: returns false if active tournament is hidden from current role */
      canViewActiveTournament: () => {
        const { tournaments, activeTournamentId, accessRole } = get();
        if (accessRole === 'admin') return true;
        if (!activeTournamentId) return true; // no active = nothing to block
        const t = tournaments.find((t) => t.id === activeTournamentId);
        if (!t) return true;
        return t.isPublic && t.lifecycle !== 'draft';
      },

      // ─── Access control ───

      setAccessRole: (role) => set({ accessRole: role }),

      setSelectedTeam: (teamId) => set({ selectedTeamId: teamId }),

      // ─── Tournament lifecycle ───

      createTournament: (name, capacity, format, teamNames) => {
        const teams = teamNames.map((n, i) => makeTeam(n, i));
        const matches = generateBracket(teams, capacity, '', undefined);
        const tournament: Tournament = {
          id: uid(),
          name,
          capacity,
          format,
          isPublic: false,
          adminId: 'local-admin',
          teams,
          matches: matches.map((m) => ({ ...m, tournamentId: '' })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lifecycle: 'active',
        };
        // Fix tournamentId in matches
        tournament.matches = tournament.matches.map((m) => ({
          ...m,
          tournamentId: tournament.id,
        }));

        set((s) => ({
          activeTournamentId: tournament.id,
          tournaments: [...s.tournaments, tournament],
        }));
        return tournament;
      },

      setActiveTournament: (id) => set({ activeTournamentId: id }),

      updateTournamentStatus: (id, lifecycle) => {
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id ? { ...t, lifecycle, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTournament: (id) => {
        set((s) => {
          const nextActive =
            s.activeTournamentId === id
              ? null
              : s.activeTournamentId;
          return {
            tournaments: s.tournaments.filter((t) => t.id !== id),
            activeTournamentId: nextActive,
          };
        });
      },

      toggleVisibility: () => {
        set((s) => {
          const active = s.tournaments.find((t) => t.id === s.activeTournamentId);
          if (!active) return s;
          const updated = { ...active, isPublic: !active.isPublic, updatedAt: new Date().toISOString() };
          return {
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      // ─── Match operations ───

      generateBracketForCurrent: (seed) => {
        const { activeTournamentId, tournaments } = get();
        const current = tournaments.find((t) => t.id === activeTournamentId);
        if (!current) return;
        const matches = generateBracket(current.teams, current.capacity, current.id, seed);
        const updated = { ...current, matches, updatedAt: new Date().toISOString() };
        set((s) => ({
          tournaments: s.tournaments.map((t) => (t.id === current.id ? updated : t)),
        }));
      },

      // Legacy: immediate score update (kept for BYE auto-advance)
      updateMatchScore: (matchId, scoreA, scoreB) => {
        set((s) => {
          const active = s.tournaments.find((t) => t.id === s.activeTournamentId);
          if (!active) return s;

          const matches = active.matches.map((m) => {
            if (m.id !== matchId) return m;
            const winnerId =
              scoreA > scoreB ? m.teamA?.id ?? null
              : scoreB > scoreA ? m.teamB?.id ?? null
              : null;
            return { ...m, scoreA, scoreB, winnerId, status: 'completed' as MatchStatus };
          });

          // Advance winner to next round
          const completed = matches.find((m) => m.id === matchId);
          let advancedMatches = matches;
          if (completed && completed.winnerId) {
            advancedMatches = advanceWinner(matches, completed);
          }

          const updated = {
            ...active,
            matches: advancedMatches,
            updatedAt: new Date().toISOString(),
          };
          return {
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      // New: confirm both scores at once (used by new MatchCard UI)
      confirmMatchScore: (matchId, scoreA, scoreB) => {
        set((s) => {
          const active = s.tournaments.find((t) => t.id === s.activeTournamentId);
          if (!active) return s;

          const matches = active.matches.map((m) => {
            if (m.id !== matchId) return m;
            const winnerId =
              scoreA > scoreB ? m.teamA?.id ?? null
              : scoreB > scoreA ? m.teamB?.id ?? null
              : null;
            return { ...m, scoreA, scoreB, winnerId, status: 'completed' as MatchStatus };
          });

          // Advance winner
          const completed = matches.find((m) => m.id === matchId);
          let advancedMatches = matches;
          if (completed && completed.winnerId) {
            advancedMatches = advanceWinner(matches, completed);
          }

          const updated = {
            ...active,
            matches: advancedMatches,
            updatedAt: new Date().toISOString(),
          };
          return {
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      setMatchStatus: (matchId, status) => {
        set((s) => {
          const active = s.tournaments.find((t) => t.id === s.activeTournamentId);
          if (!active) return s;
          const matches = active.matches.map((m) =>
            m.id === matchId ? { ...m, status } : m
          );
          const updated = { ...active, matches, updatedAt: new Date().toISOString() };
          return {
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      // ─── Data management ───

      exportAllData: () => {
        const { tournaments } = get();
        const payload = {
          exportVersion: '1.0',
          exportedAt: new Date().toISOString(),
          appName: 'Botolaty',
          tournaments,
        };
        return JSON.stringify(payload, null, 2);
      },

      clearAllData: () => {
        set({ tournaments: [], activeTournamentId: null, selectedTeamId: null });
        // Also clear localStorage directly to be safe
        if (typeof window !== 'undefined') {
          localStorage.removeItem('botolaty-store');
        }
      },

      // ─── Standings ───

      getStandings: (tournamentId) => {
        const { tournaments, activeTournamentId } = get();
        const id = tournamentId ?? activeTournamentId;
        if (!id) return [];
        const t = tournaments.find((t) => t.id === id);
        if (!t) return [];
        return calculateStandings(t.teams, t.matches);
      },

      // ─── Team profiles ───

      getTeamProfile: (teamName) => {
        const { tournaments } = get();
        const stats: TeamProfileStats = {
          teamName,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          tournamentsPlayed: 0,
          matchHistory: [],
        };

        tournaments.forEach((t) => {
          let playedInThis = false;
          t.matches
            .filter((m) => m.status === 'completed' && m.scoreA !== null && m.scoreB !== null)
            .forEach((m) => {
              const isA = m.teamA?.name === teamName;
              const isB = m.teamB?.name === teamName;
              if (!isA && !isB) return;

              playedInThis = true;
              const opponent = isA ? (m.teamB?.name ?? 'Unknown') : (m.teamA?.name ?? 'Unknown');
              const scoreFor = isA ? m.scoreA! : m.scoreB!;
              const scoreAgainst = isA ? m.scoreB! : m.scoreA!;
              const result =
                scoreFor > scoreAgainst ? 'win' as const
                : scoreFor < scoreAgainst ? 'loss' as const
                : 'draw' as const;

              if (result === 'win') stats.totalWins++;
              else if (result === 'loss') stats.totalLosses++;
              else stats.totalDraws++;

              stats.matchHistory.push({
                tournamentId: t.id,
                tournamentName: t.name,
                round: m.round,
                opponentName: opponent,
                scoreFor,
                scoreAgainst,
                result,
                date: t.updatedAt,
              });
            });

          if (playedInThis) stats.tournamentsPlayed++;
        });

        // Sort match history newest first
        stats.matchHistory.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return stats;
      },

      getAllTeamNames: () => {
        const names = new Set<string>();
        get().tournaments.forEach((t) => {
          t.teams.forEach((team) => {
            if (!team.id.startsWith('bye-')) names.add(team.name);
          });
        });
        return Array.from(names).sort();
      },
    }),
    {
      name: 'botolaty-store',
      // Migrate old data
      version: 2,
      migrate: (persisted: any, version) => {
        if (version === 1) {
          // v1 → v2: Add 'lifecycle' field, remove 'status'
          const old = persisted as any;
          if (old.tournaments) {
            old.tournaments = old.tournaments.map((t: any) => ({
              ...t,
              lifecycle: t.status ?? t.lifecycle ?? 'active',
            }));
          }
          if (old.viewMode !== undefined) {
            old.accessRole = old.viewMode;
          }
        }
        return persisted as TournamentState;
      },
    }
  )
);
