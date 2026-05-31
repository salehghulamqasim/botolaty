import { Team, Match, MatchStatus, TeamCapacity } from '@/types/tournament';

/**
 * Fisher-Yates (Knuth) shuffle — deterministic when seeded, random otherwise.
 * Pure, in-place O(n). Returns a new array.
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
 * Round up to the next power of two.
 */
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Create a BYE placeholder team.
 */
function makeBYE(index: number): Team {
  return { id: `bye-${index}`, name: 'BYE' };
}

/**
 * Generate a full single-elimination bracket from a list of teams.
 *
 * BYE ALLOCATION RULES:
 *  - Real teams are shuffled with Fisher-Yates.
 *  - Real teams fill teamA slots first, then teamB slots.
 *  - BYE placeholders only occupy teamB positions (never teamA).
 *  - This guarantees BYE is NEVER paired against another BYE
 *    (unless there are fewer real teams than half the matches,
 *     e.g. 2 teams in a 32-slot bracket — edge case handled).
 *  - All BYE matches are auto-completed (3-0) and winners advanced.
 */
export function generateBracket(
  teams: Team[],
  capacity: TeamCapacity,
  tournamentId: string,
  seed?: number
): Match[] {
  const shuffled = fisherYatesShuffle(teams, seed);
  const bracketSlots = nextPowerOfTwo(capacity);
  const numMatches = bracketSlots / 2;
  const totalRounds = Math.log2(bracketSlots);
  const realCount = shuffled.length;

  const matches: Match[] = [];
  let byeIdx = 0;
  let position = 0;

  // ─── Two-pass BYE allocation ───
  // Pass 1: determine how many real teams go to teamA vs teamB
  // This guarantees real teams fill teamA first, then teamB.
  // BYEs are only ever teamB (unless N < M, unavoidable degenerate case).
  const realForA = Math.min(realCount, numMatches);
  const realForB = Math.max(0, realCount - numMatches);
  const byeForA = numMatches - realForA;
  const byeForB = numMatches - realForB;

  // Build teamA array: realForA real teams, then byeForA BYE placeholders
  const allTeamA: Team[] = [];
  let ri = 0;
  for (let i = 0; i < realForA; i++) allTeamA.push(shuffled[ri++]);
  for (let i = 0; i < byeForA; i++) allTeamA.push(makeBYE(byeIdx++));

  // Build teamB array: realForB remaining real teams, then byeForB BYE placeholders
  const allTeamB: Team[] = [];
  for (let i = 0; i < realForB; i++) allTeamB.push(shuffled[ri++]);
  for (let i = 0; i < byeForB; i++) allTeamB.push(makeBYE(byeIdx++));

  // Pair them: allTeamA[i] vs allTeamB[i]
  for (let i = 0; i < numMatches; i++) {
    const teamA = allTeamA[i];
    const teamB = allTeamB[i];
    const isByeMatch = isByeTeam(teamA) || isByeTeam(teamB);
    const winnerId = isByeMatch
      ? (isByeTeam(teamA) ? teamB.id : teamA.id)
      : null;

    matches.push({
      id: uid(),
      round: 1,
      position: position++,
      teamA,
      teamB,
      scoreA: isByeMatch ? (isByeTeam(teamA) ? 0 : 3) : null,
      scoreB: isByeMatch ? (isByeTeam(teamB) ? 0 : 3) : null,
      status: (isByeMatch ? 'completed' : 'upcoming') as MatchStatus,
      winnerId,
      tournamentId,
    });
  }

  // ─── Future rounds: placeholder matches ───
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

  // ─── Auto-advance all completed Round 1 matches ───
  let advanced = matches;
  const completedR1 = matches.filter(
    (m) => m.round === 1 && m.status === 'completed' && m.winnerId
  );
  for (const cm of completedR1) {
    advanced = advanceWinner(advanced, cm);
  }

  return advanced;
}

/**
 * Check if a team is a BYE placeholder.
 */
export function isByeTeam(team: Team | null): boolean {
  return !!(team && team.id.startsWith('bye-'));
}

/**
 * Advance winner to next round.
 */
export function advanceWinner(
  matches: Match[],
  completedMatch: Match
): Match[] {
  if (
    completedMatch.status !== 'completed' ||
    !completedMatch.winnerId
  ) {
    return matches;
  }

  const nextRound = completedMatch.round + 1;
  const nextPosition = Math.floor(completedMatch.position / 2);
  const winner =
    (completedMatch.scoreA ?? 0) > (completedMatch.scoreB ?? 0)
      ? completedMatch.teamA
      : completedMatch.teamB;

  if (!winner) return matches;

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

  teams.forEach((t) => {
    if (!isByeTeam(t)) {
      map.set(t.id, { played: 0, wins: 0, draws: 0, losses: 0 });
    }
  });

  matches
    .filter(
      (m) =>
        m.status === 'completed' &&
        m.scoreA !== null &&
        m.scoreB !== null &&
        m.teamA &&
        m.teamB &&
        !isByeTeam(m.teamA) &&
        !isByeTeam(m.teamB)
    )
    .forEach((m) => {
      const a = map.get(m.teamA!.id);
      const b = map.get(m.teamB!.id);
      if (!a || !b) return;
      a.played++;
      b.played++;

      if (m.scoreA! > m.scoreB!) {
        a.wins++;
        b.losses++;
      } else if (m.scoreB! > m.scoreA!) {
        b.wins++;
        a.losses++;
      } else {
        a.draws++;
        b.draws++;
      }
    });

  return teams
    .filter((t) => !isByeTeam(t))
    .map((t) => {
      const s = map.get(t.id);
      if (!s) return null;
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
    .filter((entry): entry is { teamId: string; teamName: string; played: number; wins: number; draws: number; losses: number; points: number } => entry !== null)
    .sort((a, b) => b.points - a.points || b.wins - a.wins);
}

/**
 * Get round labels based on tournament capacity.
 */
export function getRoundLabels(capacity: TeamCapacity): string[] {
  switch (capacity) {
    case 32:
      return ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
    case 24:
      return ['Round of 24', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
    case 12:
      return ['Round of 12', 'Quarter-Finals', 'Semi-Finals', 'Finals'];
  }
}

export { uid };
