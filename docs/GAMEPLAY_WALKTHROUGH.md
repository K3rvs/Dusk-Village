# Dusk Village: Complete Gameplay Walkthrough Guide

This comprehensive walkthrough guides you step-by-step through a complete match of **Dusk Village**, detailing every role, phase, interaction, and win strategy.

---

## 🌟 Match Setup: Lobby & Character Selection

1. **Creating or Joining a Match**:
   - Launch the game and select **Custom Game** from the main menu.
   - Enter your name and create a room code (e.g., `DV-H48C`), or join an existing room.
   - The server automatically fills empty player slots with intelligent AI bots up to a 10-player match.
2. **Avatar Customization**:
   - Choose your pixel avatar (1 of 6 distinct characters) from the avatar carousel.
   - Toggle **Ready** status. The host can click **Start Match Early** once all players are set.

---

## ⏳ Phase 1: Initiation Phase (15 Seconds)

```
[ MAP VIEW: INSIDE YOUR ASSIGNED COTTAGE ]
+-------------------------------------------------------------+
|                     [ PHASE BRIEFING ]                      |
|                                                             |
|   Role: 🛡️ SURVIVOR   /   🗡️ INSTIGATOR                      |
|   Objective: Reconstruct the mystery matrix before dusk!    |
|                                                             |
|   ⏳ STAY INDOORS: [ |||||||||||||||||||| ] 15s             |
+-------------------------------------------------------------+
```

- **Spawn Location**: Every player wakes up inside their private cottage (`HOUSE_H01` through `HOUSE_H10`).
- **Role Assignment**:
  - **🛡️ Survivor (7 Players)**: Your objective is to discover, verify, and submit all 3 mystery clues or identify and banish the Instigators.
  - **🗡️ Instigator (3 Players)**: Your secret team list appears on screen. Your goal is to plant decoys, lock key buildings, and outnumber the survivors.
- **Rules**: Movement outside the cottage is restricted until the 15-second countdown finishes.

---

## ☀️ Phase 2: Day Phase (150 Seconds / 2 Minutes 30 Seconds)

When the Initiation timer reaches zero, the screen blinks and all living players teleport to the **Village Square surrounding the central Angel Statue** `(768, 580)`.

```
        ☀️ DAY 1 ANNOUNCEMENT: "THE COUNTERFEIT CURE"
"Rumors spread that the clinic's medicine is fake. Find the truth!"
```

### Step-by-Step Investigation Workflow

#### 1. Search Open Walkways for Unverified Clues
- Walk across open exterior areas (School Courtyard, Clinic Gardens, Village Square, Library Walkways, Village Hall Plaza, South Orchard).
- Look for sparkling documents on the ground.
- Walk up to a document and press **`[E]`** or **Click** to pick it up.
- *Notice*: The document displays only a surface description (e.g., `"A torn flyer"`, `"A grocery receipt"`) and enters your inventory marked as `[ UNVERIFIED 🔍 ]`.

#### 2. Verify Documents at the Library
```
+-------------------------------------------------------------+
|                  LIBRARY VERIFICATION PODIUM                |
|                                                             |
|   Document: "A torn flyer"                                  |
|   Scanning metadata and citations... [ 2.0s ]               |
|                                                             |
|   RESULT: ✅ AUTHENTIC CLAIM CLUE DISCOVERED!                |
|   Title: "Counterfeit Shipment Notice"                      |
|   "Official dispatch logs confirming fake medicine crates." |
+-------------------------------------------------------------+
```
- Navigate to the **Library** (center-west building) and step through the door.
- Approach the central **Verification Podium** and press **`[E]`**.
- The scanner runs a 2-second document and metadata check:
  - **If Authentic**: The document reveals its official Title, Category (`CLAIM`, `CONTEXT`, or `SOURCE`), and proof text.
  - **If Decoy/Forged**: The scanner flags it as an irrelevant scrap or an Instigator forgery.

#### 3. Deliver Verified Clues to the Village Hall Archive
```
+-------------------------------------------------------------+
|                 VILLAGE HALL ARCHIVE PODIUM                 |
|                                                             |
|   [ CLAIM ]   : Counterfeit Shipment Notice      [ FILED ✓ ]|
|   [ CONTEXT ] : Awaiting Stage 2 Clue...         [ EMPTY   ]|
|   [ SOURCE ]  : Awaiting Stage 3 Clue...         [ EMPTY   ]|
+-------------------------------------------------------------+
```
- Exit the Library and head to the **Village Hall** (center-east building).
- Approach the **Archive Station** and press **`[E]`** to submit your verified authentic document.
- **Stage Progression**:
  1. Filing **Stage 1 (CLAIM)** announces Stage 1 completion and immediately spawns Stage 2 (CONTEXT) fragments across the village.
  2. Finding, verifying, and filing **Stage 2 (CONTEXT)** spawns Stage 3 (SOURCE) fragments.
  3. Filing **Stage 3 (SOURCE)** solves the mystery and **triggers an instant Survivor Victory**!

---

## ⚖️ Phase 3: Judgement Phase (60 Seconds / 1 Minute)

When the Day timer expires, the village bells ring and all living players teleport into a council circle surrounding the Angel Statue.

```
+-------------------------------------------------------------+
|                  VILLAGE COUNCIL JUDGEMENT                  |
|                                                             |
|   [ NOMINATE SUSPECT ] -> Select a player to put on trial   |
|                                                             |
|   Accused: [ Dave (Player 04) ]                             |
|   Cast Your Vote:                                           |
|        [ 🔴 BANISH SUSPECT ]      [ 🟢 FORGIVE / SKIP ]     |
|                                                             |
|   Time Remaining: 45s                                       |
+-------------------------------------------------------------+
```

1. **Discuss Evidence**: Use the Town Chat box to discuss who was seen planting decoys, who visited the Library, or who was lingering near locked doors.
2. **Nominate a Suspect**: Any player can nominate a suspect for eviction.
3. **Cast Votes**:
   - Vote **BANISH** if you believe the suspect is an Instigator.
   - Vote **FORGIVE** if you believe the suspect is innocent or evidence is lacking.
4. **Secret Outcome Resolution**: The council votes are tallied. The result is kept under wraps until dawn of the next day!

---

## 🌙 Phase 4: Night Phase (30 Seconds)

A smooth camera blackout transitions the village into nighttime.

```
       🌙 NIGHT HAS FALLEN — CURFEW IN EFFECT (30s)
```

### Survivor Mechanics
- Survivors return to their cottages.
- The doors lock until sunrise. Survivors use this quiet time to review the Mystery Status panel and plan their morning investigation routes.

### Instigator Operations
Instigators remain awake, can step outside into the dark exterior, and coordinate via private Instigator chat to execute one sabotage per night:

1. **Lockdown Sabotage**:
   - Open the Sabotage Menu and choose a building (e.g., **Library** or **Clinic**).
   - When dawn arrives, that building will remain locked and inaccessible for **20 seconds**.
2. **Plant Fabricated Clue**:
   - Forge a fake document and plant it at your current exterior position.
   - Unsuspecting survivors will pick up the fake document and waste time running to the Library.

---

## 🌅 Daybreak & Eviction Announcement

When the Night Phase ends, a new Day Phase begins:
1. The screen fades in, teleporting players back to the Village Square.
2. The **Daybreak Council Report** banner appears:
   - Example: `📢 DAYBREAK REPORT: Dave was banished by the council! Role revealed: INSTIGATOR.`
   - Or: `📢 DAYBREAK REPORT: The council was tied — no one was banished last night.`
3. Any locked buildings flash an amber warning timer counting down from 20 seconds.
4. The investigation cycle repeats until a victory condition is fulfilled.

---

## 🏆 Victory Conditions Summary

| Faction | Primary Win Condition | Alternate Win Condition |
| :--- | :--- | :--- |
| **🛡️ Survivors** | **Archive all 3 sequential clues** (`CLAIM` $\rightarrow$ `CONTEXT` $\rightarrow$ `SOURCE`) in the Village Hall. | **Banish all 3 Instigators** during the Judgement Phase. |
| **🗡️ Instigators** | **Eliminate/banish enough survivors** so living Instigators equal or outnumber living Survivors (e.g., 2 vs 2). | Prevent all 3 clues from being archived before the survivor team collapses. |

---

## 💡 Top Strategic Tips

- **For Survivors**:
  - Always verify items at the Library before heading to the Village Hall. Delivering unverified or decoy items is rejected by the archive.
  - Watch for players running away from buildings just before dusk or wandering near obscure corners where fake clues might be planted.
- **For Instigators**:
  - Lock the Library at night to prevent survivors from verifying Stage 2 or 3 clues early in the day.
  - Blend in by carrying decoy documents to the Library to pretend you are actively helping the town.
