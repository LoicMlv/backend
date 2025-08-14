# tests/jalonA.ps1
# Smoke test Jalon A : Party -> Session -> Character -> Action -> Events -> Snapshot

$ErrorActionPreference = "Stop"

function Print-Title($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Require-Status($resp, $code) {
  if ($resp.StatusCode -ne $code) {
    throw "HTTP $($resp.StatusCode) reçu, attendu $code. Contenu: $($resp.Content)"
  }
}

# -------- Config --------
$baseUrl = "http://localhost:4000/v1"
$headers = @{ "Content-Type" = "application/json" }

# -------- 0) Health --------
Print-Title "0) Health"
try {
  $h = Invoke-WebRequest -Uri ($baseUrl.Replace('/v1','') + "/health") -Method GET
  Require-Status $h 200
  Write-Host $h.Content
} catch {
  Write-Error "Le backend n'est pas up sur :4000 ou /health ne répond pas. $_"
  exit 1
}

# -------- 1) Create Party --------
Print-Title "1) Create Party"
$partyBody = @{
  name = "Partie Test"
  lang = "fr"
  mode = "strict"               # strict|relaxed
  ruleSetId = "rules_d20_v1"    # adapte selon ta base
  hostUserId = "u_host"
  mj = @{ type = "ai" }         # personaId optionnel
  difficulty = "medium"         # easy|medium|hard
} | ConvertTo-Json

$partyResp = Invoke-WebRequest -Uri "$baseUrl/parties" -Method POST -Headers $headers -Body $partyBody
Require-Status $partyResp 201
$partyJson = $partyResp.Content | ConvertFrom-Json
$partyId = $partyJson.id
Write-Host "partyId =" $partyId

# -------- 2) Create Session --------
Print-Title "2) Create Session"
$sessionBody = @{ title = "Session 1 - Test" } | ConvertTo-Json
$sessionResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/sessions" -Method POST -Headers $headers -Body $sessionBody
Require-Status $sessionResp 201
$sessionJson = $sessionResp.Content | ConvertFrom-Json
$sessionId = $sessionJson.id
Write-Host "sessionId =" $sessionId

# -------- 3) Create Character --------
Print-Title "3) Create Character"
$charBody = @{
  name = "Alfred"
  concept = "Rôdeur pragmatique"
  level = 2
  # partyId injecté server-side depuis l'URL par ta route
  stats = @(
    @{ name="Force";   label="FOR"; value=12 },
    @{ name="Dex";     label="DEX"; value=16 },
    @{ name="HP";      label="HP";  value=18; max=18 }
  )
  skills = @(
    @{ name="Discrétion"; label="STE"; value=3 }
  )
  inventory = @(
    @{ id="itm_sword"; name="Épée courte"; qty=1; stats=@{ dmg="1d6" } }
  )
  money = @{ gold = 12 }
  conditions = @()
  tags = @("niveau_2")
} | ConvertTo-Json -Depth 10

$charResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/characters" -Method POST -Headers $headers -Body $charBody
Require-Status $charResp 201
$charJson = $charResp.Content | ConvertFrom-Json
$charId = $charJson.id
Write-Host "characterId =" $charId

# -------- 4) Post Action (attack) --------
Write-Host "`n=== 4) Post Action (attack) ===" -ForegroundColor Cyan

$actionBody = @{
  type = "attack"
  actorId = $charId          # l'ID renvoyé par la création du perso (ObjectId string)
  targetId = $charId         # pour le test, on se cible soi-même, c'est juste pour passer le validator (tu mettras un vrai mob plus tard)
  sessionId = $sessionId     # OBLIGATOIRE maintenant
  causedBy = "u_host"
  params = @{ weaponId = "itm_sword" }
} | ConvertTo-Json

$actionResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/actions" -Method POST -Headers $headers -Body $actionBody
Require-Status $actionResp 201
$actionJson = $actionResp.Content | ConvertFrom-Json
$eventId = $actionJson.eventId
Write-Host "eventId =" $eventId

# -------- 5) List Events --------
Print-Title "5) List Events"
$eventsResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/events?sessionId=$sessionId&limit=20" -Method GET
Require-Status $eventsResp 200
$eventsJson = $eventsResp.Content | ConvertFrom-Json
Write-Host ("events count = " + $eventsJson.Count)
# Optionnel: afficher le dernier
if ($eventsJson.Count -gt 0) {
  $last = $eventsJson[$eventsJson.Count-1]
  Write-Host "last event type=" $last.type "createdAt=" $last.createdAt
}

# -------- 6) Create Snapshot --------
Print-Title "6) Create Snapshot"
$snapBody = @{
  indexUntilEventId = $eventId
  state = @{
    characters = @(@{ id=$charId; hp=18; note="demo" })
    initiative = @()
    scene = @{ name = "Cour de la taverne" }
  }
} | ConvertTo-Json -Depth 10

$snapResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/sessions/$sessionId/snapshots" -Method POST -Headers $headers -Body $snapBody
Require-Status $snapResp 201
$snapJson = $snapResp.Content | ConvertFrom-Json
$snapshotId = $snapJson.id
Write-Host "snapshotId =" $snapshotId

# -------- 7) Get Latest Snapshot --------
Print-Title "7) Get Latest Snapshot"
$latestResp = Invoke-WebRequest -Uri "$baseUrl/parties/$partyId/sessions/$sessionId/snapshots/latest" -Method GET
Require-Status $latestResp 200
Write-Host $latestResp.Content

Print-Title "✅ Jalon A OK"
