import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";
import { PartyCreateZ } from "../domain/schemas/party.schema.js";

export const parties = Router();

// Create party
parties.post("/parties", async (req, res) => {
  try {
    const parsed = PartyCreateZ.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const now = new Date().toISOString();

    const doc = {
      _id: new ObjectId(),
      ...parsed.data,
      players: [parsed.data.hostUserId],
      status: "preparing",
      createdAt: now,
      updatedAt: now,
      version: 0,
    };

    await getDb().collection("parties").insertOne(doc);

    return res.status(201).json({ id: doc._id.toString() });
  } catch (e: any) {
    console.error("create party failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});

// Get party
parties.get("/parties/:partyId", async (req, res) => {
  try {
    const { partyId } = req.params;
    if (!ObjectId.isValid(partyId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "Invalid partyId" } });
    }

    const doc = await getDb()
      .collection("parties")
      .findOne({ _id: new ObjectId(partyId) });

    if (!doc) {
      return res.status(404).json({ error: { code: "not_found" } });
    }

    return res.json(doc);
  } catch (e: any) {
    console.error("get party failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});
