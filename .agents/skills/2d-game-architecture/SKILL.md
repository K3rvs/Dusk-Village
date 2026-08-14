---
name: 2d-game-architecture
description: Architecture patterns for 2D top-down games (Godot/Phaser inspired). Includes state machines for entity movement, action handling, interaction systems, clean network event decoupling, and scene stack management.
---

# 2D Game Architecture & State Machine Skill

This skill documents architectural patterns for 2D Top-Down games inspired by modern game engine workflows (Godot, Phaser 3, Unity 2D).

## Key Architectural Principles

### 1. Finite State Machines (FSM) for Entities
Entities (Players, NPCs, Interactive Objects) must transition through explicit states rather than relying on complex Boolean flags:
- **States**: `IDLE`, `WALK`, `INTERACTING`, `LOCKED`, `DEAD`.
- Each state defines:
  - `enter()`: Initialization, animation triggers, event subscriptions.
  - `update(delta)`: Per-frame physics, input reading, direction calculations.
  - `exit()`: Cleanup, stopping particle emitters, releasing input locks.

### 2. Scene Lifecycle & Layer Management
- **Boot Scene**: Preload minimal branding assets, font families, and config JSON.
- **Preloader Scene**: Batch load spritesheets, tilemaps, SFX, and UI graphics with progress bar.
- **Main World Scene**: Manages tilemap rendering, depth sorting (`depth = y`), entity groups, and physics collisions.
- **UI Scene (Overlay)**: Operates above the world scene for HUD, dialogue modals, minimap, and phase timers to prevent world pause interference.

### 3. Modular System Architecture
- **PlayerController**: Normalizes 8-directional input vector, applies acceleration/friction, and updates character spritesheet animations.
- **InteractionSystem**: Proximity trigger detection (AABB / radius check) showing dynamic key prompt UI (`[E]`).
- **NetworkClient**: Pub/Sub event bus bridging WebSocket messages (`ROLE_ASSIGNED`, `PHASE_CHANGE`, `FRAGMENT_PICKED`) directly to game scene handlers.
