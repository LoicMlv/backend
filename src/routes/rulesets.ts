import { Router } from "express";
import { getDb } from "../infra/mongo.js";
import { ObjectId } from "mongodb";

export const rulesets = Router();

// List rulesets (for selection)
rulesets.get("/rulesets", async (_req, res) => {
  const list = await getDb().collection("rulesets").find({}).project({ name: 1, engine: 1 }).toArray();
  res.json(list);
});

// Get ruleset by id
rulesets.get("/rulesets/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // si stocké avec ObjectId :
    // const doc = await getDb().collection("rulesets").findOne({ _id: new ObjectId(id) });
    // si stocké avec string id style "rules_d20_v1", remplace par:
    const doc = await getDb().collection("rulesets").findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: { code: "not_found" } });
    res.json(doc);
  } catch (e: any) {
    res.status(400).json({ error: { code: "bad_request", message: e.message } });
  }
});

// Create ruleset (admin/dev only in MVP)
rulesets.post("/rulesets", async (req, res) => {
  try {
    const body = req.body ?? {};
    // stocker en string id (ex: "rules_d20_v1")
    const _id = body.id ?? `rules_${Date.now()}`;
    const doc = { _id, ...body, id: undefined };
    await getDb().collection("rulesets").insertOne(doc);
    res.status(201).json({ id: _id });
  } catch (e: any) {
    res.status(400).json({ error: { code: "bad_request", message: e.message } });
  }
});
