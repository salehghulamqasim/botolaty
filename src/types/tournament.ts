// ──── Core Domain Types ────

export type Language = 'en' | 'ar';

/** RBAC: three-tier access control */
export type AccessRole = 'admin' | 'public' | 'team';

export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type BracketFormat = 'single' | 'double';
export type TeamCapacity = 12 | 24 | 32;

/** Tournament lifecycle */
export type TournamentLifecycle = 'draft' | 'active' | 'completed';

export interface Team {
  id: string;
  name: string;
  seed?: number;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  teamA: Team | null;
  teamB: Team | null;
  scoreA: number | null;
  scoreB: number | null;
  status: MatchStatus;
  winnerId: string | null;
  tournamentId: string;
}

export interface Tournament {
  id: string;
  name: string;
  capacity: TeamCapacity;
  format: BracketFormat;
  isPublic: boolean;
  adminId: string;
  teams: Team[];
  matches: Match[];
  createdAt: string;
  updatedAt: string;
  lifecycle: TournamentLifecycle;
}

export interface StandingsEntry {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

/** Aggregated team stats across all tournaments */
export interface TeamProfileStats {
  teamName: string;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  tournamentsPlayed: number;
  matchHistory: TeamMatchRecord[];
}

export interface TeamMatchRecord {
  tournamentId: string;
  tournamentName: string;
  round: number;
  opponentName: string;
  scoreFor: number;
  scoreAgainst: number;
  result: 'win' | 'loss' | 'draw';
  date: string;
}

export type RoundLabel = 'Finals' | 'Semi-Finals' | 'Quarter-Finals' | 'Round of 16' | 'Round of 32';

/** For the SearchBar */
export interface SearchResult {
  type: 'tournament' | 'team';
  id: string;
  label: string;
  subtitle: string;
}
