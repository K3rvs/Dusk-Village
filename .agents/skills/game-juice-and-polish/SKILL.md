---
name: game-juice-and-polish
description: Techniques for game feel, visual juice, screen shake, smooth camera lerping, dynamic lighting tint, particle VFX, interactive UI feedback, and audio cues.
---

# Game Juice & Polish Skill

This skill provides practical implementation guidelines for introducing "game juice"—the visual, auditory, and tactile feedback that makes a game feel alive and responsive.

## Core Juice Systems

### 1. Camera Dynamics & Smooth Follow
- **Camera Lerp**: Linear interpolation (`lerp = 0.1`) on player tracking to avoid rigid camera lock.
- **Screen Shake**: Subtle screenshake on key events:
  - Phase start/end transition: `shake(200ms, 0.005 intensity)`
  - Sabotage or eviction announcement: `shake(400ms, 0.015 intensity)`
- **World Bounds Constraints**: Smoothly keep camera clamped within map boundaries.

### 2. Atmospheric Day/Night Color Grading
- **Day Phase**: Warm, clear ambient tint (`0xffffff` full daylight).
- **Night Phase**: Deep blue dusk overlay (`0x1a2639` ambient tint or dark overlay mask with localized player flashlight/lantern glow).
- **Judgment Phase**: Eerie amber sunset tint (`0xffaa55`) signaling tense voting.

### 3. Particle Visual Effects (VFX)
- **Fragment Pickup**: Floating sparkle/star particles bursting outward on item acquisition.
- **Building Lock Sabotage**: Red smoke/sparkle particles emitted around door frames when locked.
- **Dust Footsteps**: Subtle ground dust puffs emitted at player's feet when moving.

### 4. Interactive Feedback & Floating Text
- Dynamic floating combat/verification text rising and fading (`+1 Fragment Verified`, `Door Locked!`).
- Smooth button hover scales (`1.0 -> 1.05`) with crisp click audio SFX.
