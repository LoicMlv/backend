// apply_validators.mjs — à exécuter avec mongosh
// Usage : mongosh "mongodb://dev:devpassword@localhost:27017/jdr?authSource=admin" --file .\scripts\validators\apply_validators.mjs

const dbj = db.getSiblingDB('jdr'); // mongosh fournit "db"

// ==== Validators (JSON Schema) ====

// parties
const PartyValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","name","lang","mode","ruleSetId","hostUserId","players","mj","status","createdAt","updatedAt","version"],
    properties: {
      _id: { bsonType: "string", description: "ex: party_xxx", pattern: "^party_" },
      name: { bsonType: "string", minLength: 1 },
      lang: { bsonType: "string" },
      mode: { enum: ["strict","relaxed"] },
      ruleSetId: { bsonType: "string" },
      customRules: { bsonType: ["object","null"] },
      hostUserId: { bsonType: "string" },
      players: { bsonType: "array", items: { bsonType: "string" } },
      mj: {
        bsonType: "object",
        required: ["type"],
        properties: {
          type: { enum: ["ai","human"] },
          personaId: { bsonType: ["string","null"] }
        }
      },
      status: { enum: ["preparing","active","paused","ended"] },
      createdAt: { bsonType: "string" },
      updatedAt: { bsonType: "string" },
      version: { bsonType: "int", minimum: 0 }
    },
    additionalProperties: true
  }
};

// sessions
const SessionValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","title","startedAt"],
    properties: {
      _id: { bsonType: "string", pattern: "^sess_" },
      partyId: { bsonType: "string", pattern: "^party_" },
      title: { bsonType: "string", minLength: 1 },
      startedAt: { bsonType: "string" },
      endedAt: { bsonType: ["string","null"] },
      summary: { bsonType: ["string","null"] }
    },
    additionalProperties: true
  }
};

// characters
const CharacterValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","name","concept","level","stats","skills","inventory","money","version","updatedAt"],
    properties: {
      _id: { bsonType: "string", pattern: "^char_" },
      partyId: { bsonType: "string", pattern: "^party_" },
      ownerUserId: { bsonType: ["string","null"] },
      name: { bsonType: "string", minLength: 1 },
      concept: { bsonType: "string", minLength: 1 },
      class: { bsonType: ["string","null"] },
      level: { bsonType: "int", minimum: 1 },
      alignment: { bsonType: ["string","null"] },
      stats: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["name","label","value"],
          properties: {
            name: { bsonType: "string" },
            label: { bsonType: "string" },
            description: { bsonType: "string" },
            value: { bsonType: ["int","double"] },
            min: { bsonType: ["int","double"] },
            max: { bsonType: ["int","double"] }
          },
          additionalProperties: true
        }
      },
      skills: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["name","label","value"],
          properties: {
            name: { bsonType: "string" },
            label: { bsonType: "string" },
            value: { bsonType: ["int","double"] }
          },
          additionalProperties: true
        }
      },
      abilities: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["abilityId","rank","source"],
          properties: {
            abilityId: { bsonType: "string" },
            rank: { bsonType: "int", minimum: 0 },
            source: { enum: ["class","talent","item","other"] }
          },
          additionalProperties: true
        }
      },
      inventory: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["id","name","qty"],
          properties: {
            id: { bsonType: "string" },
            name: { bsonType: "string" },
            qty: { bsonType: "int", minimum: 0 },
            stats: { bsonType: "object" },
            tags: { bsonType: "array", items: { bsonType: "string" } }
          },
          additionalProperties: true
        }
      },
      money: {
        bsonType: "object",
        properties: {
          gold: { bsonType: "int", minimum: 0 },
          silver: { bsonType: "int", minimum: 0 },
          copper: { bsonType: "int", minimum: 0 }
        },
        additionalProperties: false
      },
      modifiers: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["id","source","target","op","value"],
          properties: {
            id: { bsonType: "string" },
            source: { bsonType: "string" },
            target: {
              bsonType: "object",
              required: ["type","match"],
              properties: {
                type: { enum: ["stat","skill","roll","damage","other"] },
                match: { bsonType: "object" }
              }
            },
            op: { enum: ["add","mul","set"] },
            value: { bsonType: ["int","double"] },
            duration: {
              bsonType: "object",
              properties: {
                type: { enum: ["encounter","turns","session","permanent"] },
                turns: { bsonType: "int", minimum: 1 }
              }
            },
            stacking: { enum: ["stackable","unique"] }
          },
          additionalProperties: true
        }
      },
      conditions: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["key"],
          properties: {
            key: { bsonType: "string" },
            severity: { bsonType: "int", minimum: 0 },
            notes: { bsonType: "string" }
          },
          additionalProperties: true
        }
      },
      tags: { bsonType: "array", items: { bsonType: "string" } },
      version: { bsonType: "int", minimum: 0 },
      updatedAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
};

// rulesets
const RuleSetValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","name","engine","schemaVersion","definitions"],
    properties: {
      _id: { bsonType: "string", pattern: "^rules_" },
      name: { bsonType: "string" },
      engine: { bsonType: "string" },
      schemaVersion: { bsonType: "int", minimum: 1 },
      definitions: {
        bsonType: "object",
        required: ["attributes","dice","actions","damageTypes","initiative","difficultyScale"],
        properties: {
          attributes: { bsonType: "array", items: { bsonType: "string" } },
          skills: { bsonType: "array", items: { bsonType: "string" } },
          dice: { bsonType: "array", items: { enum: ["d4","d6","d8","d10","d12","d20","d100"] } },
          actions: { bsonType: "array", items: { enum: ["attack","skill_check","cast","defend","use_item","move"] } },
          damageTypes: { bsonType: "array", items: { bsonType: "string" } },
          initiative: {
            bsonType: "object",
            required: ["type"],
            properties: { type: { bsonType: "string" } }
          },
          difficultyScale: { bsonType: "object" }
        }
      },
      validators: { bsonType: "object" },
      lootTables: { bsonType: "object" }
    },
    additionalProperties: true
  }
};

// events
const EventValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","sessionId","type","causedBy","createdAt"],
    properties: {
      _id: { bsonType: "string", pattern: "^evt_" },
      partyId: { bsonType: "string", pattern: "^party_" },
      sessionId: { bsonType: "string", pattern: "^sess_" },
      type: { enum: ["action.resolved","system","narration","state.patch"] },
      action: {
        bsonType: "object",
        properties: {
          type: { enum: ["attack","skill_check","cast","defend","use_item","move"] },
          actorId: { bsonType: "string" },
          targetId: { bsonType: "string" },
          params: { bsonType: "object" },
          context: { bsonType: "object" }
        }
      },
      result: {
        bsonType: "object",
        properties: {
          hit: { bsonType: "bool" },
          roll: { bsonType: ["int","double"] },
          damage: {
            bsonType: "object",
            properties: {
              amount: { bsonType: ["int","double"] },
              type: { bsonType: "string" }
            }
          }
        }
      },
      appliedState: { bsonType: "object" },
      causedBy: { bsonType: "string" },
      createdAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
};

// snapshots
const SnapshotValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id","partyId","sessionId","indexUntilEventId","state","createdAt"],
    properties: {
      _id: { bsonType: "string", pattern: "^snap_" },
      partyId: { bsonType: "string", pattern: "^party_" },
      sessionId: { bsonType: "string", pattern: "^sess_" },
      indexUntilEventId: { bsonType: "string", pattern: "^evt_" },
      state: { bsonType: "object" },
      createdAt: { bsonType: "string" }
    },
    additionalProperties: true
  }
};

// ==== Helpers ====
function ensureCollection(name) {
  const exists = dbj.getCollectionNames().includes(name);
  if (!exists) {
    print(`> createCollection ${name}`);
    dbj.createCollection(name);
  }
}

function applyValidator(coll, validator) {
  print(`> collMod ${coll}`);
  try {
    dbj.runCommand({
      collMod: coll,
      validator,
      validationLevel: "moderate",
      validationAction: "error"
    });
  } catch (e) {
    if (e.codeName === "NamespaceNotFound") {
      print(`> (missing) createCollection ${coll} with validator`);
      dbj.createCollection(coll, { validator, validationLevel: "moderate", validationAction: "error" });
    } else {
      throw e;
    }
  }
}

// ==== Apply ====
const specs = [
  { coll: "parties",    validator: PartyValidator },
  { coll: "sessions",   validator: SessionValidator },
  { coll: "characters", validator: CharacterValidator },
  { coll: "rulesets",   validator: RuleSetValidator },
  { coll: "events",     validator: EventValidator },
  { coll: "snapshots",  validator: SnapshotValidator }
];

specs.forEach(s => ensureCollection(s.coll));
specs.forEach(s => applyValidator(s.coll, s.validator));

print("> done.");
