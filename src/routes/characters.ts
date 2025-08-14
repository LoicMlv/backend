import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";
import { CharacterCreateZ } from "../domain/schemas/character.schema.js";
import { randomUUID } from "crypto"; // si jamais tu veux des ids items, etc.

export const characters = Router();

// Create character
characters.post("/parties/:partyId/characters", async (req, res) => {
  try {
    const partyId = req.params.partyId;
    if (!ObjectId.isValid(partyId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "invalid partyId" } });
    }

    const parsed = CharacterCreateZ.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const doc = {
      _id: new ObjectId(),
      partyId: new ObjectId(partyId),
      ...parsed.data,
      version: 0,
      updatedAt: now,
    };

    await getDb().collection("characters").insertOne(doc);
    return res.status(201).json({ id: doc._id.toString() });
  } catch (e: any) {
    console.error("create character failed:", e);
    return res.status(500).json({ error: { code: "db_error", message: e.message } });
  }
});
