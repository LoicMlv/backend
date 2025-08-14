// create_indexes.js
const dbj = db.getSiblingDB('jdr');

dbj.parties.createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
dbj.characters.createIndex({ partyId: 1 });
dbj.sessions.createIndex({ partyId: 1, startedAt: -1 });
dbj.events.createIndex({ partyId: 1, createdAt: 1 });
dbj.snapshots.createIndex({ partyId: 1, createdAt: 1 });

print("> indexes created");
