import { Router } from "express";
import { getDb } from "../infra/mongo.js";

export const health = Router();

health.get("/health", async (_req, res) => {
  const ping = await getDb().command({ ping: 1 });
  res.json({ ok: true, mongo: ping.ok === 1 });
});
