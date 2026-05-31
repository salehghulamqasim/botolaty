import { describe, it, expect } from 'vitest';
import { fisherYatesShuffle, generateBracket, calculateStandings, advanceWinner } from '@/lib/bracketEngine';
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
    // 12 teams -> 16 slots -> 4 rounds -> 8+4+2+1 = 15 matches
    expect(matches.length).toBe(15);
  });

  it('should generate 63 matches for 32 teams (single elim)', () => {
    const teams = Array.from({ length: 32 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 32, 'test');
    // 32 teams: 16+8+4+2+1 = 31
    expect(matches.length).toBe(31);
  });

  it('should tag all matches with tournamentId', () => {
    const teams = [makeTeam('A'), makeTeam('B')];
    const matches = generateBracket(teams, 12, 'my-id');
    // But 12 capacity gives 16 slots, 15 matches total
    // R1 matches get teams, later rounds have null teams
    matches.forEach((m) => {
      expect(m.tournamentId).toBe('my-id');
    });
  });

  it('should pad with BYE teams when fewer than capacity', () => {
    const teams = Array.from({ length: 10 }, (_, i) => makeTeam(`Team ${i + 1}`));
    const matches = generateBracket(teams, 12, 'test');
    // 12 capacity -> 16 slots -> 15 matches
    expect(matches.length).toBe(15);
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
  it('should populate next round match with winner', () => {
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
});
