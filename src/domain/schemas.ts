import { z } from "zod";

export const StatZ = z.object({
  name: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
  value: z.number(),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional()
});

export const SkillZ = z.object({
  label: z.string(),
  value: z.number()
});

export const InventoryItemZ = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number().min(0),
  stats: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional()
});

export const CharacterZ = z.object({
  _id: z.string().optional(),
  partyId: z.string(),
  ownerUserId: z.string().nullable().optional(),
  name: z.string().min(1),
  level: z.number().int().min(1),
  stats: z.array(StatZ).min(1),
  skills: z.array(SkillZ).default([]),
  inventory: z.array(InventoryItemZ).default([]),
  abilities: z.array(z.any()).default([]),
  conditions: z.array(z.any()).default([]),
  tags: z.array(z.string()).default([]),
  version: z.number().int().nonnegative().default(0)
});
export type Character = z.infer<typeof CharacterZ>;

export const PartyCreateZ = z.object({
  name: z.string(),
  lang: z.string().default("fr"),
  mode: z.enum(["strict", "relaxed"]).default("strict"),
  ruleSetId: z.string().optional(),
  difficulty: z.enum(["easy", "normal", "hard"]).default("normal")
});
