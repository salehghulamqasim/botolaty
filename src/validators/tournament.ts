import { z } from 'zod';

export const teamCapacitySchema = z.union([z.literal(12), z.literal(24), z.literal(32)]);

export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50),
  seed: z.number().optional(),
});

export const matchScoreSchema = z.object({
  teamA: z.number().int().min(0),
  teamB: z.number().int().min(0),
});

export const tournamentCreateSchema = z.object({
  name: z.string().min(3, 'Tournament name is required').max(100),
  capacity: teamCapacitySchema,
  format: z.enum(['single', 'double']).default('single'),
  teams: z.array(z.string().min(2)).min(2, 'At least 2 teams required'),
});

export const matchUpdateSchema = z.object({
  matchId: z.string(),
  scoreA: z.number().int().min(0),
  scoreB: z.number().int().min(0),
  status: z.enum(['upcoming', 'live', 'completed']),
});

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>;
export type MatchUpdateInput = z.infer<typeof matchUpdateSchema>;
