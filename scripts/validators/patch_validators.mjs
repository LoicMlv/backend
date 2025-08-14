// patch_objectid.mjs
// Usage:
// mongosh "mongodb://dev:devpassword@localhost:27017/jdr?authSource=admin" --file .\scripts\validators\patch_objectid.mjs

const dbj = db.getSiblingDB('jdr');

function mod(coll, validator) {
  print(`> collMod ${coll}`);
  dbj.runCommand({
    collMod: coll,
    validator,
    validationLevel: "moderate",
    validationAction: "error"
  });
}

// parties: _id -> objectId
mod("parties", {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","name","lang","mode","ruleSetId","hostUserId","players","mj","status","createdAt","updatedAt","version","difficulty"],
    properties: {
      _id: { bsonType: "objectId" },
      name: { bsonType: "string" },
      lang: { bsonType: "string" },
      mode: { enum: ["strict","relaxed"] },
      ruleSetId: { bsonType: "string" },
      customRules: { bsonType: ["object","null"] },
      hostUserId: { bsonType: "string" },
      players: { bsonType: "array", items: { bsonType: "string" } },
      mj: { bsonType: "object", required: ["type"], properties: { type: { enum:["ai","human"] }, personaId: { bsonType: ["string","null"] } } },
      difficulty: { enum: ["easy","medium","hard"] },
      status: { enum: ["preparing","active","paused","ended"] },
      createdAt: { bsonType: "string" },
      updatedAt: { bsonType: "string" },
      version: { bsonType: "int", minimum: 0 }
    },
    additionalProperties: true
  }
});

// sessions: _id, partyId -> objectId
mod("sessions", {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","title","startedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      partyId: { bsonType: "objectId" },
      title: { bsonType: "string" },
      startedAt: { bsonType: "string" },
      endedAt: { bsonType: ["string","null"] },
      summary: { bsonType: ["string","null"] }
    },
    additionalProperties: true
  }
});

// characters: _id, partyId -> objectId
mod("characters", {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","name","concept","level","stats","skills","inventory","money","version","updatedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      partyId: { bsonType: "objectId" },
      ownerUserId: { bsonType: ["string","null"] },
      name: { bsonType: "string" },
      concept: { bsonType: "string" },
      class: { bsonType: ["string","null"] },
      level: { bsonType: "int", minimum: 1 },
      alignment: { bsonType: ["string","null"] },
      stats: { bsonType: "array", items: { bsonType: "object" } },
      skills:{ bsonType: "array", items: { bsonType: "object" } },
      abilities:{ bsonType: "array", items: { bsonType: "object" } },
      inventory:{ bsonType: "array", items: { bsonType: "object" } },
      money: { bsonType: "object" },
      modifiers:{ bsonType: "array", items: { bsonType: "object" } },
      conditions:{ bsonType: "array", items: { bsonType: "object" } },
      tags: { bsonType: "array", items: { bsonType: "string" } },
      version: { bsonType: "int", minimum: 0 },
      updatedAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
});

// events: _id, partyId, sessionId -> objectId
mod("events", {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","sessionId","type","causedBy","createdAt"],
    properties: {
      _id: { bsonType: "objectId" },
      partyId: { bsonType: "objectId" },
      sessionId: { bsonType: "objectId" },
      type: { enum: ["action.resolved","system","narration","state.patch"] },
      action: { bsonType: "object" },
      result: { bsonType: "object" },
      appliedState: { bsonType: "object" },
      rolls: { bsonType: "array" },
      causedBy: { bsonType: "string" },
      createdAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
});

// snapshots: _id, partyId, sessionId -> objectId
mod("snapshots", {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","sessionId","indexUntilEventId","state","createdAt"],
    properties: {
      _id: { bsonType: "objectId" },
      partyId: { bsonType: "objectId" },
      sessionId: { bsonType: "objectId" },
      indexUntilEventId: { bsonType: "string" }, // event id en string? (on laisse comme ça si tu stockes l'id sous forme string)
      state: { bsonType: "object" },
      createdAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
});

// rulesets: on laisse _id string style "rules_d20_v1"
print("> validators patched for ObjectId.");
