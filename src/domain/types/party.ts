import type { ObjectId } from "mongodb";

// src/domain/types/party.ts
export type PartyDoc = {
    _id: ObjectId;
    name: string;
    lang: string;
    mode: "strict" | "relaxed";
    ruleSetId: string;
    customRules?: Record<string, unknown> | null;
    hostUserId: string;
    players: string[];                // <- important
    mj: { type: "ai" | "human"; personaId?: string | null };
    difficulty: "easy" | "medium" | "hard";
    status: "preparing" | "active" | "paused" | "ended";
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  