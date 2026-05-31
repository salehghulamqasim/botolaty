'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tournament, Team, Match, TeamCapacity, BracketFormat, ViewMode, MatchStatus } from '@/types/tournament';
import { generateBracket, advanceWinner, calculateStandings, uid } from './bracketEngine';

interface TournamentState {
  // Current tournament
  currentTournament: Tournament | null;
  tournaments: Tournament[];
  
  // UI state
  viewMode: ViewMode;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  
  createTournament: (name: string, capacity: TeamCapacity, format: BracketFormat, teamNames: string[]) => Tournament;
  loadTournament: (id: string) => Tournament | undefined;
  deleteTournament: (id: string) => void;
  
  generateBracketForCurrent: (seed?: number) => void;
  
  updateMatchScore: (matchId: string, scoreA: number, scoreB: number) => void;
  setMatchStatus: (matchId: string, status: MatchStatus) => void;
  
  toggleVisibility: () => void;
  
  getStandings: () => ReturnType<typeof calculateStandings>;
}

function makeTeam(name: string, index: number): Team {
  return { id: uid(), name, seed: index + 1 };
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      currentTournament: null,
      tournaments: [],
      viewMode: 'admin',

      setViewMode: (mode) => set({ viewMode: mode }),

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
          status: 'active',
        };
        // Fix tournamentId in matches
        tournament.matches = tournament.matches.map((m) => ({
          ...m,
          tournamentId: tournament.id,
        }));

        set((s) => ({
          currentTournament: tournament,
          tournaments: [...s.tournaments, tournament],
        }));
        return tournament;
      },

      loadTournament: (id) => {
        const t = get().tournaments.find((t) => t.id === id);
        if (t) set({ currentTournament: t });
        return t;
      },

      deleteTournament: (id) => {
        set((s) => ({
          tournaments: s.tournaments.filter((t) => t.id !== id),
          currentTournament: s.currentTournament?.id === id ? null : s.currentTournament,
        }));
      },

      generateBracketForCurrent: (seed) => {
        const current = get().currentTournament;
        if (!current) return;
        const matches = generateBracket(current.teams, current.capacity, current.id, seed);
        const updated = {
          ...current,
          matches,
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          currentTournament: updated,
          tournaments: s.tournaments.map((t) => (t.id === current.id ? updated : t)),
        }));
      },

      updateMatchScore: (matchId, scoreA, scoreB) => {
        set((s) => {
          if (!s.currentTournament) return s;
          const matches = s.currentTournament.matches.map((m) => {
            if (m.id !== matchId) return m;
            const winnerId = scoreA > scoreB ? m.teamA?.id ?? null : scoreB > scoreA ? m.teamB?.id ?? null : null;
            return { ...m, scoreA, scoreB, winnerId, status: 'completed' as MatchStatus };
          });
          
          // Advance winners
          const completed = matches.find((m) => m.id === matchId);
          let advancedMatches = matches;
          if (completed) {
            advancedMatches = advanceWinner(matches, completed);
          }

          const updated = { ...s.currentTournament, matches: advancedMatches, updatedAt: new Date().toISOString() };
          return {
            currentTournament: updated,
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      setMatchStatus: (matchId, status) => {
        set((s) => {
          if (!s.currentTournament) return s;
          const matches = s.currentTournament.matches.map((m) =>
            m.id === matchId ? { ...m, status } : m
          );
          const updated = { ...s.currentTournament, matches, updatedAt: new Date().toISOString() };
          return {
            currentTournament: updated,
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      toggleVisibility: () => {
        set((s) => {
          if (!s.currentTournament) return s;
          const updated = { ...s.currentTournament, isPublic: !s.currentTournament.isPublic };
          return {
            currentTournament: updated,
            tournaments: s.tournaments.map((t) => (t.id === updated.id ? updated : t)),
          };
        });
      },

      getStandings: () => {
        const current = get().currentTournament;
        if (!current) return [];
        return calculateStandings(current.teams, current.matches);
      },
    }),
    {
      name: 'botolaty-store',
    }
  )
);
