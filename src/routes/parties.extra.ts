import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId, type UpdateFilter } from "mongodb";
import type { PartyDoc } from "../domain/types/party.js";

export const partiesExtras = Router();

const partiesCol = () => getDb().collection<PartyDoc>("parties");

// JOIN
partiesExtras.post("/parties/:partyId/join", async (req, res) => {
  try {
    const partyId = req.params.partyId;
    const userId = String(req.body?.userId ?? "");
    if (!userId) return res.status(400).json({ error: { code: "bad_request", message: "userId required" } });

    const r = await partiesCol().updateOne(
      { _id: new ObjectId(partyId) },
      {
        $addToSet: { players: userId },                         // OK typé
        $set: { updatedAt: new Date().toISOString() },
        $inc: { version: 1 },
      } satisfies UpdateFilter<PartyDoc>
    );

    if (r.matchedCount === 0) return res.status(404).json({ error: { code: "not_found" } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: { code: "bad_request", message: e.message } });
  }
});

// LEAVE
partiesExtras.post("/parties/:partyId/leave", async (req, res) => {
  try {
    const partyId = req.params.partyId;
    const userId = String(req.body?.userId ?? "");
    if (!userId) return res.status(400).json({ error: { code: "bad_request", message: "userId required" } });

    const r = await partiesCol().updateOne(
      { _id: new ObjectId(partyId) },
      {
        $pull: { players: userId },                             // OK typé
        $set: { updatedAt: new Date().toISOString() },
        $inc: { version: 1 },
      } satisfies UpdateFilter<PartyDoc>
    );

    if (r.matchedCount === 0) return res.status(404).json({ error: { code: "not_found" } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: { code: "bad_request", message: e.message } });
  }
});
