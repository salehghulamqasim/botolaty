import { describe, it, expect } from 'vitest';
import {
  fisherYatesShuffle, generateBracket, calculateStandings, advanceWinner, uid,
} from '@/lib/bracketEngine';
import { Team, Match } from '@/types/tournament';

function makeTeam(name: string): Team {
  return { id: name.toLowerCase(), name, seed: 1 };
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
    expect(matches.length).toBe(15);
  });

  it('should generate 63 matches for 32 teams (single elim)', () => {
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
    const hasBYE = r1.some((m) =>
      (m.teamA?.id.startsWith('bye-')) || (m.teamB?.id.startsWith('bye-'))
    );
    expect(hasBYE).toBe(true);
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
    expect(updated.teamB).toBeNull();
  });

  it('should correctly route odd-position winners to Team B slot', () => {
    const teamA = makeTeam('X');
    const teamB = makeTeam('Y');
    // Position 1 → odd → winner goes to Team B in next round, position 0
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

  it('should update standings after match completion and advancement', () => {
    const teams = [makeTeam('Alpha'), makeTeam('Beta'), makeTeam('Gamma'), makeTeam('Delta')];
    // Simulate a 4-team bracket: 2 R1 matches, 1 R2 match, 1 R3 final
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

    // Advance r1m1
    let matches = advanceWinner([r1m1, r1m2, r2m1, final], r1m1);
    let updatedR2 = matches.find((m) => m.id === 'r2m1')!;
    expect(updatedR2.teamA?.id).toBe(teams[0].id);

    // Advance r1m2
    matches = advanceWinner(matches, matches.find((m) => m.id === 'r1m2')!);
    updatedR2 = matches.find((m) => m.id === 'r2m1')!;
    expect(updatedR2.teamB?.id).toBe(teams[3].id);

    // Standings should reflect completed matches
    const standings = calculateStandings(teams, matches);
    const alpha = standings.find((s) => s.teamId === 'alpha')!;
    const delta = standings.find((s) => s.teamId === 'delta')!;
    expect(alpha.points).toBe(3);
    expect(delta.points).toBe(3);
  });
});

describe('uid', () => {
  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });
});
