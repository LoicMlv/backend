import { ObjectId } from "mongodb";

export function oid(id: string): ObjectId {
  if (!ObjectId.isValid(id)) throw new Error("invalid_object_id");
  return new ObjectId(id);
}
