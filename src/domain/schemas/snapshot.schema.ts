import { z } from "zod";

export const SnapshotZ = z.object({
  id: z.string().min(1),
  partyId: z.string().min(1),
  sessionId: z.string().min(1),
  indexUntilEventId: z.string().min(1),
  state: z.record(z.string(), z.unknown()), // { characters: [...], initiative: [...], scene: {...} }
  createdAt: z.string().datetime(),
});

export type Snapshot = z.infer<typeof SnapshotZ>;
