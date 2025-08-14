import { z } from "zod";

export const ActionBaseZ = z.object({
  type: z.enum(["attack","skill_check","cast","defend","use_item","move"]),
  actorId: z.string().min(1),
  targetId: z.string().min(1).optional(),
  params: z.record(z.string(), z.unknown()).nullable().optional(),
  context: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const DamageZ = z.object({
  amount: z.number(),
  type: z.string(), // "slashing", ...
});

export const EventResultZ = z.object({
  hit: z.boolean().optional(),
  roll: z.number().optional(),
  damage: DamageZ.optional(),
});

export const EventZ = z.object({
  id: z.string().min(1),
  partyId: z.string().min(1),
  sessionId: z.string().min(1),
  type: z.enum(["action.resolved","system","narration","state.patch"]),
  action: ActionBaseZ.optional(),
  result: EventResultZ.optional(),
  appliedState: z.record(z.string(), z.unknown()).nullable().optional(), // ex { targetHP: 3 }
  causedBy: z.string().min(1), // user id ou "mj_ai"
  createdAt: z.string().datetime(),
});

export type GameEvent = z.infer<typeof EventZ>;
