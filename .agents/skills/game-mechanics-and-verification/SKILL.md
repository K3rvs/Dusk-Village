---
name: game-mechanics-and-verification
description: Mechanics for MIL clue matrix verification, fragment inventory state tracking, role permission enforcement, phase synchronization, and social deduction voting logic.
---

# Game Mechanics & Clue Verification Skill

This skill defines the game rules, role permissions, and logic mystery validation matrices for Dusk Village.

## 1. Clue Fragment & Verification Matrix

Each mystery in Dusk Village consists of a 3-part evidence structure:
1. **Claim Fragment**: Initial assertion found in public civic areas (e.g., Clinic, School, Village Hall).
2. **Context Fragment**: Background corroboration found in private/residential locations (e.g., Houses, Counselor logs).
3. **Source Fragment**: Official registry/file evidence only verifiable at the **Library**.

### Verification Logic Flow
```
Player collects Fragment -> Stores in inventory (Max 1 fragment)
  -> Travels to Library (Max 2 players inside)
  -> Submits Fragment to Library Archive terminal
  -> Server checks Fragment Authenticity (Authentic vs Instigator Forgery)
  -> Updates Mystery Ledger UI in Village Hall
```

## 2. Role Capabilities & Phase Matrix

| Role | Day Phase | Judgement Phase | Night Phase |
| :--- | :--- | :--- | :--- |
| **Survivor (7)** | Search fragments, verify evidence, enter buildings | Vote to evict suspected Instigators | Locked in House |
| **Instigator (3)** | Blend in, collect/plant fake fragments | Deflect, vote against Survivors | Free roam, Lock doors (30s lock) |

## 3. Server Game Loop Synchronization
- **Tick Rate**: 20 Hz server broadcast for player position interpolation.
- **Phase Timer**: Server-authoritative phase clock broadcast via WebSocket `PHASE_UPDATE`.
- **Win Condition Checks**: Evaluated after every Judgment eviction and after evidence submission.
