import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";

export const events = Router();

// List events by party (optionnel: sessionId, pagination by createdAt, limit)
events.get("/parties/:partyId/events", async (req, res) => {
  try {
    const partyId = req.params.partyId;
    const sessionId = req.query.sessionId as string | undefined;
    const since = req.query.since as string | undefined; // ISO date
    const limit = Math.min(Number(req.query.limit ?? 50), 200);

    const filter: any = { partyId: new ObjectId(partyId) };
    if (sessionId) filter.sessionId = new ObjectId(sessionId);
    if (since) filter.createdAt = { $gt: since };

    const list = await getDb()
      .collection("events")
      .find(filter)
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();

    res.json(list);
  } catch (e: any) {
    res.status(400).json({ error: { code: "bad_request", message: e.message } });
  }
});
