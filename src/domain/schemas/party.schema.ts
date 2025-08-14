import { z } from "zod";

export const PartyModeZ = z.enum(["strict", "relaxed"]);
export const PartyStatusZ = z.enum(["preparing", "active", "paused", "ended"]);
export const PartyDifficultyZ = z.enum(["easy", "medium", "hard"]);

export const PartyMjZ = z.object({
  type: z.enum(["ai", "human"]),
  personaId: z.string().nullable().optional(),
});

// Schéma complet (lecture depuis la base)
export const PartyZ = z.object({
  _id: z.any(), // ObjectId
  name: z.string(),
  lang: z.string().default("fr"),
  mode: PartyModeZ,
  ruleSetId: z.string(),
  customRules: z.record(z.string(), z.unknown()).nullable().optional(),
  hostUserId: z.string(),
  players: z.array(z.string()),
  mj: PartyMjZ,
  difficulty: PartyDifficultyZ,
  status: PartyStatusZ.default("preparing"),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int().nonnegative(),
});

// Schéma création (payload client)
export const PartyCreateZ = z.object({
  name: z.string().min(1),
  lang: z.string().default("fr"),
  mode: PartyModeZ,
  ruleSetId: z.string().min(1),
  customRules: z.record(z.string(), z.unknown()).nullable().optional(),
  hostUserId: z.string().min(1),
  mj: PartyMjZ,
  difficulty: PartyDifficultyZ,
});
