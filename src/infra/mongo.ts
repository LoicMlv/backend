import { MongoClient, Db } from "mongodb";

let db: Db | null = null;

export async function connectMongo(mongoUrl: string) {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db("jdr");
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Mongo not connected");
  return db;
}
