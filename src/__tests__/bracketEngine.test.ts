import { describe, it, expect } from 'vitest';
import {
  fisherYatesShuffle, generateBracket, calculateStandings,
  advanceWinner, uid, isByeTeam,
} from '@/lib/bracketEngine';
import { Team, Match } from '@/types/tournament';

function makeTeam(name: string): Team {
  return { id: name.toLowerCase(), name, seed: 1 };
}

function makeBYE(index: number): Team {
  return { id: `bye-${index}`, name: 'BYE' };
}

describe('fisherYatesShuffle', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = fisherYatesShuffle(input);
    expect(result).toHaveLength(5);
  });

  it('should contain all original elements', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = fisherYatesShuffle(input);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should be deterministic with a seed', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result1 = fisherYatesShuffle(input, 42);
    const result2 = fisherYatesShuffle(input, 42);
    expect(result1).toEqual(result2);
  });

  it('should not mutate the original array', () => {
    const input = [1, 2, 3, 4];
    const copy = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(copy);
  });
});

describe('generateBracket', () => {
  it('should generate correct number of matches for 12 teams', () => {
    const teams = Array.from({ length: 12 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 12, 'test-tournament');
    // 12 teams -> 16 slots -> 4 rounds -> 8+4+2+1 = 15 matches
    expect(matches.length).toBe(15);
  });

  it('should generate 31 matches for 32 teams (single elim)', () => {
    const teams = Array.from({ length: 32 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 32, 'test');
    expect(matches.length).toBe(31);
  });

  it('should tag all matches with tournamentId', () => {
    const teams = [makeTeam('A'), makeTeam('B')];
    const matches = generateBracket(teams, 12, 'my-id');
    matches.forEach((m) => {
      expect(m.tournamentId).toBe('my-id');
    });
  });

  it('should pad with BYE teams when fewer than capacity', () => {
    const teams = Array.from({ length: 10 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 12, 'test');
    expect(matches.length).toBe(15);
  });

  it('BYE teams should have bye- id prefix', () => {
    const teams = Array.from({ length: 10 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 12, 'test');
    const r1 = matches.filter((m) => m.round === 1);
    const hasBYE = r1.some(
      (m) => isByeTeam(m.teamA) || isByeTeam(m.teamB)
    );
    expect(hasBYE).toBe(true);
  });

  // ─── NEW: BYE allocation tests ───

  it('should NEVER pair BYE against BYE in Round 1 (when N >= matches/2)', () => {
    // For capacity=12 → 16 slots → 8 matches. Need at least 8 real teams
    // to avoid BYE-vs-BYE (which is mathematically unavoidable below that)
    for (const count of [8, 9, 10, 11, 12]) {
      const teams = Array.from({ length: count }, (_, i) => makeTeam(`T${i}`));
      const matches = generateBracket(teams, 12, 'test', count);
      const r1 = matches.filter((m) => m.round === 1);
      for (const m of r1) {
        const bothBye = isByeTeam(m.teamA) && isByeTeam(m.teamB);
        expect(bothBye).toBe(false);
      }
    }
  });

  it('should auto-complete BYE matches (status=completed, score=3-0)', () => {
    const teams = Array.from({ length: 10 }, (_, i) => makeTeam(`T${i}`));
    const matches = generateBracket(teams, 12, 'test', 99);
    const r1 = matches.filter((m) => m.round === 1);
    const byeMatches = r1.filter(
      (m) => isByeTeam(m.teamA) || isByeTeam(m.teamB)
    );
    expect(byeMatches.length).toBeGreaterThan(0);
    for (const m of byeMatches) {
      expect(m.status).toBe('completed');
      expect(m.winnerId).not.toBeNull();
      // The real team gets 3, BYE gets 0 — determine which is which
      const realIsA = !isByeTeam(m.teamA);
      if (realIsA) {
        expect(m.scoreA).toBe(3);
        expect(m.scoreB).toBe(0);
        expect(m.winnerId).toBe(m.teamA?.id);
      } else {
        expect(m.scoreA).toBe(0);
        expect(m.scoreB).toBe(3);
        expect(m.winnerId).toBe(m.teamB?.id);
      }
    }
  });

  it('should advance BYE winners to next round automatically', () => {
    const teams = Array.from({ length: 10 }, (_, i) => makeTeam(`T${i}`));
    const matches = generateBracket(teams, 12, 'test', 42);
    const r2 = matches.filter((m) => m.round === 2);
    // At least some Round 2 slots should already have teams populated
    const populatedR2 = r2.filter((m) => m.teamA !== null || m.teamB !== null);
    expect(populatedR2.length).toBeGreaterThan(0);
  });

  it('should handle full 32-team bracket (no BYEs)', () => {
    // Only 32-team capacity matches bracket slots exactly — no BYE padding
    const teams = Array.from({ length: 32 }, (_, i) => makeTeam(`T${i}`));
    const matches = generateBracket(teams, 32, 'test', 1);
    const r1 = matches.filter((m) => m.round === 1);
    const hasBYE = r1.some(
      (m) => isByeTeam(m.teamA) || isByeTeam(m.teamB)
    );
    expect(hasBYE).toBe(false);
    for (const m of r1) {
      expect(m.status).toBe('upcoming');
    }
  });
});

describe('calculateStandings', () => {
  it('should return 0 points for teams with no completed matches', () => {
    const teams = [makeTeam('Alpha'), makeTeam('Beta')];
    const standings = calculateStandings(teams, []);
    expect(standings[0].points).toBe(0);
    expect(standings[1].points).toBe(0);
  });

  it('should award 3 points for a win', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const match: Match = {
      id: 'm1', round: 1, position: 0,
      teamA, teamB, scoreA: 3, scoreB: 1,
      status: 'completed', winnerId: teamA.id, tournamentId: 't1',
    };
    const standings = calculateStandings([teamA, teamB], [match]);
    const alpha = standings.find((s) => s.teamId === teamA.id)!;
    const beta = standings.find((s) => s.teamId === teamB.id)!;
    expect(alpha.points).toBe(3);
    expect(beta.points).toBe(0);
  });

  it('should award 1 point each for a draw', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const match: Match = {
      id: 'm1', round: 1, position: 0,
      teamA, teamB, scoreA: 2, scoreB: 2,
      status: 'completed', winnerId: null, tournamentId: 't1',
    };
    const standings = calculateStandings([teamA, teamB], [match]);
    expect(standings[0].points).toBe(1);
    expect(standings[1].points).toBe(1);
  });

  it('should sort by points descending', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const match: Match = {
      id: 'm1', round: 1, position: 0,
      teamA, teamB, scoreA: 2, scoreB: 0,
      status: 'completed', winnerId: teamA.id, tournamentId: 't1',
    };
    const standings = calculateStandings([teamA, teamB], [match]);
    expect(standings[0].teamId).toBe(teamA.id);
  });

  // ─── NEW: BYE exclusion ───

  it('should exclude BYE teams from standings', () => {
    const teamA = makeTeam('Alpha');
    const byeTeam = makeBYE(0);
    const match: Match = {
      id: 'm1', round: 1, position: 0,
      teamA, teamB: byeTeam, scoreA: 3, scoreB: 0,
      status: 'completed', winnerId: teamA.id, tournamentId: 't1',
    };
    const standings = calculateStandings([teamA, byeTeam], [match]);
    // Only Alpha should appear, not BYE
    expect(standings.length).toBe(1);
    expect(standings[0].teamId).toBe(teamA.id);
  });

  it('should not count BYE-vs-real matches in standings', () => {
    const alpha = makeTeam('Alpha');
    const beta = makeTeam('Beta');
    const byeA = makeBYE(0);
    const byeB = makeBYE(1);

    // Real vs real
    const realMatch: Match = {
      id: 'm1', round: 1, position: 0,
      teamA: alpha, teamB: beta, scoreA: 2, scoreB: 1,
      status: 'completed', winnerId: alpha.id, tournamentId: 't1',
    };
    // Real vs BYE (should be excluded)
    const byeMatch: Match = {
      id: 'm2', round: 1, position: 1,
      teamA: makeTeam('Gamma'), teamB: byeA, scoreA: 3, scoreB: 0,
      status: 'completed', winnerId: 'gamma', tournamentId: 't1',
    };

    const allTeams = [alpha, beta, makeTeam('Gamma'), byeA, byeB];
    const standings = calculateStandings(allTeams, [realMatch, byeMatch]);

    // Should only include Alpha, Beta, Gamma (3 teams, not 5)
    const realNames = standings.map((s) => s.teamName);
    expect(realNames).toContain('Alpha');
    expect(realNames).toContain('Beta');
    expect(realNames).toContain('Gamma');
    expect(realNames).not.toContain('BYE');
    expect(standings.length).toBe(3);
  });
});

describe('advanceWinner', () => {
  it('should populate next round match with winner (Team A wins)', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const r1Match: Match = {
      id: 'r1m1', round: 1, position: 0,
      teamA, teamB, scoreA: 3, scoreB: 1,
      status: 'completed', winnerId: teamA.id, tournamentId: 't1',
    };
    const r2Match: Match = {
      id: 'r2m1', round: 2, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };

    const result = advanceWinner([r1Match, r2Match], r1Match);
    const updated = result.find((m) => m.id === 'r2m1')!;
    expect(updated.teamA?.id).toBe(teamA.id);
  });

  it('should populate next round match with winner (Team B wins)', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const r1Match: Match = {
      id: 'r1m1', round: 1, position: 1,
      teamA, teamB, scoreA: 0, scoreB: 4,
      status: 'completed', winnerId: teamB.id, tournamentId: 't1',
    };
    const r2Match: Match = {
      id: 'r2m1', round: 2, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };

    const result = advanceWinner([r1Match, r2Match], r1Match);
    const updated = result.find((m) => m.id === 'r2m1')!;
    expect(updated.teamB?.id).toBe(teamB.id);
  });

  it('should NOT advance if match is not completed', () => {
    const teamA = makeTeam('Alpha');
    const teamB = makeTeam('Beta');
    const r1Match: Match = {
      id: 'r1m1', round: 1, position: 0,
      teamA, teamB, scoreA: 2, scoreB: 1,
      status: 'live', winnerId: null, tournamentId: 't1',
    };
    const r2Match: Match = {
      id: 'r2m1', round: 2, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };

    const result = advanceWinner([r1Match, r2Match], r1Match);
    const updated = result.find((m) => m.id === 'r2m1')!;
    expect(updated.teamA).toBeNull();
  });

  it('should correctly route odd-position winners to Team B slot', () => {
    const teamA = makeTeam('X');
    const teamB = makeTeam('Y');
    const r1Match: Match = {
      id: 'r1m2', round: 1, position: 1,
      teamA, teamB, scoreA: 1, scoreB: 3,
      status: 'completed', winnerId: teamB.id, tournamentId: 't1',
    };
    const r2Match: Match = {
      id: 'r2m1', round: 2, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };

    const result = advanceWinner([r1Match, r2Match], r1Match);
    const updated = result.find((m) => m.id === 'r2m1')!;
    expect(updated.teamB?.id).toBe(teamB.id);
  });

  it('should update standings after multi-round advancement chain', () => {
    const teams = [
      makeTeam('Alpha'), makeTeam('Beta'),
      makeTeam('Gamma'), makeTeam('Delta'),
    ];
    const r1m1: Match = {
      id: 'r1m1', round: 1, position: 0,
      teamA: teams[0], teamB: teams[1], scoreA: 2, scoreB: 1,
      status: 'completed', winnerId: teams[0].id, tournamentId: 't1',
    };
    const r1m2: Match = {
      id: 'r1m2', round: 1, position: 1,
      teamA: teams[2], teamB: teams[3], scoreA: 0, scoreB: 3,
      status: 'completed', winnerId: teams[3].id, tournamentId: 't1',
    };
    const r2m1: Match = {
      id: 'r2m1', round: 2, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };
    const final: Match = {
      id: 'fin', round: 3, position: 0,
      teamA: null, teamB: null, scoreA: null, scoreB: null,
      status: 'upcoming', winnerId: null, tournamentId: 't1',
    };

    let matches = advanceWinner([r1m1, r1m2, r2m1, final], r1m1);
    let updatedR2 = matches.find((m) => m.id === 'r2m1')!;
    expect(updatedR2.teamA?.id).toBe(teams[0].id);

    matches = advanceWinner(matches, matches.find((m) => m.id === 'r1m2')!);
    updatedR2 = matches.find((m) => m.id === 'r2m1')!;
    expect(updatedR2.teamB?.id).toBe(teams[3].id);

    const standings = calculateStandings(teams, matches);
    const alpha = standings.find((s) => s.teamId === 'alpha')!;
    const delta = standings.find((s) => s.teamId === 'delta')!;
    expect(alpha.points).toBe(3);
    expect(delta.points).toBe(3);
  });
});

describe('isByeTeam', () => {
  it('should detect BYE teams', () => {
    expect(isByeTeam({ id: 'bye-0', name: 'BYE' })).toBe(true);
    expect(isByeTeam({ id: 'bye-99', name: 'BYE' })).toBe(true);
    expect(isByeTeam({ id: 'real-1', name: 'Real' })).toBe(false);
    expect(isByeTeam(null)).toBe(false);
  });
});

describe('uid', () => {
  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });
});
