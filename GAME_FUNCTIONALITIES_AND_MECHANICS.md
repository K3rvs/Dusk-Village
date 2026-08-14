# DUSK VILLAGE — GAME FUNCTIONALITIES & MECHANICS SPECIFICATION

**Document Version:** 1.0  
**Project Title:** Dusk Village  
**Genre:** 10-Player Social Deduction / Mystery / Media & Information Literacy (MIL)  
**Engine Target:** Phaser 3 (JavaScript) · 2D Top-Down · HTML5 Canvas  
**Last Updated:** 2026-07-25

---

**Location glossary** — three distinct places that are easy to conflate:

| Term | What it is | Where it's used |
| :--- | :--- | :--- |
| **Village Statue** | A single interactable landmark | Displays the current mystery at the start of Day Phase (§5.2); the Solve Mystery UI submission point (§11.3, Appendix A) |
| **Village Hall** | One of the four enterable public buildings | Holds investigation fragments and clue-chain destinations for several mysteries (§9.5, §11.1); can be locked by Instigators at night (§12.2) |
| **Village Square** | The outdoor gathering area | Where all players are teleported for the Judgement Phase (§2.3, §13.1) and where eviction/voting takes place |

---

## TABLE OF CONTENTS

0. [Gameplay Flow Overview (Player Journey)](#0-gameplay-flow-overview-player-journey)
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Game State Machine](#2-game-state-machine)
3. [Lobby & Matchmaking System](#3-lobby--matchmaking-system)
4. [Character Selection System](#4-character-selection-system)
5. [Role Assignment System](#5-role-assignment-system)
6. [Phase Management System](#6-phase-management-system)
7. [Player Movement & Collision System](#7-player-movement--collision-system)
8. [Building Entry & Interior System](#8-building-entry--interior-system)
9. [Memory Fragment System](#9-memory-fragment-system)
10. [Library Verification System](#10-library-verification-system)
11. [Mystery & Puzzle System](#11-mystery--puzzle-system)
12. [Instigator Sabotage System](#12-instigator-sabotage-system)
13. [Judgement Phase & Voting System](#13-judgement-phase--voting-system)
14. [Chat & Communication System](#14-chat--communication-system)
15. [HUD & UI System](#15-hud--ui-system)
16. [Inventory System](#16-inventory-system)
17. [Win Condition Evaluation System](#17-win-condition-evaluation-system)
18. [Phase Transition & Visual FX System](#18-phase-transition--visual-fx-system)
19. [Audio System](#19-audio-system)
20. [Camera & Rendering System](#20-camera--rendering-system)
21. [Networking & Synchronization Model](#21-networking--synchronization-model)
22. [Anti-Cheat & Validation Layer](#22-anti-cheat--validation-layer)
23. [Data Structures & Entity Schemas](#23-data-structures--entity-schemas)
24. [Event Bus & Signal Architecture](#24-event-bus--signal-architecture)
25. [Configuration Constants](#25-configuration-constants)

---

## 0. GAMEPLAY FLOW OVERVIEW (PLAYER JOURNEY)

This section describes the end-to-end player journey in narrative form, from entering the game through the recurring Day → Judgement → Night loop. It complements the formal state machine in Section 2 and the detailed phase logic in Section 6.

### 0.1 Entry & Setup

- Player enters the game.
- Player joins a room.
- Player chooses an avatar. This choice is cosmetic only and has no effect on role assignment or gameplay.

### 0.2 Initiation Phase (10 seconds)

- All players start inside their own house.
- Roles are assigned and revealed to each player during this window.
- After the 10-second countdown ends, the game officially starts and players are free to leave their houses.

### 0.3 Day Phase — 2 minutes (Day 1)

- Players check the Village Hall to learn the mystery they need to solve.
- All players spread out across the map to search for fragments, which are scattered in different locations.
- Players must find and choose the 3 fragments that are actually related to the mystery in order to win.
- The Survivors must do this before the number of Instigators equals the number of Survivors — if the counts match first, the Instigators win the game instead.

### 0.4 Judgement Phase — 1 minute

- Once the Day Phase countdown ends, all players are teleported to the Village Square.
- Players discuss their findings together and try to uncover who the Instigators are.
- During this time, players vote on who should be removed. This is a battle of wits, since Instigators can frame an innocent player to avoid detection.
- Whether the removed player was actually a Survivor or an Instigator is not revealed immediately — that result is revealed during the following Night Phase.

### 0.5 Night Phase — 1 minute (Night 1)

- All players are teleported back to their houses as the Night Phase begins.
- Instigators, however, are able to leave their houses and sabotage the game. Available sabotage actions include:
  - **Planting fake fragments** to confuse the Survivors.
  - **Blocking a building's access** — locking its door for the first 30 seconds of the upcoming Day Phase.
- Once the phase timer reaches 0, all Instigators are automatically sent back to their houses.

### 0.6 Loop Continuation

- When the Night Phase ends, the cycle repeats: Day Phase begins again (Day 2), followed by another Judgement Phase and Night Phase, and so on until a win condition is met.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Per Player)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Renderer │  │  Input   │  │   HUD    │  │   Audio      │ │
│  │ (Phaser) │  │ Manager  │  │ Manager  │  │   Manager    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │              │             │               │         │
│  ┌────┴──────────────┴─────────────┴───────────────┴───────┐ │
│  │              GAME STATE CONTROLLER                       │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │  Phase Manager │ Entity Manager │ Event Bus     │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └─────────────────────┬───────────────────────────────────┘ │
│                        │                                     │
│  ┌─────────────────────┴───────────────────────────────────┐ │
│  │              NETWORK LAYER (WebSocket Client)            │ │
│  └─────────────────────┬───────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │ WebSocket / WebRTC
┌────────────────────────┼─────────────────────────────────────┐
│                  SERVER (Authoritative)                       │
│  ┌─────────────────────┴───────────────────────────────────┐ │
│  │              GAME SESSION MANAGER                        │ │
│  │  ┌───────────┐  ┌──────────┐  ┌───────────────────┐    │ │
│  │  │ Room Mgr  │  │ Phase Mgr│  │  Validation Layer │    │ │
│  │  └───────────┘  └──────────┘  └───────────────────┘    │ │
│  │  ┌───────────┐  ┌──────────┐  ┌───────────────────┐    │ │
│  │  │ Role Assn │  │ Vote Mgr │  │  Fragment Mgr     │    │ │
│  │  └───────────┘  └──────────┘  └───────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Module Dependency Graph

| Module | Depends On | Depended By |
| :--- | :--- | :--- |
| **PhaseManager** | GameState, Timer | All gameplay modules |
| **PlayerController** | InputManager, PhaseManager | MovementSystem, InteractionSystem |
| **FragmentManager** | PhaseManager, MapManager | VerificationSystem, MysterySystem |
| **VotingSystem** | PhaseManager, PlayerManager | WinCondition |
| **VerificationSystem** | FragmentManager, LibraryManager | MysterySystem |
| **MysterySystem** | VerificationSystem, FragmentManager | WinCondition |
| **SabotageSystem** | PhaseManager, RoleManager | FragmentManager, BuildingManager |
| **ChatSystem** | PhaseManager, PlayerManager | HUDManager |
| **HUDManager** | All UI subsystems | Renderer |
| **WinCondition** | VotingSystem, MysterySystem, PlayerManager | GameState |

---

## 2. GAME STATE MACHINE

### 2.1 Master State Diagram

```
                    ┌──────────┐
                    │  BOOT    │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  MENU    │◄──────────────────────────────┐
                    └────┬─────┘                               │
                         │                                     │
                    ┌────▼─────┐                               │
                    │  LOBBY   │                               │
                    └────┬─────┘                               │
                         │ (10 players ready)                  │
                    ┌────▼─────────────┐                       │
                    │ CHARACTER_SELECT │                       │
                    └────┬─────────────┘                       │
                         │ (all picked)                        │
                    ┌────▼──────────────┐                      │
                    │ ROLE_ASSIGNMENT   │                      │
                    │ (10-sec countdown)│                      │
                    └────┬──────────────┘                      │
                         │                                     │
              ┌──────────▼──────────┐                          │
              │     DAY_PHASE       │◄─────────┐               │
              │   (120 seconds)     │          │               │
              └──────────┬──────────┘          │               │
                         │                     │               │
              ┌──────────▼──────────┐          │               │
              │  JUDGEMENT_PHASE    │          │               │
              │   (60 seconds)     │          │               │
              └──────────┬──────────┘          │               │
                         │                     │               │
                    ┌────▼────┐                │               │
                    │ CHECK   │                │               │
                    │ WIN CON │                │               │
                    └────┬────┘                │               │
                    ┌────┴────┐                │               │
              ┌─────┤ Winner? ├─────┐          │               │
              │ NO  └─────────┘ YES │          │               │
              │                     │          │               │
     ┌────────▼──────────┐   ┌──────▼──────┐   │               │
     │   NIGHT_PHASE     │   │  GAME_OVER  │───┘               │
     │   (60 seconds)    │   │  (Results)  │────────────────────┘
     └────────┬──────────┘   └─────────────┘
              │
              └────────────────────┘
```

### 2.2 State Definitions

| State | ID | Duration | Entry Action | Exit Action |
| :--- | :--- | :--- | :--- | :--- |
| **BOOT** | `0` | Instant | Load all assets, initialize engine | Transition to MENU |
| **MENU** | `1` | Indefinite | Show main menu UI | Hide menu UI |
| **LOBBY** | `2` | Until 10 players | Show lobby UI, wait for connections | Lock lobby, assign slots |
| **CHARACTER_SELECT** | `3` | 30 seconds | Show 5 avatars, allow picks | Lock selections, broadcast choices |
| **ROLE_ASSIGNMENT** | `4` | 10 seconds | Assign roles, show role modal, spawn in houses | Unlock house doors, teleport to square |
| **DAY_PHASE** | `5` | 120 seconds | Unlock buildings, spawn fragments, enable movement | Freeze movement, disable interactions |
| **JUDGEMENT_PHASE** | `6` | 60 seconds | Teleport all to square, open voting UI, enable town chat | Resolve votes, apply eviction |
| **CHECK_WIN** | `7` | Instant | Evaluate survivor/instigator counts & mystery status | Branch to NIGHT or GAME_OVER |
| **NIGHT_PHASE** | `8` | 60 seconds | Teleport to houses, give instigators free movement | Freeze instigator movement, apply sabotage |
| **GAME_OVER** | `9` | Indefinite | Show victory/defeat screen, reveal all roles | Return to MENU or LOBBY |

### 2.3 State Transition Rules

```javascript
// Pseudocode — State Transition Logic
function onPhaseTimerExpired(currentState) {
    switch (currentState) {
        case STATE.ROLE_ASSIGNMENT:
            unlockAllHouseDoors();
            teleportAllPlayersTo(VILLAGE_SQUARE);
            announceCurrentMystery();
            transitionTo(STATE.DAY_PHASE, 120);
            break;

        case STATE.DAY_PHASE:
            freezeAllPlayerMovement();
            disableAllInteractions();
            teleportAllLivingPlayersTo(VILLAGE_SQUARE);
            transitionTo(STATE.JUDGEMENT_PHASE, 60);
            break;

        case STATE.JUDGEMENT_PHASE:
            resolveVotes();
            applyEviction();
            if (checkWinCondition() !== null) {
                transitionTo(STATE.GAME_OVER);
            } else {
                teleportAllToHouses();
                transitionTo(STATE.NIGHT_PHASE, 60);
            }
            break;

        case STATE.NIGHT_PHASE:
            freezeInstigatorMovement();
            applyBuildingLockouts();
            applyPlantedFragments();
            transitionTo(STATE.DAY_PHASE, 120);
            break;
    }
}
```

---

## 3. LOBBY & MATCHMAKING SYSTEM

### 3.1 Lobby Lifecycle

```
CREATE_LOBBY → WAITING_FOR_PLAYERS → READY_CHECK → START_GAME
```

### 3.2 Functional Requirements

| Feature | Specification |
| :--- | :--- |
| **Max Players** | Exactly 10 (no more, no less) |
| **Min Players to Start** | 10 (all slots must be filled) |
| **Room Code** | 6-character alphanumeric code (e.g., `DV-A3K9`) |
| **Host Privileges** | Start game, kick players, set mystery (random or specific) |
| **Player Slots** | Numbered P1–P10, mapped to Houses H1–H10 |
| **Ready System** | Each player must toggle "Ready" status; game starts when all 10 are ready |
| **Disconnect Handling** | 30-second reconnection window; if expired, AI bot takes over the slot |

### 3.3 Lobby Data Model

```javascript
LobbyState = {
    roomCode: "DV-A3K9",
    hostPlayerId: "player_001",
    mysterySelection: "RANDOM",  // or specific mystery ID
    players: [
        {
            id: "player_001",
            slot: 1,              // P1, maps to H1
            displayName: "Alice",
            avatarId: null,       // Set during CHARACTER_SELECT
            isReady: false,
            isConnected: true,
            isHost: true
        },
        // ... up to 10 players
    ],
    state: "WAITING_FOR_PLAYERS", // WAITING | READY_CHECK | STARTING
    createdAt: 1753455000000
};
```

### 3.4 Lobby Events

| Event | Trigger | Payload | Broadcast |
| :--- | :--- | :--- | :--- |
| `PLAYER_JOINED` | Player connects | `{playerId, displayName, slot}` | All players |
| `PLAYER_LEFT` | Player disconnects | `{playerId, slot}` | All players |
| `PLAYER_READY` | Player toggles ready | `{playerId, isReady}` | All players |
| `PLAYER_KICKED` | Host kicks player | `{playerId, reason}` | All players |
| `GAME_STARTING` | Host starts & all ready | `{countdown: 5}` | All players |
| `LOBBY_CLOSED` | Host leaves or game starts | `{reason}` | All players |

---

## 4. CHARACTER SELECTION SYSTEM

### 4.1 Overview

After the lobby fills and the host initiates the game, all 10 players enter a **30-second character selection phase**. Each player picks from 6 official selectable avatars. Multiple players CAN pick the same avatar (no exclusivity lock).

### 4.2 Avatar Pool

| Avatar ID | Name / Profession | Visual Key Color | Sprite Asset File |
| :--- | :--- | :--- | :--- |
| `01` | **Chef** | White Chef Uniform `#FFFFFF` | `Chef.png` |
| `02` | **Construction Worker** | Hi-Vis Orange `#E67E22` | `Construction Worker.png` |
| `03` | **Mechanic** | Navy Blue Overalls `#1B365D` | `Mechanic.png` |
| `04` | **Nurse** | Teal Scrubs `#1ABC9C` | `Nurse.png` |
| `05` | **Office Worker** | Slate Suit `#4A5568` | `Office Worker.png` |
| `06` | **Police** | Deep Navy Uniform `#0F3460` | `Police.png` |

### 4.3 Selection Rules

1. **Timer:** 30 seconds. If a player does not select, a random avatar is assigned.
2. **Duplicates Allowed:** Instigators blend into any crowd; restricting would reduce social deduction.
3. **Confirmation:** Player clicks avatar → preview animates → clicks "Confirm" → selection locked.
4. **Broadcast:** Once confirmed, the player's avatar choice is broadcast to all clients (others see a checkmark on that player's slot).
5. **No Undo:** Once confirmed, the selection cannot be changed.

### 4.4 Character Selection UI Layout

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          CHOOSE YOUR CHARACTER                                ║
║                              Time: 0:24                                       ║
║                                                                               ║
║ ┌────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────┐ ┌────┐ ║
║ │  CHEF  │ │ CONSTRUCTION │ │ MECHANIC │ │  NURSE  │ │ OFFICE WORKER │ │POLI│ ║
║ │ [img]  │ │    [img]     │ │  [img]   │ │  [img]  │ │     [img]     │ │[im]│ ║
║ │        │ │      ★       │ │          │ │         │ │               │ │    │ ║
║ └────────┘ └──────────────┘ └──────────┘ └─────────┘ └───────────────┘ └────┘ ║
║                                                                               ║
║                         ┌───────────────────────────┐                         ║
║                         │ [ CONFIRM: CONSTRUCTION ] │                         ║
║                         └───────────────────────────┘                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. ROLE ASSIGNMENT SYSTEM

### 5.1 Algorithm

```javascript
function assignRoles(players) {
    // players = array of 10 PlayerObjects
    const shuffled = fisherYatesShuffle([...players]);
    
    // First 3 become Instigators, remaining 7 become Survivors
    const instigators = shuffled.slice(0, 3);
    const survivors = shuffled.slice(3);
    
    instigators.forEach(p => p.role = 'INSTIGATOR');
    survivors.forEach(p => p.role = 'SURVIVOR');
    
    // Role assignment is SERVER-ONLY
    // Each player receives ONLY their own role via private message
    players.forEach(p => {
        sendPrivateMessage(p.id, {
            type: 'ROLE_ASSIGNED',
            role: p.role,
            portraitAsset: p.role === 'SURVIVOR' 
                ? 'port_role_survivor' 
                : 'port_role_instigator',
            teammates: p.role === 'INSTIGATOR' 
                ? instigators.filter(i => i.id !== p.id).map(i => i.id)
                : []  // Survivors do NOT know each other's roles
        });
    });
}
```

### 5.2 Role Assignment Phase Flow

1. **Spawn:** All 10 players spawn inside their assigned houses (H1–H10) with doors locked.
2. **10-Second Timer:** A countdown begins inside each house.
3. **Role Reveal Modal:** During the countdown, each player sees an unskippable modal:
   - **Survivor Modal:** Shows `port_role_survivor` (64×64 px), title "SURVIVOR", description text, "UNDERSTOOD" button (2-second delay before clickable).
   - **Instigator Modal:** Shows `port_role_instigator` (64×64 px), title "INSTIGATOR", description text, lists teammate Instigator names, "UNDERSTOOD" button (2-second delay).
4. **Timer Expires:** House doors unlock. All players are teleported to the Village Square.
5. **Mystery Announcement:** The Village Statue displays the current mystery title and a brief introduction narrative.

### 5.3 Instigator Identity Knowledge Matrix

| Who Knows What | Survivor | Instigator |
| :--- | :--- | :--- |
| Own Role | ✓ | ✓ |
| Other Survivors' Roles | ✗ | ✗ |
| Other Instigators' Identity | ✗ | ✓ |
| Number of Instigators | ✓ (Knows there are 3) | ✓ |

---

## 6. PHASE MANAGEMENT SYSTEM

### 6.1 Phase Configuration Table

| Phase | Duration | Timer Display | Movement Allowed | Interactions | Chat Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Role Assignment** | 10 sec | Countdown in house | None (locked in house) | Role modal only | None |
| **Day Phase** | 120 sec | Top-center HUD | All players, full map | Fragments, Buildings, Library | Proximity Chat |
| **Judgement Phase** | 60 sec | Top-center HUD | None (locked in square) | Voting only | Town Chat (all) |
| **Night Phase** | 60 sec | Top-center HUD | Instigators only | Sabotage & Plant only | Instigator Private Chat |

### 6.2 Timer Implementation

```javascript
class PhaseTimer {
    constructor() {
        this.remaining = 0;     // milliseconds remaining
        this.duration = 0;      // total phase duration in ms
        this.isRunning = false;
        this.callbacks = {
            onTick: null,       // fires every 1000ms
            onWarning: null,    // fires at 30s remaining
            onCritical: null,   // fires at 10s remaining
            onExpired: null     // fires at 0s remaining
        };
    }

    start(durationSeconds) {
        this.duration = durationSeconds * 1000;
        this.remaining = this.duration;
        this.isRunning = true;
    }

    update(deltaMs) {
        if (!this.isRunning) return;
        this.remaining -= deltaMs;
        
        // Visual urgency thresholds
        if (this.remaining <= 10000 && this.remaining > 9000) {
            this.callbacks.onCritical?.();   // Alert Red + screen flash
        } else if (this.remaining <= 30000 && this.remaining > 29000) {
            this.callbacks.onWarning?.();    // Caution Amber pulse
        }
        
        if (this.remaining <= 0) {
            this.remaining = 0;
            this.isRunning = false;
            this.callbacks.onExpired?.();
        }
    }

    getDisplayString() {
        const totalSec = Math.ceil(this.remaining / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }
}
```

### 6.3 Phase Transition Sequence

Each phase transition follows a strict 5-step sequence:

1. **FREEZE** — Disable all player inputs and interactions.
2. **ANIMATE** — Play phase transition VFX (fade overlay, color temperature shift).
3. **RELOCATE** — Teleport players to the target location (square or houses).
4. **RECONFIGURE** — Update game rules (movement permissions, interactions, chat mode).
5. **RESUME** — Re-enable inputs, start new phase timer.

---

## 7. PLAYER MOVEMENT & COLLISION SYSTEM

### 7.1 Movement Parameters

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Base Speed** | 64 px/sec (4 tiles/sec) | At 16px/tile |
| **Tile Size** | 16×16 px | Base grid unit |
| **Character Hitbox** | 10×8 px (centered at feet) | Smaller than sprite for forgiving collision |
| **Sprite Size** | 16×24 px | Width × Height |
| **Input** | Arrow Keys / WASD | 4-directional cardinal movement |
| **Diagonal Movement** | Disabled | Strict 4-direction only (classic top-down) |
| **Animation Frames** | 4 frames per direction | 400ms per walk cycle loop |
| **Idle Trigger** | 3 seconds of no input | Switches to 2-frame idle breathing animation |

### 7.2 Collision Layer Architecture

The tilemap uses a layered collision system:

```
Layer 0: Ground (no collision) — grass, dirt, cobblestone
Layer 1: Terrain Features (collision) — walls, water, trees, rocks
Layer 2: Buildings (collision) — building exterior walls
Layer 3: Props (collision) — benches, fences, barrels (some walkable-behind)
Layer 4: Overlap (no collision, renders above player) — tree canopies, roof overhangs
Layer 5: Player Entities — character sprites with hitbox-based collision
```

### 7.3 Movement State Machine (Per Player)

```
     ┌────────┐    input     ┌──────────┐
     │  IDLE  │─────────────►│  WALKING  │
     │(breath)│◄─────────────│(walk anim)│
     └────┬───┘   no input   └─────┬─────┘
          │         3s              │ collide
          │                   ┌────▼──────┐
          │                   │  BLOCKED  │
          │                   │(idle face) │
          │                   └─────┬─────┘
          │                         │ input change
          │                         │
          └─────────────────────────┘
```

### 7.4 Collision Response Rules

| Collider A | Collider B | Response |
| :--- | :--- | :--- |
| Player | Wall/Building Exterior | Block movement, maintain facing direction |
| Player | Player | Pass through (no player-player collision for this game) |
| Player | Building Door (unlocked) | Trigger building entry transition |
| Player | Building Door (locked) | Show "LOCKED" indicator, play `sfx_solve_fail`, block entry |
| Player | Memory Fragment (world) | Show pickup prompt, trigger interaction on key press |
| Player | Interactable Prop | Show inspect icon, trigger interaction on key press |
| Player | Map Boundary (octagonal wall) | Block movement |

### 7.5 Movement Permission Matrix

| Phase | Survivors | Instigators |
| :--- | :--- | :--- |
| **Role Assignment** | ✗ (locked in house) | ✗ (locked in house) |
| **Day Phase** | ✓ (full map) | ✓ (full map, blending in) |
| **Judgement Phase** | ✗ (locked in square) | ✗ (locked in square) |
| **Night Phase** | ✗ (locked in house) | ✓ (free roam) |

---

## 8. BUILDING ENTRY & INTERIOR SYSTEM

### 8.1 Building Registry

| Building | Interior Map Size | Capacity Limit | Contains Fragments For | Lockable |
| :--- | :--- | :--- | :--- | :--- |
| **Village Hall** | 12×10 tiles | Unlimited | The Breaking Point (Claim), The Illusory Truth (Claim), The Empty Vault (Context) | Yes |
| **Library** | 10×8 tiles | **2 players max** | The Counterfeit Cure (Source), The Silent Hallways (Source), The Breaking Point (Source), The Illusory Truth (Source), The Empty Vault (Source) | Yes |
| **School** | 10×8 tiles | Unlimited | The Counterfeit Cure (Context), The Silent Hallways (Claim), The Breaking Point (Context) | Yes |
| **Clinic** | 8×6 tiles | Unlimited | The Counterfeit Cure (Claim) | Yes |
| **Houses H1-H10** | 6×5 tiles | 1 player (owner) | The Silent Hallways (Context), The Illusory Truth (Context), The Empty Vault (Claim) | No |

### 8.2 Entry/Exit Mechanics

```javascript
function onPlayerReachDoor(player, building) {
    // 1. Check if building is locked
    if (building.isLocked) {
        showLockedIndicator(building);
        playSound('sfx_solve_fail');
        showTimerOverlay(building.lockRemainingSeconds);
        return;
    }
    
    // 2. Check capacity (Library only)
    if (building.type === 'LIBRARY') {
        const occupants = getPlayersInBuilding(building);
        if (occupants.length >= 2) {
            showCapacityModal(building, occupants);
            return;
        }
    }
    
    // 3. Transition to interior
    fadeOutExterior(500);
    loadInteriorMap(building.interiorMapId);
    spawnPlayerAtEntryPoint(player, building.entryTile);
    fadeInInterior(500);
    
    // 4. Update player location state
    player.currentLocation = building.id;
    broadcastPlayerLocation(player);
}

function onPlayerReachExit(player, building) {
    fadeOutInterior(500);
    loadExteriorMap();
    spawnPlayerAtExitPoint(player, building.exteriorDoorTile);
    fadeInExterior(500);
    
    player.currentLocation = 'EXTERIOR';
    broadcastPlayerLocation(player);
}
```

### 8.3 Library Capacity System

The Library enforces a **strict 2-player maximum**:

1. **Visual Indicator (Exterior):** A capacity light on the Library building exterior:
   - 🟢 **Green:** 0 occupants — open entry
   - 🟡 **Amber:** 1 occupant — 1 slot remaining
   - 🔴 **Red:** 2 occupants — FULL, entry blocked
2. **Entry Attempt When Full:** Displays the Library Capacity Modal showing the names of the 2 current occupants.
3. **Strategic Implication:** Since only 2 players can enter, those 2 become the village's "Media Outlets." The rest of the town must trust their report about what they verified. This mirrors real-world reliance on media channels.

---

## 9. MEMORY FRAGMENT SYSTEM

### 9.1 Fragment Types & Properties

Every mystery requires exactly 3 fragments to solve:

| Fragment Type | Description | Visual | Gameplay Role |
| :--- | :--- | :--- | :--- |
| **Claim** | The reported rumor, incident, or statement | Document/flyer icon | The initial assertion to investigate |
| **Context** | Background documentation, logs, or personal history | Ledger/diary icon | Provides supporting/contradicting evidence |
| **Source** | Original origin data, metadata, or verified registry | Folder/digital icon | The authoritative proof that resolves the claim |

### 9.2 Fragment Data Structure

```javascript
MemoryFragment = {
    id: "frag_cure_claim_01",           // Unique fragment ID
    mysteryId: "COUNTERFEIT_CURE",      // Parent mystery
    fragmentType: "CLAIM",              // CLAIM | CONTEXT | SOURCE
    isAuthentic: true,                  // true = real, false = forged by Instigator
    title: "Herbal Cure Flyer",
    description: "A promotional flyer advertising an unregulated herbal cure.",
    iconAsset: "ico_frag_cure_claim",
    spawnLocation: "CLINIC",            // Building where this spawns
    spawnTile: { x: 4, y: 3 },         // Exact tile position inside building
    clueText: "The student ledger at the School may reveal more...",
    nextFragmentHint: "SCHOOL",         // Directs player to next fragment location
    isPickedUp: false,
    heldByPlayerId: null,
    isVerified: false,
    plantedByInstigatorId: null         // Non-null if this is a forged fragment
};
```

### 9.3 Fragment Spawn Rules

1. **Day Phase Start:** At the beginning of each Day Phase, any uncollected authentic fragments respawn at their designated locations.
2. **Forged Fragments:** Instigators plant these during the Night Phase. They appear identically to authentic fragments in the game world.
3. **One Per Player:** A player can hold exactly 1 fragment at a time. Picking up a new fragment forces a swap (old fragment drops at feet).
4. **World Appearance:** Unresolved fragments appear as the `spr_frag_world_pulse` sprite (16×16 px glowing scroll with a 2-frame pulse animation).
5. **Visibility:** All fragments are visible to all players. Players cannot distinguish authentic from forged fragments until verification.

### 9.4 Fragment Pickup Interaction

```javascript
function onPlayerInteractWithFragment(player, fragment) {
    // Validate: Is player in DAY_PHASE? Is player alive?
    if (currentPhase !== PHASE.DAY || !player.isAlive) return;
    
    // Play pickup animation (3 frames, 300ms)
    playAnimation(player, 'interact_pickup', 300);
    playSound('sfx_fragment_pickup');
    
    // Handle existing held fragment
    if (player.heldFragment !== null) {
        dropFragment(player.heldFragment, player.position);
    }
    
    // Assign fragment to player
    player.heldFragment = fragment;
    fragment.isPickedUp = true;
    fragment.heldByPlayerId = player.id;
    
    // Remove from world, update HUD
    removeWorldSprite(fragment.worldSpriteId);
    updateInventoryHUD(player);
    
    // Show clue text in chat
    showClueNotification(player, fragment.clueText);
}
```

### 9.5 Fragment Clue Chaining

Each authentic fragment contains a `clueText` field that hints at the location of the **next** fragment in the investigation chain. The chain follows the order:

```
Claim → Context → Source
```

| Mystery | Claim Location → Clue | Context Location → Clue | Source Location |
| :--- | :--- | :--- | :--- |
| **Counterfeit Cure** | Clinic → "Check the School ledger" | School → "Verify at the Library" | Library |
| **Silent Hallways** | School → "Look in the Houses" | Houses → "Trace the source at the Library" | Library |
| **Breaking Point** | Village Hall → "Visit the School counselor" | School → "The Library chat archives hold the answer" | Library |
| **Illusory Truth** | Village Hall → "Search the Houses for receipts" | Houses → "The Library has the original metadata" | Library |
| **Empty Vault** | Houses → "Check the Village Hall records" | Village Hall → "The Library scam registry is the key" | Library |

> **Design Note:** All Sources are located in the Library. This forces players to use the 2-player capacity verification system, creating the core trust dynamic.

---

## 10. LIBRARY VERIFICATION SYSTEM

### 10.1 Overview

The Library is the ONLY location where Memory Fragments can be verified as authentic or forged. Verification requires:
- Exactly **2 players** standing at the **Central Verification Podium** (`prop_podium_verification`)
- An uninterrupted **10-second interaction** at the podium

### 10.2 Verification Process

```javascript
function startVerification(playerA, playerB) {
    // Both players must be at podium tile
    if (!isAtPodium(playerA) || !isAtPodium(playerB)) return;
    
    // Both must hold a fragment to verify
    const fragA = playerA.heldFragment;
    const fragB = playerB.heldFragment;
    
    if (!fragA && !fragB) {
        showNotification("No fragments to verify.");
        return;
    }
    
    // Start 10-second verification timer
    verificationTimer = new Timer(10000);
    showVerificationProgressBar(verificationTimer);
    playAnimation('vfx_verify_sparkle');
    
    verificationTimer.onComplete = () => {
        // Verify each held fragment
        [fragA, fragB].filter(f => f !== null).forEach(fragment => {
            if (fragment.isAuthentic) {
                fragment.isVerified = true;
                showVerifiedBadge(fragment, 'AUTHENTIC');
                playSound('sfx_fragment_verified');
            } else {
                fragment.isVerified = true;
                fragment.markedAsForged = true;
                showVerifiedBadge(fragment, 'FORGED');
                playSound('sfx_solve_fail');
            }
        });
        
        // Update mystery status panel
        updateMysteryStatus();
    };
    
    // INTERRUPTION: If either player moves away, cancel verification
    verificationTimer.onInterrupted = () => {
        cancelVerificationProgressBar();
        showNotification("Verification interrupted! Stay at the podium.");
    };
}
```

### 10.3 Verification Trust Dynamics

This is the game's central social deduction mechanic:

1. **Only 2 players see the result.** The rest of the town receives information secondhand.
2. **Instigator Deception:** An Instigator inside the Library can:
   - Truthfully report a forged fragment (to appear cooperative)
   - Falsely claim an authentic fragment was forged (to delay progress)
   - Falsely claim a forged fragment was authentic (to mislead the investigation)
3. **Survivor Trust:** Survivors must decide whether to trust the Library pair's report or demand re-verification with different partners.

### 10.4 Verification Result Visibility

| Who | Can See Verification Result Directly? |
| :--- | :--- |
| Player A (at podium) | ✓ Yes — sees authentic/forged badge |
| Player B (at podium) | ✓ Yes — sees authentic/forged badge |
| All other players | ✗ No — must rely on verbal reports from A and B |
| Server | ✓ Yes — authoritative ground truth |

---

## 11. MYSTERY & PUZZLE SYSTEM

### 11.1 Mystery Registry

| Mystery ID | Title | MIL Theme | Claim Loc | Context Loc | Source Loc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `COUNTERFEIT_CURE` | The Counterfeit Cure | Medical Misinformation | Clinic | School | Library |
| `SILENT_HALLWAYS` | The Silent Hallways | Online Harassment | School | Houses | Library |
| `BREAKING_POINT` | The Breaking Point | Cyberbullying Awareness | Village Hall | School | Library |
| `ILLUSORY_TRUTH` | The Illusory Truth | Deepfakes & Manipulation | Village Hall | Houses | Library |
| `EMPTY_VAULT` | The Empty Vault | Phishing & Digital Scams | Houses | Village Hall | Library |

### 11.2 Mystery Selection

```javascript
function selectMystery(lobbySettings) {
    if (lobbySettings.mysterySelection === 'RANDOM') {
        return MYSTERY_REGISTRY[Math.floor(Math.random() * MYSTERY_REGISTRY.length)];
    } else {
        return MYSTERY_REGISTRY.find(m => m.id === lobbySettings.mysterySelection);
    }
}
```

### 11.3 Solve Mystery Flow

```
Player collects verified Claim + Context + Source
         │
         ▼
Opens "Solve Mystery" interface at Village Statue
         │
         ▼
Drags fragments into 3 slots (Claim → Context → Source)
         │
         ▼
Clicks "SUBMIT"
         │
    ┌────┴────┐
    │ Server  │
    │Validates│
    └────┬────┘
    ┌────┴────┐
    │Correct? │
    └────┬────┘
   YES   │   NO
    │    │    │
    ▼    │    ▼
MYSTERY  │  SCREEN SHAKE
SOLVED   │  "Incorrect combination"
(Win!)   │  Fragments returned to player
```

### 11.4 Solve Validation Logic

```javascript
function validateSolveAttempt(playerId, claimFragId, contextFragId, sourceFragId) {
    const mystery = getCurrentMystery();
    
    // All 3 fragments must belong to the same mystery
    const claimFrag = getFragment(claimFragId);
    const contextFrag = getFragment(contextFragId);
    const sourceFrag = getFragment(sourceFragId);
    
    // Validation checks:
    // 1. All fragments must be verified
    if (!claimFrag.isVerified || !contextFrag.isVerified || !sourceFrag.isVerified) {
        return { success: false, reason: "All fragments must be verified at the Library first." };
    }
    
    // 2. All fragments must be authentic (not forged)
    if (!claimFrag.isAuthentic || !contextFrag.isAuthentic || !sourceFrag.isAuthentic) {
        return { success: false, reason: "One or more fragments are forged!" };
    }
    
    // 3. Correct types
    if (claimFrag.fragmentType !== 'CLAIM' ||
        contextFrag.fragmentType !== 'CONTEXT' ||
        sourceFrag.fragmentType !== 'SOURCE') {
        return { success: false, reason: "Fragments are in the wrong slots." };
    }
    
    // 4. All belong to the current mystery
    if (claimFrag.mysteryId !== mystery.id ||
        contextFrag.mysteryId !== mystery.id ||
        sourceFrag.mysteryId !== mystery.id) {
        return { success: false, reason: "These fragments don't match the current mystery." };
    }
    
    // SUCCESS
    return { success: true };
}
```

---

## 12. INSTIGATOR SABOTAGE SYSTEM

### 12.1 Night Phase Abilities

Instigators gain two exclusive abilities during the Night Phase:

| Ability | Action | Duration | Limit | Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Building Lockout** | Interact with a public building's door | Instant | 1 building per Instigator per night | Locks the target building for **30 seconds** at the start of the next Day Phase |
| **Plant Forged Fragment** | Interact with any fragment spawn point | Instant | 1 fragment per Instigator per night | Places a forged Memory Fragment that appears identical to authentic ones |

### 12.2 Building Lockout Mechanics

```javascript
function lockBuilding(instigator, building) {
    // Validate: Night Phase only, Instigator only, public building only
    if (currentPhase !== PHASE.NIGHT) return;
    if (instigator.role !== 'INSTIGATOR') return;
    if (!['VILLAGE_HALL', 'LIBRARY', 'SCHOOL', 'CLINIC'].includes(building.type)) return;
    if (instigator.hasLockedBuildingThisNight) return;
    
    // Register lockout (applied at next Day Phase start)
    pendingLockouts.push({
        buildingId: building.id,
        instigatorId: instigator.id,
        lockDuration: 30000  // 30 seconds
    });
    
    instigator.hasLockedBuildingThisNight = true;
    
    // Visual feedback (Instigator only)
    showLockIcon(building, instigator);
    playSound('sfx_button_click');
}
```

### 12.3 Forged Fragment Properties

| Property | Authentic Fragment | Forged Fragment |
| :--- | :--- | :--- |
| World Appearance | Glowing scroll (identical) | Glowing scroll (identical) |
| Pickup Behavior | Normal pickup | Normal pickup |
| Clue Text | Points to correct next location | Points to **wrong** location or gives misleading text |
| Library Verification Result | "AUTHENTIC ✓" | "FORGED ✗" |
| Before Verification | Indistinguishable | Indistinguishable |

### 12.4 Forged Fragment Creation

```javascript
function plantForgedFragment(instigator, targetLocation, fragmentType) {
    if (currentPhase !== PHASE.NIGHT) return;
    if (instigator.role !== 'INSTIGATOR') return;
    if (instigator.hasPlantedFragmentThisNight) return;
    
    const mystery = getCurrentMystery();
    
    const forgedFragment = {
        id: generateUniqueId(),
        mysteryId: mystery.id,
        fragmentType: fragmentType,  // CLAIM | CONTEXT | SOURCE
        isAuthentic: false,
        title: getForgedTitle(mystery.id, fragmentType),
        description: getForgedDescription(mystery.id, fragmentType),
        iconAsset: getFragmentIcon(mystery.id, fragmentType), // Same icon as authentic
        spawnLocation: targetLocation,
        spawnTile: getRandomSpawnTile(targetLocation),
        clueText: getForgedClueText(mystery.id, fragmentType), // Misleading!
        nextFragmentHint: getWrongLocation(mystery.id, fragmentType),
        isPickedUp: false,
        heldByPlayerId: null,
        isVerified: false,
        plantedByInstigatorId: instigator.id
    };
    
    pendingForgedFragments.push(forgedFragment);
    instigator.hasPlantedFragmentThisNight = true;
}
```

### 12.5 Instigator Night Movement

During the Night Phase, Instigators:
- **Exit** their houses freely (door auto-unlocks for Instigators only)
- **Move** across the entire map (same speed as daytime)
- **Cannot** enter other players' houses
- **Can** enter public buildings (Village Hall, Library, School, Clinic)
- **Are invisible** to Survivors (Survivors are locked in houses with no map visibility)
- **Can see** other Instigators on the map

---

## 13. JUDGEMENT PHASE & VOTING SYSTEM

### 13.1 Phase Flow

```
Day Phase Timer Expires
         │
         ▼
All living players teleported to Village Square
         │
         ▼
60-second discussion + voting window opens
         │
    ┌────┴──────────────────┐
    │  DISCUSSION (open)    │
    │  Town Chat enabled    │
    │  Players discuss      │
    │  suspicions freely    │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │  NOMINATION           │
    │  Any player can       │
    │  nominate another     │
    │  for eviction         │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │  VOTING               │
    │  All living players   │
    │  vote BAN or FORGIVE  │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │  RESOLUTION           │
    │  Tally votes,         │
    │  apply result         │
    └────────────────────────┘
```

### 13.2 Nomination Rules

1. **Any living player** can nominate any other living player for eviction.
2. **Maximum 1 nomination** per Judgement Phase (first nomination locks).
3. **Self-nomination** is not allowed.
4. **No nomination:** If no one nominates within the first 30 seconds, the voting phase is skipped (no eviction this round).

### 13.3 Voting Mechanics

```javascript
function processVotes(nominatedPlayerId) {
    const livingPlayers = getAllLivingPlayers();
    const totalVoters = livingPlayers.length;
    
    // Each player votes: BAN or FORGIVE
    // Collect votes during the remaining Judgement time
    const banVotes = votes.filter(v => v.choice === 'BAN').length;
    const forgiveVotes = votes.filter(v => v.choice === 'FORGIVE').length;
    const abstentions = totalVoters - banVotes - forgiveVotes;
    
    // Resolution: Simple majority of TOTAL living players
    const majorityThreshold = Math.floor(totalVoters / 2) + 1;
    
    if (banVotes >= majorityThreshold) {
        // EVICTION
        evictPlayer(nominatedPlayerId);
    } else {
        // NO EVICTION (forgive, tie, or insufficient votes)
        showNoEvictionResult();
    }
}
```

### 13.4 Eviction Effects

```javascript
function evictPlayer(playerId) {
    const player = getPlayer(playerId);
    
    // 1. Play ban/sever VFX
    playVFX('vfx_ban_sever', player.position);
    playSound('sfx_ban_sever');
    
    // 2. Play dissolve animation on player sprite
    playAnimation(player.sprite, 'vfx_dissolve_player', 800);
    
    // 3. Mark player as eliminated
    player.isAlive = false;
    player.eliminationDay = currentDayNumber;
    player.eliminationReason = 'VOTED_OUT';
    
    // 4. Update player portrait to eliminated version
    updatePortrait(player, `port_avatar_${player.avatarId}_elim`);
    
    // 5. Reveal role ONLY at game end (not on eviction)
    // The eliminated player's role is NOT revealed to maintain mystery
    
    // 6. Broadcast eviction
    broadcastSystemMessage(`${player.displayName} has been evicted from the village.`);
    
    // 7. Eliminated player becomes spectator
    player.isSpectator = true;
}
```

### 13.5 Voting UI Data

```javascript
VoteState = {
    nominatedPlayerId: "player_004",
    nominatedPlayerName: "Player 4",
    nominatedPlayerAvatar: "spr_avatar_02",
    phase: "VOTING",          // DISCUSSION | NOMINATING | VOTING | RESOLVED
    timeRemaining: 18,
    totalVoters: 9,
    banVotes: 5,
    forgiveVotes: 3,
    abstentions: 1,
    localPlayerVote: "BAN",   // BAN | FORGIVE | null
    majorityThreshold: 5,
    result: null              // EVICTED | FORGIVEN | SKIPPED
};
```

---

## 14. CHAT & COMMUNICATION SYSTEM

### 14.1 Chat Modes

| Mode | Availability | Range | Visual | Who Can Read |
| :--- | :--- | :--- | :--- | :--- |
| **Proximity Chat** | Day Phase | 64px radius | Parchment `#E8D5A3`, no prefix | Players within 64px of sender |
| **Town Chat** | Judgement Phase | Global (all living) | Caution Amber `#F39C12`, `[TOWN]` prefix | All living players |
| **Instigator Private Chat** | Night Phase | Global (Instigators only) | Intrigue Violet `#8E44AD`, `[PRIVATE]` prefix | Instigators only |
| **System Messages** | Any Phase | Global | Linen White Bold `#F5F0E1`, `[SYSTEM]` prefix | All players |

### 14.2 Chat Message Structure

```javascript
ChatMessage = {
    id: "msg_001",
    senderId: "player_003",
    senderName: "Player 3",
    mode: "PROXIMITY",         // PROXIMITY | TOWN | INSTIGATOR | SYSTEM
    content: "I found a fragment at the Clinic.",
    timestamp: 1753455120000,
    position: { x: 128, y: 256 }  // Sender position (for proximity check)
};
```

### 14.3 Proximity Chat Implementation

```javascript
function sendProximityMessage(sender, content) {
    const PROXIMITY_RADIUS = 64; // pixels
    
    const message = createMessage(sender, content, 'PROXIMITY');
    
    // Deliver only to players within range
    getAllLivingPlayers().forEach(player => {
        const distance = getDistance(sender.position, player.position);
        if (distance <= PROXIMITY_RADIUS || player.id === sender.id) {
            deliverMessage(player, message);
        }
    });
}
```

### 14.4 Chat Restrictions per Phase

| Phase | Can Type? | Available Mode | Restricted From |
| :--- | :--- | :--- | :--- |
| Role Assignment | ✗ | None | All chat |
| Day Phase | ✓ | Proximity only | Town chat, private chat |
| Judgement Phase | ✓ | Town only | Proximity chat, private chat |
| Night Phase | Instigators only | Instigator Private only | All other modes |
| Game Over | ✓ | Town (unrestricted) | None — all roles revealed |

---

## 15. HUD & UI SYSTEM

### 15.1 HUD Components (Persistent Layer 2)

| Component | Position | Contents | Update Trigger |
| :--- | :--- | :--- | :--- |
| **Top Bar** | Top edge, full width (100% × 32px) | Phase name (left), Countdown Timer (center), Phase Icon (right) | Phase change, every second |
| **Player List Panel** | Left edge (120px × variable) | 10 player slots: Avatar icon, Name, Status (Alive/Fled/Evicted) | Player eviction, connection change |
| **Mystery Status Panel** | Right edge (140px × auto) | Mystery title, 3 fragment slots with status icons (✓/✗/—/🔒) | Fragment verification, mystery progress |
| **Chat Box** | Bottom-left (60% × 80px, expandable) | Scrollable message log, input field | New messages |
| **Inventory Slot** | Bottom-right (40% × 80px) | Held fragment display (1 slot max) | Fragment pickup/drop |

### 15.2 Player List Slot States

| State | Portrait | Name Color | Status Icon | Status Text |
| :--- | :--- | :--- | :--- | :--- |
| **Alive** | `port_avatar_XX_select` | Parchment `#E8D5A3` | None | "Alive" |
| **Evicted** | `port_avatar_XX_elim` (desaturated + red X) | Dusk Blue at 50% | 💀 Skull | "Evicted D#" |
| **Disconnected** | `port_avatar_anon` | Dusk Blue at 50% | ⚠️ Warning | "Disconnected" |
| **You (Self)** | `port_avatar_XX_select` + gold border | Linen White `#F5F0E1` | ★ Star | "You" |

### 15.3 Mystery Status Panel States

Each of the 3 fragment slots (Claim, Context, Source) displays a status icon:

| Fragment Status | Icon | Color | Meaning |
| :--- | :--- | :--- | :--- |
| **Not Found** | — (dash) | Parchment | Fragment has not been discovered yet |
| **Found (Unverified)** | 📜 Scroll | Caution Amber | Fragment found but not yet verified |
| **Verified Authentic** | ✓ Checkmark | Verified Green `#27AE60` | Fragment confirmed authentic at Library |
| **Verified Forged** | ✗ Cross | Alert Red `#C0392B` | Fragment confirmed forged at Library |
| **Locked** | 🔒 Lock | Dusk Blue | Fragment location is locked by Instigator |

### 15.4 Modal Priority Stack

Modals display in priority order (highest first). Only one modal active at a time:

1. **Role Assignment Modal** (unskippable, blocks all input)
2. **Game Over / Victory Modal** (blocks all input)
3. **Voting Modal** (blocks movement, allows vote input)
4. **Library Capacity Modal** (dismissible with OK)
5. **Solve Mystery Modal** (dismissible with Cancel)
6. **Building Lock Notification** (auto-dismiss after 3 seconds)

---

## 16. INVENTORY SYSTEM

### 16.1 Inventory Rules

| Rule | Specification |
| :--- | :--- |
| **Capacity** | 1 Memory Fragment maximum |
| **Pickup** | Press interaction key near a world fragment to collect |
| **Swap** | If holding a fragment and picking up another, the held fragment drops at the player's feet |
| **Drop** | Press drop key to voluntarily release the held fragment at current position |
| **Transfer** | Players cannot directly hand fragments to other players |
| **Eviction** | When a player is evicted, their held fragment drops at the Village Square |
| **Persistence** | Fragments persist through phase transitions; if a player enters Night Phase holding a fragment, they still hold it at Dawn |

### 16.2 Inventory HUD Display

```
┌──── INVENTORY ────────────────────────┐
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  📜 Herbal Cure Flyer          │  │
│  │  Type: CLAIM                    │  │
│  │  Mystery: The Counterfeit Cure  │  │
│  │  Status: ✓ VERIFIED            │  │
│  └─────────────────────────────────┘  │
│                                       │
│  [ DROP ]                             │
└───────────────────────────────────────┘
```

---

## 17. WIN CONDITION EVALUATION SYSTEM

### 17.1 Win Conditions

| Faction | Win Condition | Trigger | Priority |
| :--- | :--- | :--- | :--- |
| **Survivors** | **Mystery Solved** | A player submits 3 correct, verified, authentic fragments at the Village Statue | Checked at submission time |
| **Survivors** | **All Instigators Evicted** | All 3 Instigators have been voted out during Judgement Phases | Checked after every eviction |
| **Instigators** | **Voting Parity** | Number of remaining Survivors ≤ Number of remaining Instigators | Checked after every eviction |

### 17.2 Win Condition Evaluation Order

```javascript
function checkWinCondition() {
    const aliveSurvivors = getAlivePlayers().filter(p => p.role === 'SURVIVOR').length;
    const aliveInstigators = getAlivePlayers().filter(p => p.role === 'INSTIGATOR').length;
    
    // Check 1: Mystery Solved? (checked at solve submission, not here)
    // This is handled by validateSolveAttempt()
    
    // Check 2: All Instigators Evicted?
    if (aliveInstigators === 0) {
        return { winner: 'SURVIVORS', reason: 'ALL_INSTIGATORS_EVICTED' };
    }
    
    // Check 3: Instigator Parity?
    if (aliveSurvivors <= aliveInstigators) {
        return { winner: 'INSTIGATORS', reason: 'VOTING_PARITY' };
    }
    
    // No winner yet
    return null;
}
```

### 17.3 Win Condition Examples

| Scenario | Alive Survivors | Alive Instigators | Result |
| :--- | :--- | :--- | :--- |
| Start of game | 7 | 3 | Continue |
| After Day 1 (Survivor evicted) | 6 | 3 | Continue |
| After Day 2 (Instigator evicted) | 6 | 2 | Continue |
| After Day 3 (Survivor evicted) | 5 | 2 | Continue |
| After Day 4 (Survivor evicted) | 4 | 2 | Continue |
| After Day 5 (Survivor evicted) | 3 | 2 | Continue |
| After Day 6 (Survivor evicted) | **2** | **2** | **INSTIGATORS WIN** (parity) |
| After Day 2 (Instigator evicted) then Day 3 (Instigator evicted) then Day 4 (Instigator evicted) | 7 | **0** | **SURVIVORS WIN** (all evicted) |
| Mystery solved at any time | any | any | **SURVIVORS WIN** (mystery solved) |

---

## 18. PHASE TRANSITION & VISUAL FX SYSTEM

### 18.1 Color Temperature Overlays

| Transition | From | To | Duration | Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Day → Judgement** | `#FFF5E0` 8% | `#D4D4E8` 12% | 1000ms linear fade | Warm → Cool desaturation |
| **Judgement → Night** | `#D4D4E8` 12% | `#1A1A3E` 40% | 1000ms linear fade | Cool → Deep indigo darkness |
| **Night → Day** | `#1A1A3E` 40% | `#FFF5E0` 8% | 3000ms left-to-right sweep | Dawn sunrise gradient band |
| **Day → Day (new round)** | N/A | N/A | N/A | No transition (continuous) |

### 18.2 VFX Catalog

| VFX ID | Sprite Sheet | Frame Count | Duration | Trigger |
| :--- | :--- | :--- | :--- | :--- |
| `vfx_ban_sever` | 64×64 px, 8 frames | 8 | 800ms | Player eviction vote resolves |
| `vfx_dissolve_player` | 16×24 px, 8 frames | 8 | 800ms | Evicted player fades out |
| `vfx_verify_sparkle` | 24×24 px, 4 frames | 4 | 400ms loop | During Library verification (10s) |
| `vfx_statue_burst` | 64×64 px, 8 frames | 8 | 800ms | Mystery solved correctly |
| `vfx_solve_fail_shake` | Screen jitter | N/A | 300ms | Incorrect mystery submission |
| `vfx_dawn_sweep` | Gradient overlay | N/A | 3000ms | Night → Day transition |

### 18.3 Transition Implementation

```javascript
function transitionPhase(fromPhase, toPhase) {
    // Step 1: FREEZE
    inputManager.disableAll();
    
    // Step 2: ANIMATE
    const overlay = getPhaseOverlay(toPhase);
    tweenOverlay(currentOverlay, overlay, getTransitionDuration(fromPhase, toPhase));
    
    // Step 3: RELOCATE
    if (toPhase === PHASE.JUDGEMENT) {
        teleportAllLivingTo(VILLAGE_SQUARE_CENTER);
    } else if (toPhase === PHASE.NIGHT) {
        teleportAllToHouses();
    } else if (toPhase === PHASE.DAY) {
        // Play dawn sweep VFX
        playDawnSweep(3000);
    }
    
    // Step 4: RECONFIGURE
    updateMovementPermissions(toPhase);
    updateInteractionPermissions(toPhase);
    updateChatMode(toPhase);
    applyPendingLockouts();     // Apply instigator building locks
    spawnPendingFragments();    // Spawn instigator forged fragments
    
    // Step 5: RESUME
    inputManager.enableForPhase(toPhase);
    phaseTimer.start(getPhaseDuration(toPhase));
}
```

---

## 19. AUDIO SYSTEM

### 19.1 Sound Effect Catalog

| SFX ID | Duration | Trigger | Description |
| :--- | :--- | :--- | :--- |
| `sfx_button_click` | 50ms | Any button press | 8-bit click |
| `sfx_panel_open` | 150ms | Panel/modal opens | Paper unfurl & whoosh |
| `sfx_fragment_pickup` | 300ms | Player picks up fragment | 3-note ascending chime |
| `sfx_fragment_verified` | 500ms | Library verification completes (authentic) | Triumphant staccato chord |
| `sfx_solve_fail` | 400ms | Wrong submission / locked building | Low 2-tone descending buzzer |
| `sfx_bell_day` | 2000ms | Day Phase begins | Deep church bell toll |
| `sfx_bell_night` | 1500ms | Night Phase begins | Muffled echoing night bell |
| `sfx_ban_sever` | 1000ms | Player evicted | Electric crackle & sever tone |
| `mus_victory_fanfare` | 4000ms | Survivors win | Major key victory sting |
| `mus_defeat_sting` | 3000ms | Instigators win | Somber minor key defeat sting |

### 19.2 Audio Layering

```
Layer 0: Ambient Loop (persistent, phase-dependent volume)
Layer 1: Music Sting (one-shot, phase transitions & win/loss)
Layer 2: UI SFX (button clicks, panel opens, notifications)
Layer 3: Gameplay SFX (fragment pickup, verification, eviction)
```

### 19.3 Phase-Based Ambient

| Phase | Ambient Sound | Volume | Notes |
| :--- | :--- | :--- | :--- |
| Day | Birds, village bustle | 30% | Warm, safe feeling |
| Judgement | Wind, low tension drone | 40% | Uneasy, suspenseful |
| Night | Crickets, owl calls | 20% | Quiet, eerie |

---

## 20. CAMERA & RENDERING SYSTEM

### 20.1 Camera Configuration

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Type** | Orthographic (top-down) | No perspective, no tilt, no rotation |
| **Base Resolution** | 480×270 px | 16:9 aspect ratio, pixel-perfect |
| **Render Scale** | 3× (default) → 1440×810 px | Configurable: 2× (960×540), 3× (1440×810), 4× (1920×1080) |
| **Texture Filtering** | Point / Nearest Neighbor | No anti-aliasing, no bilinear filtering |
| **Camera Follow** | Tracks local player, centered | Smooth follow with 0.1 lerp factor |
| **Camera Bounds** | Clamped to map edges | Camera cannot show beyond map boundaries |
| **Pixel Snapping** | Enabled | All sprites snap to integer pixel positions |

### 20.2 Render Layer Order (Back to Front)

```
Z=0:  Ground tiles (grass, dirt, cobblestone)
Z=1:  Ground decals (fallen leaves, puddles, shadows)
Z=2:  Below-player props (rugs, floor items, paths)
Z=3:  Player shadows (elliptical shadow sprite)
Z=4:  Player sprites & NPCs (sorted by Y position for depth)
Z=5:  Above-player props (fences, barrels, signs)
Z=6:  Building walls & roofs
Z=7:  Tree canopies & roof overhangs (overlap layer)
Z=8:  Weather / particle effects (leaves, light beams)
Z=9:  Phase overlay (color temperature tint)
Z=10: HUD (persistent UI chrome)
Z=11: Modals (role assignment, voting, victory)
```

### 20.3 Y-Sorting for Depth

```javascript
// All entities on Z=4 are sorted by their Y position (foot position)
// so that characters "behind" objects appear behind them visually
function updateRenderOrder(entities) {
    entities.sort((a, b) => {
        const aFoot = a.y + a.height;  // Bottom of sprite = foot position
        const bFoot = b.y + b.height;
        return aFoot - bFoot;
    });
    
    entities.forEach((entity, index) => {
        entity.depth = Z_PLAYER_LAYER + (index * 0.001);
    });
}
```

---

## 21. NETWORKING & SYNCHRONIZATION MODEL

### 21.1 Architecture: Client-Server Authoritative

```
┌───────────────┐      WebSocket      ┌──────────────────┐
│  CLIENT 1     │◄────────────────────►│                  │
├───────────────┤                      │    GAME SERVER   │
│  CLIENT 2     │◄────────────────────►│  (Authoritative) │
├───────────────┤                      │                  │
│  ...          │◄────────────────────►│  - Role truth    │
├───────────────┤                      │  - Fragment auth │
│  CLIENT 10    │◄────────────────────►│  - Vote tally    │
└───────────────┘                      │  - Phase timing  │
                                       └──────────────────┘
```

### 21.2 Synchronization Strategy

| Data | Sync Method | Authority | Rate |
| :--- | :--- | :--- | :--- |
| **Player Position** | Client prediction + Server reconciliation | Server | 15 updates/sec |
| **Phase Timer** | Server-authoritative, client displays | Server | Every 1 second |
| **Fragment State** | Event-driven (pickup, drop, verify) | Server | On change |
| **Vote State** | Event-driven | Server | On vote cast |
| **Chat Messages** | Event-driven | Server (validation) | On send |
| **Building Occupancy** | Event-driven | Server | On enter/exit |

### 21.3 Network Messages (Key Events)

| Message Type | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `PLAYER_MOVE` | Client → Server | `{playerId, x, y, direction}` | Player movement input |
| `PLAYER_STATE_UPDATE` | Server → All | `{playerId, x, y, direction, animation}` | Broadcast player state |
| `FRAGMENT_PICKUP` | Client → Server | `{playerId, fragmentId}` | Request fragment pickup |
| `FRAGMENT_DROPPED` | Server → All | `{fragmentId, position}` | Fragment dropped at location |
| `VERIFICATION_START` | Client → Server | `{playerAId, playerBId}` | Start library verification |
| `VERIFICATION_RESULT` | Server → Players A&B | `{fragmentId, isAuthentic}` | Verification result (private) |
| `PHASE_CHANGE` | Server → All | `{newPhase, duration}` | Phase transition |
| `VOTE_CAST` | Client → Server | `{voterId, choice}` | Vote submission |
| `VOTE_RESULT` | Server → All | `{banVotes, forgiveVotes, result}` | Vote resolution |
| `CHAT_SEND` | Client → Server | `{senderId, content, mode}` | Chat message |
| `CHAT_RECEIVE` | Server → Eligible | `{message}` | Delivered chat message |
| `GAME_OVER` | Server → All | `{winner, reason, roleReveal[]}` | Game conclusion |

### 21.4 Latency Compensation

```javascript
// Client-side prediction for movement
function predictMovement(player, input, deltaTime) {
    const predictedPosition = {
        x: player.x + input.dx * PLAYER_SPEED * deltaTime,
        y: player.y + input.dy * PLAYER_SPEED * deltaTime
    };
    
    // Send input to server
    sendToServer('PLAYER_MOVE', {
        playerId: player.id,
        x: predictedPosition.x,
        y: predictedPosition.y,
        direction: input.direction,
        sequence: inputSequenceNumber++
    });
    
    // Apply prediction locally
    player.x = predictedPosition.x;
    player.y = predictedPosition.y;
    
    return predictedPosition;
}

// Server reconciliation on correction
function onServerCorrection(serverState) {
    const player = getLocalPlayer();
    const errorX = Math.abs(player.x - serverState.x);
    const errorY = Math.abs(player.y - serverState.y);
    
    if (errorX > CORRECTION_THRESHOLD || errorY > CORRECTION_THRESHOLD) {
        // Snap to server position
        player.x = serverState.x;
        player.y = serverState.y;
    }
}
```

---

## 22. ANTI-CHEAT & VALIDATION LAYER

### 22.1 Server-Side Validation Rules

| Action | Validation Check | Reject Condition |
| :--- | :--- | :--- |
| **Fragment Pickup** | Is player at fragment location? Is it Day Phase? | Distance > 24px from fragment, wrong phase |
| **Building Entry** | Is building unlocked? Is capacity available? | Building locked, Library at 2/2 capacity |
| **Vote Cast** | Is it Judgement Phase? Has player already voted? Is player alive? | Wrong phase, already voted, dead player |
| **Verification** | Are 2 players at podium? Do they hold fragments? | Not at podium, no fragments held |
| **Mystery Solve** | Are all 3 fragments verified & authentic? Correct mystery? | Unverified fragments, wrong mystery, forged |
| **Sabotage** | Is it Night Phase? Is player an Instigator? Has ability been used? | Wrong phase, not Instigator, already used |
| **Movement** | Is speed within bounds? Is phase allowing movement for this role? | Speed hack, movement in locked phase |
| **Chat** | Is mode valid for current phase? Is content within length limit? | Wrong chat mode, message too long (256 char max) |

### 22.2 Role Secrecy Enforcement

```javascript
// CRITICAL: Role information is NEVER sent to other clients
// Each client only knows their OWN role
// The server manages all role-dependent logic

// BAD (exposes roles to client):
broadcastToAll({ type: 'PLAYER_ROLES', roles: allPlayerRoles }); // NEVER DO THIS

// GOOD (private per-client):
sendToPlayer(player.id, { type: 'YOUR_ROLE', role: player.role }); // CORRECT
```

---

## 23. DATA STRUCTURES & ENTITY SCHEMAS

### 23.1 Player Entity

```javascript
Player = {
    // Identity
    id: "player_001",               // Unique session ID
    slot: 1,                        // P1-P10, maps to H1-H10
    displayName: "Alice",
    avatarId: "01",                 // Avatar 01-05
    
    // Role (server-only, private)
    role: "SURVIVOR",               // SURVIVOR | INSTIGATOR
    
    // State
    isAlive: true,
    isConnected: true,
    isSpectator: false,
    
    // Position & Movement
    x: 128,
    y: 256,
    direction: "SOUTH",             // NORTH | SOUTH | EAST | WEST
    currentAnimation: "idle_south",
    speed: 64,                      // px/sec
    
    // Location
    currentLocation: "EXTERIOR",    // EXTERIOR | VILLAGE_HALL | LIBRARY | SCHOOL | CLINIC | HOUSE_H01-H10
    houseId: "H01",                 // Assigned house
    
    // Inventory
    heldFragment: null,             // MemoryFragment or null
    
    // Voting
    currentVote: null,              // BAN | FORGIVE | null
    isNominated: false,
    
    // Night Abilities (Instigator only)
    hasLockedBuildingThisNight: false,
    hasPlantedFragmentThisNight: false,
    
    // Stats
    eliminationDay: null,
    eliminationReason: null         // VOTED_OUT | DISCONNECTED | null
};
```

### 23.2 Building Entity

```javascript
Building = {
    id: "LIBRARY",
    type: "LIBRARY",                // VILLAGE_HALL | LIBRARY | SCHOOL | CLINIC | HOUSE
    displayName: "The Library",
    
    // Exterior
    exteriorSprite: "spr_bldg_library",
    exteriorPosition: { x: 320, y: 160 },
    exteriorSize: { w: 80, h: 64 },
    doorTile: { x: 22, y: 14 },
    
    // Interior
    interiorMapId: "map_library_interior",
    interiorSize: { w: 10, h: 8 },         // in tiles
    entryTile: { x: 5, y: 7 },             // spawn point inside
    
    // State
    isLocked: false,
    lockRemainingMs: 0,
    occupants: [],                          // Array of playerIds
    maxCapacity: 2,                         // Library = 2, others = Infinity
    
    // Fragment spawn points (for current mystery)
    fragmentSpawnPoints: [
        { tileX: 3, tileY: 4, fragmentId: "frag_cure_source_01" }
    ],
    
    // Props & Interactables
    interactables: [
        { id: "prop_podium_verification", tileX: 5, tileY: 3, type: "VERIFICATION_PODIUM" },
        { id: "prop_terminal_database", tileX: 2, tileY: 2, type: "INSPECT" }
    ]
};
```

### 23.3 Game Session Entity

```javascript
GameSession = {
    // Session
    sessionId: "sess_abc123",
    roomCode: "DV-A3K9",
    
    // Game State
    currentPhase: "DAY_PHASE",              // All phase states
    currentDayNumber: 2,                    // Increments each Day Phase
    phaseTimerRemaining: 87000,             // ms remaining
    
    // Mystery
    currentMystery: Mystery,                // Full mystery object
    mysteryProgress: {
        claimFound: true,
        claimVerified: true,
        contextFound: true,
        contextVerified: false,
        sourceFound: false,
        sourceVerified: false
    },
    
    // Players
    players: [],                            // Array of 10 Player entities
    
    // Fragments
    worldFragments: [],                     // Fragments on the map
    heldFragments: [],                      // Fragments held by players
    
    // Pending Sabotage
    pendingLockouts: [],                    // Applied at next Day start
    pendingForgedFragments: [],             // Spawned at next Day start
    
    // History
    evictionHistory: [],                    // { day, playerId, role, votes }
    verificationHistory: [],               // { day, playerAId, playerBId, fragmentId, result }
    
    // Result
    winner: null,                           // SURVIVORS | INSTIGATORS | null
    winReason: null                         // MYSTERY_SOLVED | ALL_INSTIGATORS_EVICTED | VOTING_PARITY
};
```

---

## 24. EVENT BUS & SIGNAL ARCHITECTURE

### 24.1 Event Catalog

All game systems communicate through a centralized event bus:

| Event Name | Emitted By | Consumed By | Payload |
| :--- | :--- | :--- | :--- |
| `phase:changed` | PhaseManager | All systems | `{ from, to, duration }` |
| `phase:timerTick` | PhaseManager | HUD, Audio | `{ remaining, total }` |
| `phase:timerWarning` | PhaseManager | HUD, Audio | `{ remaining }` |
| `phase:timerExpired` | PhaseManager | GameStateController | `{ phase }` |
| `player:moved` | PlayerController | Renderer, Network | `{ id, x, y, dir }` |
| `player:enteredBuilding` | BuildingManager | HUD, Network | `{ playerId, buildingId }` |
| `player:exitedBuilding` | BuildingManager | HUD, Network | `{ playerId, buildingId }` |
| `player:evicted` | VotingSystem | PlayerManager, VFX, Audio | `{ playerId, day }` |
| `fragment:pickedUp` | FragmentManager | Inventory, HUD | `{ playerId, fragmentId }` |
| `fragment:dropped` | FragmentManager | World, HUD | `{ fragmentId, position }` |
| `fragment:verified` | VerificationSystem | MysteryStatus, HUD | `{ fragmentId, isAuthentic }` |
| `mystery:solved` | MysterySystem | WinCondition, VFX, Audio | `{ mysteryId }` |
| `mystery:solveFailed` | MysterySystem | VFX, Audio | `{ reason }` |
| `vote:cast` | VotingSystem | HUD | `{ voterId, choice }` |
| `vote:resolved` | VotingSystem | GameState, VFX | `{ result, banVotes, forgiveVotes }` |
| `chat:received` | ChatSystem | HUD | `{ message }` |
| `sabotage:buildingLocked` | SabotageSystem | BuildingManager | `{ buildingId, duration }` |
| `sabotage:fragmentPlanted` | SabotageSystem | FragmentManager | `{ fragment }` |
| `game:over` | WinCondition | All systems | `{ winner, reason }` |

### 24.2 Event Bus Implementation

```javascript
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
    }
    
    off(event, callback) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(event, handlers.filter(h => h.callback !== callback));
        }
    }
    
    emit(event, payload = {}) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(({ callback, context }) => {
                callback.call(context, payload);
            });
        }
    }
}

// Global singleton
const gameEvents = new EventBus();
```

---

## 25. CONFIGURATION CONSTANTS

### 25.1 Game Balance Constants

```javascript
const CONFIG = {
    // Players
    TOTAL_PLAYERS: 10,
    SURVIVOR_COUNT: 7,
    INSTIGATOR_COUNT: 3,
    
    // Phase Durations (seconds)
    ROLE_ASSIGNMENT_DURATION: 10,
    DAY_PHASE_DURATION: 120,
    JUDGEMENT_PHASE_DURATION: 60,
    NIGHT_PHASE_DURATION: 60,
    CHARACTER_SELECT_DURATION: 30,
    
    // Movement
    PLAYER_SPEED: 64,                   // px/sec
    TILE_SIZE: 16,                      // px
    
    // Library
    LIBRARY_MAX_CAPACITY: 2,
    VERIFICATION_DURATION: 10,          // seconds
    
    // Sabotage
    BUILDING_LOCK_DURATION: 30,         // seconds
    MAX_LOCKS_PER_INSTIGATOR_PER_NIGHT: 1,
    MAX_FORGED_FRAGMENTS_PER_INSTIGATOR_PER_NIGHT: 1,
    
    // Chat
    PROXIMITY_CHAT_RADIUS: 64,         // px
    MAX_MESSAGE_LENGTH: 256,           // characters
    
    // Voting
    NOMINATION_WINDOW: 30,             // seconds (first 30s of Judgement)
    
    // Reconnection
    RECONNECT_TIMEOUT: 30,             // seconds before bot takeover
    
    // Rendering
    BASE_RESOLUTION: { w: 480, h: 270 },
    DEFAULT_RENDER_SCALE: 3,
    
    // Network
    POSITION_SYNC_RATE: 15,            // updates per second
    CORRECTION_THRESHOLD: 4,           // px before snap correction
    
    // Timer Visual Thresholds
    TIMER_WARNING_THRESHOLD: 30,       // seconds (amber pulse)
    TIMER_CRITICAL_THRESHOLD: 10,      // seconds (red flash)
    
    // Role Reveal Modal
    UNDERSTOOD_BUTTON_DELAY: 2,        // seconds before clickable
    
    // Transition Durations
    PHASE_TRANSITION_FADE: 1000,       // ms
    DAWN_SWEEP_DURATION: 3000,         // ms
    
    // Fragment
    FRAGMENT_INTERACTION_RADIUS: 24,   // px
};
```

### 25.2 Mystery Configuration Data

```javascript
const MYSTERIES = [
    {
        id: "COUNTERFEIT_CURE",
        title: "The Counterfeit Cure",
        milTheme: "Medical Misinformation",
        narrativeIntro: "A mysterious herbal cure has been circulating through Dusk Village. Residents are falling ill, but the source remains unknown...",
        fragments: {
            claim: {
                id: "frag_cure_claim",
                title: "Herbal Cure Flyer",
                description: "A promotional flyer for an unregulated herbal cure.",
                location: "CLINIC",
                clueText: "The student ledger at the School may reveal more...",
                iconAsset: "ico_frag_cure_claim"
            },
            context: {
                id: "frag_cure_context",
                title: "Student Health Ledger",
                description: "A ledger showing a student falling ill after consuming a supplement.",
                location: "SCHOOL",
                clueText: "The Library's medical registry holds the final piece...",
                iconAsset: "ico_frag_cure_context"
            },
            source: {
                id: "frag_cure_source",
                title: "Medical Fraud Registry",
                description: "A medical registry proving the 'doctor' is a documented fraud.",
                location: "LIBRARY",
                clueText: "This is the source. Verify all fragments to solve the mystery.",
                iconAsset: "ico_frag_cure_source"
            }
        },
        forgedVariants: {
            claim: {
                title: "Approved Herbal Supplement",
                description: "An official-looking approval certificate for the herbal cure.",
                clueText: "Check the Village Hall for public health records..."
            },
            context: {
                title: "Student Recovery Log",
                description: "A log showing a student recovering thanks to the supplement.",
                clueText: "The Clinic has the treatment records..."
            },
            source: {
                title: "Licensed Practitioner Certificate",
                description: "A certificate showing the 'doctor' has valid medical credentials.",
                clueText: "Cross-reference with the School's health forms..."
            }
        }
    },
    // ... (4 more mysteries follow the same structure)
];
```

---

## APPENDIX A: COMPLETE INTERACTION MAP

### Player Interaction Matrix

| Interaction | Key | Phase | Location | Target | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Move** | WASD / Arrows | Day, Night (Instigators) | Any | — | Movement in 4 directions |
| **Interact** | E / Space | Day | Near fragment | Memory Fragment | Pickup fragment |
| **Interact** | E / Space | Day | At building door | Building | Enter building |
| **Interact** | E / Space | Day | At Library podium (2 players) | Podium | Start 10s verification |
| **Interact** | E / Space | Day | At Village Statue | Statue | Open Solve Mystery UI |
| **Interact** | E / Space | Night | At building door (Instigator) | Building | Lock building for 30s |
| **Interact** | E / Space | Night | At spawn point (Instigator) | Spawn Point | Plant forged fragment |
| **Drop Fragment** | Q | Day | Anywhere | Held fragment | Drop fragment at feet |
| **Open Chat** | Enter / T | Day, Judgement, Night | Any | Chat box | Focus chat input |
| **Send Message** | Enter | Day, Judgement, Night | Chat input focused | — | Send chat message |
| **Vote Ban** | Click BAN | Judgement | Village Square | Nominated player | Cast BAN vote |
| **Vote Forgive** | Click FORGIVE | Judgement | Village Square | Nominated player | Cast FORGIVE vote |
| **Nominate** | Click player in list | Judgement | Village Square | Any living player | Nominate for eviction |

---

## APPENDIX B: FULL PHASE PERMISSION MATRIX

| System / Action | Role Assignment | Day Phase | Judgement Phase | Night Phase (Survivor) | Night Phase (Instigator) | Game Over |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Movement | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Fragment Pickup | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Fragment Drop | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Building Entry | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Library Verification | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Solve Mystery | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Nominate Player | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Vote | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Proximity Chat | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Town Chat | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Instigator Chat | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Lock Building | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Plant Fragment | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

---

*End of Game Functionalities & Mechanics Specification — v1.0*
