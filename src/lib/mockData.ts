import { Tournament, Team, Match } from '@/types/tournament';

const LS_KEY = 'botolaty_tournaments';

export function loadTournaments(): Tournament[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments: Tournament[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(tournaments));
}

export function getTournament(id: string): Tournament | undefined {
  return loadTournaments().find((t) => t.id === id);
}

export function saveTournament(tournament: Tournament): void {
  const tournaments = loadTournaments().filter((t) => t.id !== tournament.id);
  tournaments.push(tournament);
  saveTournaments(tournaments);
}

export function deleteTournament(id: string): void {
  saveTournaments(loadTournaments().filter((t) => t.id !== id));
}
