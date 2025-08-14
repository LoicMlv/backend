import { z } from "zod";

export const StatZ = z.object({
  name: z.string(),
  label: z.string(),
  description: z.string().optional(),
  value: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const SkillZ = z.object({
  name: z.string(),
  label: z.string(),
  value: z.number(),
});

export const InventoryItemZ = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number().int().nonnegative(),
  stats: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export const MoneyZ = z.object({
  gold: z.number().int().nonnegative().optional(),
  silver: z.number().int().nonnegative().optional(),
  copper: z.number().int().nonnegative().optional(),
});

export const ConditionZ = z.object({
  key: z.string(),
  severity: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const CharacterZ = z.object({
  _id: z.any(), // ObjectId (on laisse any côté Zod, géré par Mongo driver)
  partyId: z.any(), // ObjectId en base
  ownerUserId: z.string().nullable().optional(),
  name: z.string().min(1),
  concept: z.string().min(1),
  class: z.string().nullable().optional(),
  level: z.number().int().min(1),
  alignment: z.string().nullable().optional(),
  stats: z.array(StatZ).min(1),
  skills: z.array(SkillZ).default([]),
  inventory: z.array(InventoryItemZ).default([]),
  money: MoneyZ.default({ gold: 0, silver: 0, copper: 0 }),
  modifiers: z.array(z.any()).default([]),
  conditions: z.array(ConditionZ).default([]),
  tags: z.array(z.string()).default([]),
  version: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

// 👉 payload reçu du client (strings) ; le serveur convertit partyId en ObjectId et génère _id/updatedAt/version
export const CharacterCreateZ = z.object({
  // partyId vient de l'URL, on n’en attend pas dans le body
  ownerUserId: z.string().nullable().optional(),
  name: z.string().min(1),
  concept: z.string().min(1),
  class: z.string().nullable().optional(),
  level: z.number().int().min(1).default(1),
  alignment: z.string().nullable().optional(),
  stats: z.array(StatZ).min(1),
  skills: z.array(SkillZ).default([]),
  inventory: z.array(InventoryItemZ).default([]),
  money: MoneyZ.default({ gold: 0, silver: 0, copper: 0 }),
  modifiers: z.array(z.any()).default([]),
  conditions: z.array(ConditionZ).default([]),
  tags: z.array(z.string()).default([]),
});
export type CharacterCreate = z.infer<typeof CharacterCreateZ>;
