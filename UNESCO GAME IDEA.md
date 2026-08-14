# GAME DESIGN DOCUMENT: DUSK VILLAGE

**Project Title:** Dusk Village  
**Genre:** 10-Player Social Deduction / Mystery / Media & Information Literacy (MIL)  
**Target Audience:** Youth, Students, Young Adults  
**Visual Style & Theme:** 2D Top-Down / Isometric, Media and Information Literacy (MIL), Misinformation, Mystery

---

## 1. DESCRIPTION

**Dusk Village** is a 10-player multiplayer social deduction game designed to foster Media and Information Literacy (MIL). Drawing inspiration from core social deduction mechanics, the game shifts the focus from simple physical eliminations to digital-age information warfare, fact-checking, and combating misinformation asymmetry.

Set in the mysterious and isolated Dusk Village, players are divided into two opposing sides: **7 Survivors** and **3 Instigators**. Survivors must collaborate to investigate mysteries regarding digital-age risks (such as deepfakes, cyberbullying, phishing, and medical hoaxes) by gathering, cross-referencing, and verifying authentic data points across the village. Meanwhile, Instigators—who are visually identical to Survivors—work secretly to spread misinformation, plant forged memory fragments, delay investigations, and manipulate public opinion to evict Survivors until they gain control of the village.

---

## 2. MECHANICS

### Core Game Loop & Information Verification

The gameplay revolves around discovering and verifying **Memory Fragments** to solve an overarching MIL logic mystery.

1. **Memory Fragments & Puzzle Structure:**
   - Every mystery requires uncovering and assembling three interconnected fragment types:
     - **The Claim:** The reported rumor, advertisement, or incident statement.
     - **The Context:** Background documentation, logs, or personal history.
     - **The Source:** The original origin data, digital metadata, or verified registry.
   - Individual players can only carry one fragment at a time and must communicate with others to assemble the full triad.

2. **Clue Chaining & Fragment Redirection:**
   - Memory fragments are scattered across the village map during the Day Phase.
   - Finding an authentic memory fragment reveals a hint/clue pointing directly toward the location of the next correct fragment in the chain.

3. **Library Verification System ("Media Outlets"):**
   - Fragments found in the field are unverified until tested at the **Library**.
   - The Library strictly enforces a **2-player maximum capacity** inside at any given time.
   - A pair of players must stand at the central verification podium inside the Library for **10 seconds** to authenticate their collected fragments.
   - Because the rest of the town cannot see inside the Library, these two players serve as the village’s "Media Outlets." The town must rely on their report, creating opportunities for trust or deception.

4. **Sabotage & Forged Fragments:**
   - Instigators can plant fake Memory Fragments that contain false claims, misleading context, or fake sources to lead Survivors down wrong investigative paths.
   - Instigators can lock key buildings during the night to restrict Survivor access during the following day.

5. **Win Conditions:**
   - **Survivors Win:** Successfully assemble and verify the Claim, Context, and Source of authentic Memory Fragments to solve the current mystery **OR** successfully identify and evict all 3 Instigators during the Judgment Phases.
   - **Instigators Win:** Reduce the Survivor count through eviction until the number of remaining Survivors equals the number of remaining Instigators (e.g., 2 Instigators vs 2 Survivors).

### Mystery Registry & Puzzle Matrix

| Mystery Title            | MIL Theme                | The Claim                                                                             | The Context                                                                              | The Source                                                                               |
| :----------------------- | :----------------------- | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **The Counterfeit Cure** | Medical Misinformation   | **Claim (Clinic):** Promotional flyer for an unregulated herbal cure.                 | **Context (School):** Ledger showing a student falling ill after consuming a supplement. | **Source (Library):** Medical registry proving the "doctor" is a documented fraud.       |
| **The Silent Hallways**  | Online Harassment        | **Claim (School):** Printed copies of slanderous digital messages.                    | **Context (Houses):** Unsent diary entries detailing a student's mental health decline.  | **Source (Library):** Digital footprint tracing harassment to a specific local IP.       |
| **The Breaking Point**   | Cyberbullying Awareness  | **Claim (Village Hall):** A sudden, unexplained leave of absence filed by a resident. | **Context (School):** A counselor's log noting severe social isolation.                  | **Source (Library):** Chat archive revealing a coordinated hate campaign.                |
| **The Illusory Truth**   | Deepfakes & Manipulation | **Claim (Village Hall):** A scandalous photograph of a village official.              | **Context (Houses):** Software receipt for high-end digital image editing tools.         | **Source (Library):** Original, unedited camera raw file metadata.                       |
| **The Empty Vault**      | Phishing & Digital Scams | **Claim (Houses):** Fraudulent urgent notice demanding immediate currency payment.    | **Context (Village Hall):** Unauthorized bank transfer log draining resident savings.    | **Source (Library):** Scam registry matching payment address to a known crime syndicate. |

---

## 3. PLAYER ROLES

The game strictly consists of two distinct roles without sub-roles:

- **Survivors (7 Players)**
  - **Objective:** Search the village for authentic Memory Fragments, follow fragment clue trails, verify evidence at the Library, solve the MIL mystery, and vote out Instigators during the Judgment Phase.
  - **Abilities & Constraints:** Can carry 1 Memory Fragment at a time, interact with investigation spots, participate in Library verification, and vote.

- **Instigators (3 Players)**
  - **Objective:** Bluffs as Survivors, sabotage investigative progress, plant forged memory fragments, lock down village structures during the night, and evict Survivors during voting until reaching voting parity.
  - **Visual Appearance:** **Instigators are dressed identically to Survivors.** There are no visual distinctions, badges, or special outfits differentiating Instigators from Survivors during the Day Phase.
  - **Abilities & Constraints:** Blend in with Survivors during the Day Phase; move freely at Night to lock buildings (for 30 seconds in the next Day Phase) and plant fake Memory Fragments.

---

## 4. BUILDINGS

The village consists of key functional structures:

1. **The 10 Player Houses (H1 to H10 - Perimeter Ring):**
   - 10 distinct player cottages assigned individually to each of the 10 players (H1, H2, H3, H4, H5, H6, H7, H8, H9, H10) encircling the village square perimeter.
   - Players spawn inside their respective houses at game start and are teleported back here at the beginning of each Night Phase.
   - Houses contain investigation clues for specific mysteries (e.g., receipts, unsent notes).

2. **The Village Hall (North / Top Side):**
   - A grand civic hall containing the **Mystery Ledger**, which outlines the specific mystery currently afflicting Dusk Village.
   - Houses civic records, financial ledgers, and official notices relevant to mystery puzzles.

3. **The University-Style Library (East / Right Side):**
   - A grand academic university-style library featuring classic brick and stone architecture, stately columns, stone arches, and tall arched windows.
   - Features a strict **2-player maximum capacity** threshold.
   - Contains the **Central Verification Podium** requiring 10 seconds of uninterrupted interaction to verify Memory Fragments.

4. **The School (South Side):**
   - An educational facility with timber facade, chalkboard marker badge, counselor suites, lockers, and an attached outdoor playground with swings and slide.
   - An investigative site containing student records, counselor logs, locker notes, and social interaction archives.

5. **The Clinic (West / Left Side):**
   - A healthcare and diagnostic center featuring clean white-rendered walls, red cross medical sign, and clinical intake labs.
   - An investigative site containing patient intake forms, medical histories, prescription logs, and health advisories.

6. **The Village Square (Center):**
   - The central paved plaza featuring the **Village Statue**.
   - Serves as the initial gathering point post-spawn and the location for the daily **Judgement Phase**.

---

## 5. VILLAGE LAYOUT

The Dusk Village layout is organized in a balanced radial structure designed to facilitate player movement, spatial awareness, and strategic sightlines:

![Dusk Village Layout Map](file:///c:/duskvillage/village_layout_map.jpg)

- **Center:** **Village Square & Statue** (Hub for game start announcements and Judgment Phase voting).
- **North (Top):** **Village Hall** (Grand civic hall hosting the Mystery Ledger).
- **East (Right):** **University-Style Library** (Grand academic brick/stone library with 2-player max capacity).
- **South (Bottom):** **The School** (Educational facility & investigative venue with playground).
- **West (Left):** **The Clinic** (Healthcare center & investigative venue with red cross sign).
- **Outer Ring:** **10 Player Houses (H1, H2, H3, H4, H5, H6, H7, H8, H9, H10)** encircling the central square and public facilities.

---

## 6. WALKTHROUGH

### Phase 0: Game Initialization & Role Assignment (10 Seconds)

1. All 10 players spawn inside their assigned individual **Player Houses**.
2. A **10-second countdown timer** begins inside each house.
3. During this 10-second window, the UI privately announces each player's secret role (either **Survivor** or **Instigator**).
4. When the 10 seconds expire, house doors automatically unlock, and all players are automatically gathered in the **Village Square**.
5. The **Village Statue** in the square displays an opening sequence and announces the specific **Mystery** that must be solved for the match.

---

### Phase 1: Day Phase (2 Minutes)

- **Duration:** Exactly 2 minutes (120 seconds).
- **Player Actions:**
  - **Survivors:**
    - Scatter across the village to search for **Memory Fragments** (Claims, Contexts, Sources).
    - Follow clue redirection notes attached to found fragments leading to the next logic puzzle piece.
    - Form pairs to enter the **Library** (observing the 2-player capacity limit) and stand at the podium for **10 seconds** to verify collected fragments.
    - Share findings with town members while trying to identify who is lying or misleading the group.
  - **Instigators:**
    - Blend in with Survivors (appearing visually identical).
    - Pretend to investigate and offer false clues to confuse Survivor deduction paths.
    - Delay player movement and feed misleading reports after entering the Library.

---

### Phase 2: Judgement Phase (1 Minute)

- **Duration:** Exactly 1 minute (60 seconds).
- **Phase Flow:**
  1. Once the 2-minute Day Phase timer ends, all living players are forcibly teleported back to the **Village Square**.
  2. Players engage in open discussion regarding:
     - Verified vs unverified fragments reported by Library verification pairs.
     - Suspicious movement patterns or broken clue chains.
     - Contradictory statements regarding claims and sources.
  3. A 60-second voting window opens at the Village Statue.
  4. Players cast votes to evict a suspected Instigator.
  5. **Eviction Consequence:**
     - If the player with the majority vote is evicted and was a **Survivor**, the total Survivor count is reduced by 1.
     - If an **Instigator** is evicted, the town moves closer to clearing the village of threats.
     - If votes tie or skip majority, no player is evicted.

---

### Phase 3: Night Phase (1 Minute)

- **Duration:** Exactly 1 minute (60 seconds).
- **Phase Flow:**
  1. At the conclusion of the Judgment Phase, all players are teleported back into their respective **Player Houses**.
  2. **Survivors** remain secured inside their houses for safety.
  3. **Instigators** gain free nocturnal mobility and exit their houses under cover of darkness to perform sabotage:
     - **Building Lockout:** Instigators can interact with one major public building (Clinic, School, Library, or Village Hall) to lock it for **30 seconds** at the start of the next Day Phase.
     - **Plant Fake Fragments:** Instigators can plant forged memory fragments around the map to misdirect Survivors during the upcoming day.
  4. Once the 1-minute Night Phase timer expires, night ends and a new **Day Phase (2 minutes)** begins with all players exiting their houses.
