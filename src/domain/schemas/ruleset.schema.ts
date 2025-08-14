import { z } from "zod";

export const RuleSetDefinitionsZ = z.object({
  attributes: z.array(z.string()),
  skills: z.array(z.string()).optional(),
  dice: z.array(z.enum(["d4","d6","d8","d10","d12","d20","d100"])),
  actions: z.array(z.enum(["attack","skill_check","cast","defend","use_item","move"])),
  damageTypes: z.array(z.string()),
  initiative: z.object({ type: z.string().min(1) }), // ex: "d20+DEX"
  difficultyScale: z.record(z.string(), z.number()), // ex: { easy:10, medium:15, hard:20 }
});

export const RuleSetValidatorsZ = z.record(
    z.string(), // type de clé
    z.object({
      required: z.array(z.string()).default([]),
    })
  )
  

export const RuleSetZ = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  engine: z.string().min(1), // ex: "d20"
  schemaVersion: z.number().int().min(1),
  definitions: RuleSetDefinitionsZ,
  validators: RuleSetValidatorsZ.default({}),
  lootTables: z
  .record(
    z.string(), // clé du record
    z.array(
      z.record(z.string(), z.unknown()) // chaque élément du tableau est un objet dynamique
    )
  )
  .default({}),

});

export type RuleSet = z.infer<typeof RuleSetZ>;
