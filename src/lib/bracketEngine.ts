import { Team, Match, MatchStatus, TeamCapacity, BracketFormat } from '@/types/tournament';

/**
 * Fisher-Yates (Knuth) shuffle — deterministic when seeded, random otherwise.
 * Pure, in-place O(n). Returns the same array reference.
 */
export function fisherYatesShuffle<T>(arr: T[], seed?: number): T[] {
  const result = [...arr];
  let rand: () => number;
  
  if (seed !== undefined) {
    // Seeded PRNG (mulberry32)
    let s = seed | 0;
    rand = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  } else {
    rand = Math.random;
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a unique ID (crypto-quality when available, fallback otherwise).
 */
function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Get round labels based on tournament capacity.
 */
export function getRoundLabels(capacity: TeamCapacity): string[] {
  switch (capacity) {
    case 32: return ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
    case 24: return ['Round of 24', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
    case 12: return ['Round of 12', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
  }
}

/**
 * Generate a full single-elimination bracket from a list of teams.
 * Teams are shuffled using Fisher-Yates then paired.
 */
export function generateBracket(
  teams: Team[],
  capacity: TeamCapacity,
  tournamentId: string,
  seed?: number
): Match[] {
  const shuffled = fisherYatesShuffle(teams, seed);
  // Round capacity up to next power of 2 for bracket math
  const bracketSlots = nextPowerOfTwo(capacity);
  const totalRounds = Math.log2(bracketSlots);
  const padded = padTeams(shuffled, bracketSlots);
  const matches: Match[] = [];
  let position = 0;

  // Round 1: pair adjacent teams
  for (let i = 0; i < padded.length; i += 2) {
    matches.push({
      id: uid(),
      round: 1,
      position: position++,
      teamA: padded[i],
      teamB: padded[i + 1] || null,
      scoreA: null,
      scoreB: null,
      status: 'upcoming' as MatchStatus,
      winnerId: null,
      tournamentId,
    });
  }

  // Future rounds: placeholder matches
  for (let round = 2; round <= totalRounds; round++) {
    const slots = Math.pow(2, totalRounds - round);
    for (let pos = 0; pos < slots; pos++) {
      matches.push({
        id: uid(),
        round,
        position: pos,
        teamA: null,
        teamB: null,
        scoreA: null,
        scoreB: null,
        status: 'upcoming' as MatchStatus,
        winnerId: null,
        tournamentId,
      });
    }
  }

  return matches;
}

/**
 * Pad teams array with BYE entries to match capacity.
 */
function padTeams(teams: Team[], capacity: number): Team[] {
  const padded = [...teams];
  const byesNeeded = capacity - padded.length;
  for (let i = 0; i < byesNeeded; i++) {
    padded.push({ id: `bye-${i}`, name: 'BYE' });
  }
  return padded.slice(0, capacity);
}

/**
 * Round up to the next power of two.
 */
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Advance winner to next round.
 */
export function advanceWinner(
  matches: Match[],
  completedMatch: Match
): Match[] {
  if (completedMatch.status !== 'completed' || !completedMatch.winnerId) {
    return matches;
  }

  const nextRound = completedMatch.round + 1;
  const nextPosition = Math.floor(completedMatch.position / 2);
  const winner = completedMatch.scoreA! > completedMatch.scoreB!
    ? completedMatch.teamA
    : completedMatch.teamB;

  return matches.map((m) => {
    if (m.round === nextRound && m.position === nextPosition) {
      const isTeamASlot = completedMatch.position % 2 === 0;
      return {
        ...m,
        [isTeamASlot ? 'teamA' : 'teamB']: winner,
      };
    }
    return m;
  });
}

/**
 * Calculate standings from completed matches.
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[]
) {
  const map = new Map<string, { played: number; wins: number; draws: number; losses: number }>();

  teams.forEach((t) => map.set(t.id, { played: 0, wins: 0, draws: 0, losses: 0 }));

  matches
    .filter((m) => m.status === 'completed' && m.scoreA !== null && m.scoreB !== null)
    .forEach((m) => {
      const a = map.get(m.teamA!.id)!;
      const b = map.get(m.teamB!.id)!;
      a.played++;
      b.played++;

      if (m.scoreA! > m.scoreB!) { a.wins++; b.losses++; }
      else if (m.scoreB! > m.scoreA!) { b.wins++; a.losses++; }
      else { a.draws++; b.draws++; }
    });

  return teams
    .map((t) => {
      const s = map.get(t.id)!;
      return {
        teamId: t.id,
        teamName: t.name,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        points: s.wins * 3 + s.draws,
      };
    })
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export { uid };
