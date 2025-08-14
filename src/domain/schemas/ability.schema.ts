import { z } from "zod";

export const AbilityRequirementZ = z.object({
  type: z.enum(["level","stat","class","tag","other"]),
  min: z.number().optional(),
  stat: z.string().optional(),
  class: z.string().optional(),
  tag: z.string().optional(),
});

export const AbilityCostZ = z.object({
  type: z.enum(["slot","mana","item","cooldown"]),
  school: z.string().optional(),
  level: z.number().optional(),
  amount: z.number().optional(),
});

export const AbilityResolutionZ = z.object({
  save: z
    .object({
      type: z.string(), // ex "DEX"
      dc: z.string(),   // ex "10 + proficiency + INT_mod"
    })
    .optional(),
  damage: z
    .object({
      expr: z.string(), // "8d6"
      onSave: z.enum(["half","none"]).optional(),
      type: z.string().optional(), // "fire"
    })
    .optional(),
});

export const AbilityActionZ = z.object({
  type: z.enum(["cast","use","attack","other"]).default("cast"),
  targeting: z
    .object({
      shape: z.enum(["single","line","cone","sphere","cube"]).default("single"),
      radius: z.number().optional(),
      range: z.number().optional(),
    })
    .partial()
    .optional(),
  resolution: AbilityResolutionZ.optional(),
});

export const AbilityZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["spell","power","feat","item","other"]).default("spell"),
  ruleSetId: z.string().min(1),
  requirements: z.array(AbilityRequirementZ).default([]),
  cost: z.array(AbilityCostZ).default([]),
  action: AbilityActionZ,
  text: z.string().optional(),
});

export type Ability = z.infer<typeof AbilityZ>;
