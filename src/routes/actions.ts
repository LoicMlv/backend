import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { roll } from "../domain/dice.js";
import { ObjectId } from "mongodb";

export const actions = Router();

actions.post("/parties/:partyId/actions", async (req, res) => {
  try {
    const partyId = req.params.partyId;
    const { type, actorId, targetId, params, sessionId, causedBy } = req.body ?? {};

    // 1) Récupère l'utilisateur depuis le header (prioritaire sur le body)
    const headerUser = req.header("x-user-id"); // string | undefined
    const caused =
      (headerUser && headerUser.trim()) ||
      (typeof causedBy === "string" ? causedBy : undefined) ||
      "mj_ai";

    if (!type || !actorId || !sessionId) {
      return res.status(400).json({
        error: { code: "bad_request", message: "type, actorId et sessionId sont requis" }
      });
    }
    if (!ObjectId.isValid(partyId) || !ObjectId.isValid(sessionId) || !ObjectId.isValid(actorId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "partyId/sessionId/actorId invalid ObjectId" } });
    }
    if (targetId && !ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: { code: "bad_request", message: "targetId invalid ObjectId" } });
    }

    // MVP rules …
    let result: any = {};
    const stateChanges: any[] = [];
    const rolls: any[] = [];

    if (type === "attack") {
      const r = roll("1d20+5");
      rolls.push({ expr: "1d20+5", total: r.total, parts: r.parts });
      const hit = r.total >= 12;
      result.hit = hit;
      if (hit) {
        const dmg = roll("1d8+2");
        rolls.push({ expr: "1d8+2", total: dmg.total, parts: dmg.parts });
        result.damage = { amount: dmg.total, type: "slashing" };
        if (targetId) stateChanges.push({ type: "hp.update", entityId: targetId, delta: -dmg.total });
      }
    } else if (type === "skill_check") {
      const r = roll("1d20+3");
      rolls.push({ expr: "1d20+3", total: r.total, parts: r.parts });
      result.success = r.total >= (params?.dc ?? 10);
    } else {
      return res.status(400).json({ error: { code: "unsupported_action" } });
    }

    const eventDoc = {
      _id: new ObjectId(),
      partyId: new ObjectId(partyId),
      sessionId: new ObjectId(sessionId),
      type: "action.resolved" as const,
      action: {
        type,
        actorId: new ObjectId(actorId),
        targetId: targetId ? new ObjectId(targetId) : undefined,
        params
      },
      result,
      stateChanges,
      rolls,
      // 2) Utilise la valeur finalisée
      causedBy: caused,
      createdAt: new Date().toISOString()
    };

    await getDb().collection("events").insertOne(eventDoc);

    return res.status(201).json({
      eventId: eventDoc._id.toString(),
      result,
      stateChanges,
      rolls
    });
  } catch (e: any) {
    console.error("action failed:", e);
    return res.status(500).json({ error: { code: "internal_error", message: String(e?.message || e) } });
  }
});

