import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";
import { z } from "zod";

export const sessions = Router();

// Zod schema simple
const SessionCreateZ = z.object({
  title: z.string().min(1).default("Session"),
});
const SessionEndZ = z.object({
  summary: z.string().nullable().optional(),
});

// Create session for a party
sessions.post("/parties/:partyId/sessions", async (req, res) => {
  try {
    const { partyId } = req.params;
    if (!ObjectId.isValid(partyId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid partyId" } });
    }

    const parsed = SessionCreateZ.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const doc = {
      _id: new ObjectId(),
      partyId: new ObjectId(partyId),
      title: parsed.data.title,
      startedAt: now,
      endedAt: null,
      summary: null,
    };

    await getDb().collection("sessions").insertOne(doc);
    return res.status(201).json({ id: doc._id.toString() });
  } catch (e: any) {
    console.error("create session failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});

// End a session (set endedAt + optional summary)
sessions.patch("/sessions/:sessionId/end", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid sessionId" } });
    }

    const parsed = SessionEndZ.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const endedAt = new Date().toISOString();
    const r = await getDb().collection("sessions").findOneAndUpdate(
      { _id: new ObjectId(sessionId) },
      { $set: { endedAt, summary: parsed.data.summary ?? null } },
      { returnDocument: "after" }
    );

    if (!r?.value) {
      return res.status(404).json({ error: { code: "not_found" } });
    }

    return res.json({
      id: r.value._id.toString(),
      endedAt: r.value.endedAt,
      summary: r.value.summary,
    });
  } catch (e: any) {
    console.error("end session failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});

// List sessions for a party
sessions.get("/parties/:partyId/sessions", async (req, res) => {
  try {
    const { partyId } = req.params;
    if (!ObjectId.isValid(partyId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid partyId" } });
    }

    const list = await getDb()
      .collection("sessions")
      .find({ partyId: new ObjectId(partyId) })
      .sort({ startedAt: -1 })
      .toArray();

    return res.json(list);
  } catch (e: any) {
    console.error("list sessions failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});
