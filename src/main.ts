import express from "express";

import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectMongo } from "./infra/mongo.js";
import { health } from "./routes/health.js";
import { parties } from "./routes/parties.js";
import { partiesExtras } from "./routes/parties.extra.js";
import { characters } from "./routes/characters.js";
import { actions } from "./routes/actions.js";
import { sessions } from "./routes/sessions.js";
import { events } from "./routes/events.js";
import { snapshots } from "./routes/snapshots.js";
import { rulesets } from "./routes/rulesets.js";
// (optionnel) import { dice } from "./routes/dice.js";

dotenv.config();
const PORT = Number(process.env.PORT || 4000);
const ALLOW_ORIGIN = "*"; // ou '*' si tu veux tout ouvrir (à éviter en prod)
// const ALLOW_ORIGIN = ['http://localhost:4200']; // ou '*' si tu veux tout ouvrir (à éviter en prod)


async function start() {
  await connectMongo(process.env.MONGO_URL!);

  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(",") || ["*"] }));
  app.use(express.json({ limit: "2mb" }));

  app.use(health);
  app.use("/v1", parties);
  app.use("/v1", partiesExtras);
  app.use("/v1", characters);
  app.use("/v1", actions);
  app.use("/v1", sessions);
  app.use("/v1", events);
  app.use("/v1", snapshots);
  app.use("/v1", rulesets);
  // app.use("/v1", dice);

  // ... tes app.use(...) existants

  // middleware d'erreur global (diagnostic)
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: { code: "internal_error", message: String(err?.message || err) } });
  });

  // dans main.ts
  app.use(cors({
    origin: ALLOW_ORIGIN,
    allowedHeaders: ["Content-Type", "X-User-Id"], // ← important pour le header custom
  }));


  app.listen(PORT, () => console.log(`[backend] listening on :${PORT}`));
}

start().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
