// ──── Core Domain Types ────

export type Language = 'en' | 'ar';
export type ViewMode = 'admin' | 'spectator';
export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type BracketFormat = 'single' | 'double';
export type TeamCapacity = 12 | 24 | 32;

export interface Team {
  id: string;
  name: string;
  seed?: number;
}

export interface MatchScore {
  teamA: number;
  teamB: number;
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
  status: 'draft' | 'active' | 'completed';
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

export type RoundLabel = 'Finals' | 'Semi-Finals' | 'Quarter-Finals' | 'Round of 16' | 'Round of 32';
