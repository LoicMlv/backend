import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const snapshots = Router();

const SnapshotCreateZ = z.object({
  indexUntilEventId: z.string().min(1),
  state: z.record(z.any()),
});

snapshots.post("/parties/:partyId/sessions/:sessionId/snapshots", async (req, res) => {
  try {
    const { partyId, sessionId } = req.params;
    if (!ObjectId.isValid(partyId) || !ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid partyId/sessionId" } });
    }

    const parsed = SnapshotCreateZ.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const doc = {
      _id: new ObjectId(),
      partyId: new ObjectId(partyId),
      sessionId: new ObjectId(sessionId),
      indexUntilEventId: parsed.data.indexUntilEventId,
      state: parsed.data.state,
      createdAt: new Date().toISOString(),
    };

    await getDb().collection("snapshots").insertOne(doc);

    return res.status(201).json({ id: doc._id.toString() });
  } catch (e: any) {
    console.error("create snapshot failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});

// Get latest snapshot
snapshots.get("/parties/:partyId/sessions/:sessionId/snapshots/latest", async (req, res) => {
  try {
    const { partyId, sessionId } = req.params;
    if (!ObjectId.isValid(partyId) || !ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid partyId/sessionId" } });
    }

    const doc = await getDb()
      .collection("snapshots")
      .find({ partyId: new ObjectId(partyId), sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (!doc.length) {
      return res.status(404).json({ error: { code: "not_found" } });
    }

    return res.json(doc[0]);
  } catch (e: any) {
    console.error("get latest snapshot failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});
