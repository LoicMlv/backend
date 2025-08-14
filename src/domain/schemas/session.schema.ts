import { z } from "zod";

// Schéma complet (lecture)
export const SessionZ = z.object({
  _id: z.any(), // ObjectId
  partyId: z.any(), // ObjectId
  title: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
});

// Schéma création (payload client)
export const SessionCreateZ = z.object({
  title: z.string().min(1),
});
