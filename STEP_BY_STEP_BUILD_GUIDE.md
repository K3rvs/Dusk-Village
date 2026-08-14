# DUSK VILLAGE — COMPLETE STEP-BY-STEP BUILD GUIDE

**Document Version:** 1.0  
**Project Title:** Dusk Village  
**Engine:** Phaser 3 (JavaScript) · HTML5 Canvas  
**Architecture:** Client-Server (WebSocket)  
**Art Style:** 16-bit Pixel Art · 2D Top-Down  
**Last Updated:** 2026-07-25

---

## TABLE OF CONTENTS

- **PART 1: PROJECT FOUNDATION** (Steps 1–4)
- **PART 2: ASSET PIPELINE** (Steps 5–8)
- **PART 3: CORE ENGINE SYSTEMS** (Steps 9–14)
- **PART 4: GAME WORLD** (Steps 15–19)
- **PART 5: GAMEPLAY SYSTEMS** (Steps 20–27)
- **PART 6: MULTIPLAYER NETWORKING** (Steps 28–32)
- **PART 7: UI & HUD IMPLEMENTATION** (Steps 33–40)
- **PART 8: AUDIO & VISUAL POLISH** (Steps 41–44)
- **PART 9: TESTING, OPTIMIZATION & DEPLOYMENT** (Steps 45–50)

---

# PART 1: PROJECT FOUNDATION

---

## STEP 1: ENVIRONMENT SETUP & TOOLCHAIN

### 1.1 Required Software

Install the following tools on your development machine:

| Tool | Version | Purpose | Download |
| :--- | :--- | :--- | :--- |
| **Node.js** | 20 LTS or later | JavaScript runtime, package management | https://nodejs.org |
| **npm** | 10+ (bundled with Node) | Package manager | Bundled |
| **Visual Studio Code** | Latest | Code editor | https://code.visualstudio.com |
| **Aseprite** (or Piskel) | Latest | Pixel art sprite editor | https://www.aseprite.org |
| **Git** | Latest | Version control | https://git-scm.com |
| **Google Chrome** | Latest | Testing & DevTools | https://www.google.com/chrome |

### 1.2 VS Code Extensions

Install these extensions for optimal development:

- **ESLint** — JavaScript linting
- **Prettier** — Code formatting
- **Pixelart Viewer** — Preview pixel art at correct scale
- **Live Server** — Quick local dev server
- **GitLens** — Git history visualization

### 1.3 Verify Installation

Open a terminal and verify:

```bash
node --version    # Expected: v20.x.x or higher
npm --version     # Expected: 10.x.x or higher
git --version     # Expected: 2.x.x or higher
```

---

## STEP 2: PROJECT INITIALIZATION

### 2.1 Create the Project Directory Structure

The Dusk Village project uses the following directory structure. Your existing project at `c:\duskvillage` already has some of these directories:

```
c:\duskvillage\
│
├── assets/                          # All game assets
│   ├── sprites/                     # Sprite images
│   │   ├── buildings/               # Building exterior sprites
│   │   ├── characters/              # Player avatar sprite sheets
│   │   ├── icons/                   # Memory fragment & badge icons
│   │   ├── portraits/               # Player & role portraits
│   │   ├── props/                   # Outdoor & interior props
│   │   ├── terrain/                 # Ground tiles, trees, foliage
│   │   ├── ui/                      # UI panels, buttons, progress bars
│   │   └── vfx/                     # Visual effects sprite sheets
│   ├── tilemaps/                    # Tiled JSON map files
│   │   ├── village_exterior.json    # Main village map
│   │   ├── interior_village_hall.json
│   │   ├── interior_library.json
│   │   ├── interior_school.json
│   │   ├── interior_clinic.json
│   │   └── interior_house.json      # Shared house template
│   ├── audio/                       # Sound effects & music
│   │   ├── sfx/                     # UI & gameplay SFX
│   │   └── music/                   # Ambient loops & stings
│   └── fonts/                       # Pixel fonts
│       ├── Silkscreen-Regular.ttf
│       ├── Silkscreen-Bold.ttf
│       ├── PixelifySans-Regular.ttf
│       └── PixelifySans-Bold.ttf
│
├── src/                             # Source code
│   ├── client/                      # Client-side code (Phaser 3)
│   │   ├── main.js                  # Phaser game config & boot
│   │   ├── scenes/                  # Phaser scenes
│   │   │   ├── BootScene.js
│   │   │   ├── MenuScene.js
│   │   │   ├── LobbyScene.js
│   │   │   ├── CharacterSelectScene.js
│   │   │   ├── GameScene.js         # Main gameplay scene
│   │   │   ├── InteriorScene.js     # Building interiors
│   │   │   └── GameOverScene.js
│   │   ├── systems/                 # Game logic systems
│   │   │   ├── PhaseManager.js
│   │   │   ├── PlayerController.js
│   │   │   ├── FragmentManager.js
│   │   │   ├── VerificationSystem.js
│   │   │   ├── VotingSystem.js
│   │   │   ├── ChatSystem.js
│   │   │   ├── SabotageSystem.js
│   │   │   └── WinCondition.js
│   │   ├── ui/                      # HUD & UI components
│   │   │   ├── HUDManager.js
│   │   │   ├── TopBar.js
│   │   │   ├── PlayerListPanel.js
│   │   │   ├── MysteryStatusPanel.js
│   │   │   ├── ChatBox.js
│   │   │   ├── InventoryPanel.js
│   │   │   ├── VotingModal.js
│   │   │   ├── RoleAssignmentModal.js
│   │   │   ├── SolveMysteryModal.js
│   │   │   ├── LibraryCapacityModal.js
│   │   │   └── GameOverScreen.js
│   │   ├── entities/                # Game entities
│   │   │   ├── Player.js
│   │   │   ├── Building.js
│   │   │   ├── MemoryFragment.js
│   │   │   └── Interactable.js
│   │   ├── network/                 # Client networking
│   │   │   ├── SocketClient.js
│   │   │   └── MessageHandler.js
│   │   └── utils/                   # Shared utilities
│   │       ├── EventBus.js
│   │       ├── Constants.js
│   │       └── Helpers.js
│   │
│   └── server/                      # Server-side code (Node.js)
│       ├── server.js                # Express + WebSocket server entry
│       ├── GameSession.js           # Core game session manager
│       ├── RoomManager.js           # Lobby & room management
│       ├── PhaseManagerServer.js    # Authoritative phase control
│       ├── RoleAssigner.js          # Role assignment algorithm
│       ├── FragmentManagerServer.js # Authoritative fragment state
│       ├── VoteManagerServer.js     # Authoritative vote tallying
│       ├── ValidationLayer.js       # Anti-cheat & input validation
│       ├── MysteryRegistry.js       # Mystery data & solve validation
│       └── BotController.js         # AI bot for disconnected players
│
├── scripts/                         # Asset generation scripts (existing)
│   ├── generate_building_sprites.js
│   ├── generate_character_sprites.js
│   ├── generate_fragment_icons.js
│   ├── generate_props_sprites.js
│   ├── generate_terrain_sprites.js
│   ├── generate_ui_sprites.js
│   └── generate_vfx_sprites.js
│
├── public/                          # Static files served to browser
│   └── index.html                   # Entry HTML page
│
├── package.json                     # npm project config
├── webpack.config.js                # Bundler config (or Vite)
├── .gitignore
├── .eslintrc.json
│
├── GAME_ASSET_LIST.md               # Asset specification (existing)
├── GAME_FUNCTIONALITIES_AND_MECHANICS.md  # Functionalities doc (existing)
├── UNESCO GAME IDEA.md              # Game design document (existing)
├── UNESCO_Game_UI_Style_Guide.md    # UI style guide (existing)
└── village_layout_map.png           # Village layout reference (existing)
```

### 2.2 Initialize npm Project

```bash
cd c:\duskvillage
npm init -y
```

Edit the generated `package.json`:

```json
{
    "name": "dusk-village",
    "version": "1.0.0",
    "description": "10-Player Social Deduction Game for Media & Information Literacy",
    "main": "src/server/server.js",
    "scripts": {
        "dev:client": "webpack serve --mode development --open",
        "dev:server": "nodemon src/server/server.js",
        "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
        "build": "webpack --mode production",
        "start": "node src/server/server.js",
        "generate:sprites": "node scripts/generate_character_sprites.js && node scripts/generate_building_sprites.js && node scripts/generate_terrain_sprites.js && node scripts/generate_props_sprites.js && node scripts/generate_fragment_icons.js && node scripts/generate_ui_sprites.js && node scripts/generate_vfx_sprites.js",
        "lint": "eslint src/",
        "test": "jest"
    },
    "keywords": ["game", "social-deduction", "phaser3", "MIL", "multiplayer"],
    "license": "ISC"
}
```

### 2.3 Install Dependencies

```bash
# Core game engine
npm install phaser@3

# Server dependencies
npm install express ws uuid

# Build tools
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin copy-webpack-plugin

# Development utilities
npm install --save-dev nodemon concurrently eslint prettier

# Existing dependency (already installed)
# pngjs — used by sprite generation scripts
```

### 2.4 Create `.gitignore`

```gitignore
node_modules/
dist/
.env
*.log
.DS_Store
Thumbs.db
```

---

## STEP 3: BUILD TOOLING CONFIGURATION

### 3.1 Webpack Configuration

Create `webpack.config.js` in the project root:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/client/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(wav|mp3|ogg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(ttf|woff|woff2)$/,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            title: 'Dusk Village'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets', to: 'assets' }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public')
        },
        port: 8080,
        hot: true,
        proxy: [
            {
                context: ['/ws'],
                target: 'ws://localhost:3000',
                ws: true
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    }
};
```

### 3.2 ESLint Configuration

Create `.eslintrc.json`:

```json
{
    "env": {
        "browser": true,
        "node": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off",
        "semi": ["error", "always"],
        "quotes": ["error", "single"]
    }
}
```

### 3.3 HTML Entry Point

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Dusk Village - A 10-player multiplayer social deduction game promoting Media & Information Literacy.">
    <title>Dusk Village</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #1A1A2E;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
        }
        canvas {
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        }
    </style>
</head>
<body>
    <div id="game-container"></div>
</body>
</html>
```

---

## STEP 4: PHASER 3 GAME CONFIGURATION & BOOT

### 4.1 Main Entry Point

Create `src/client/main.js`:

```javascript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import LobbyScene from './scenes/LobbyScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';
import InteriorScene from './scenes/InteriorScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { CONFIG } from './utils/Constants.js';

const gameConfig = {
    type: Phaser.CANVAS,                    // Force Canvas (pixel art friendly)
    parent: 'game-container',
    width: CONFIG.BASE_RESOLUTION.w * CONFIG.DEFAULT_RENDER_SCALE,   // 1440
    height: CONFIG.BASE_RESOLUTION.h * CONFIG.DEFAULT_RENDER_SCALE,  // 810
    pixelArt: true,                         // Nearest-neighbor filtering globally
    roundPixels: true,                      // Snap to integer pixels
    antialias: false,                       // No anti-aliasing
    backgroundColor: '#1A1A2E',             // Midnight Panel
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },              // No gravity (top-down)
            debug: false                    // Set true during development
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONFIG.BASE_RESOLUTION.w * CONFIG.DEFAULT_RENDER_SCALE,
        height: CONFIG.BASE_RESOLUTION.h * CONFIG.DEFAULT_RENDER_SCALE
    },
    scene: [
        BootScene,
        MenuScene,
        LobbyScene,
        CharacterSelectScene,
        GameScene,
        InteriorScene,
        GameOverScene
    ]
};

const game = new Phaser.Game(gameConfig);

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.refresh();
});
```

### 4.2 Constants File

Create `src/client/utils/Constants.js`:

```javascript
export const CONFIG = {
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
    PLAYER_SPEED: 64,                   // px/sec (at base resolution)
    TILE_SIZE: 16,                      // px

    // Library
    LIBRARY_MAX_CAPACITY: 2,
    VERIFICATION_DURATION: 10,          // seconds

    // Sabotage
    BUILDING_LOCK_DURATION: 30,         // seconds
    MAX_LOCKS_PER_NIGHT: 1,
    MAX_FORGED_PER_NIGHT: 1,

    // Chat
    PROXIMITY_CHAT_RADIUS: 64,         // px
    MAX_MESSAGE_LENGTH: 256,

    // Voting
    NOMINATION_WINDOW: 30,             // seconds

    // Reconnection
    RECONNECT_TIMEOUT: 30,             // seconds

    // Rendering
    BASE_RESOLUTION: { w: 480, h: 270 },
    DEFAULT_RENDER_SCALE: 3,

    // Network
    POSITION_SYNC_RATE: 15,
    CORRECTION_THRESHOLD: 4,

    // Timer Thresholds
    TIMER_WARNING_THRESHOLD: 30,
    TIMER_CRITICAL_THRESHOLD: 10,

    // UI
    UNDERSTOOD_BUTTON_DELAY: 2,
    PHASE_TRANSITION_FADE: 1000,       // ms
    DAWN_SWEEP_DURATION: 3000,         // ms
    FRAGMENT_INTERACTION_RADIUS: 24,   // px
    HUD_SAFE_MARGIN: 12               // px
};

export const PHASES = {
    BOOT: 'BOOT',
    MENU: 'MENU',
    LOBBY: 'LOBBY',
    CHARACTER_SELECT: 'CHARACTER_SELECT',
    ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
    DAY_PHASE: 'DAY_PHASE',
    JUDGEMENT_PHASE: 'JUDGEMENT_PHASE',
    NIGHT_PHASE: 'NIGHT_PHASE',
    GAME_OVER: 'GAME_OVER'
};

export const ROLES = {
    SURVIVOR: 'SURVIVOR',
    INSTIGATOR: 'INSTIGATOR'
};

export const FRAGMENT_TYPES = {
    CLAIM: 'CLAIM',
    CONTEXT: 'CONTEXT',
    SOURCE: 'SOURCE'
};

export const BUILDINGS = {
    VILLAGE_HALL: 'VILLAGE_HALL',
    LIBRARY: 'LIBRARY',
    SCHOOL: 'SCHOOL',
    CLINIC: 'CLINIC',
    HOUSE: 'HOUSE',
    EXTERIOR: 'EXTERIOR'
};

export const CHAT_MODES = {
    PROXIMITY: 'PROXIMITY',
    TOWN: 'TOWN',
    INSTIGATOR: 'INSTIGATOR',
    SYSTEM: 'SYSTEM'
};

export const VOTE_CHOICES = {
    BAN: 'BAN',
    FORGIVE: 'FORGIVE'
};

export const COLORS = {
    // Environment
    HARVEST_GOLD: 0xC67D33,
    AUTUMN_OAK: 0xE67E22,
    MAPLE_CRIMSON: 0xA83232,
    WARM_TIMBER: 0x5C3A1E,
    DARK_ROAST: 0x3E2713,
    DEEP_CANOPY: 0x274E13,
    COBBLESTONE_GRAY: 0x8A9BA8,
    SLATE_GRAY: 0x4A5568,
    LANTERN_GLOW: 0xF6AD55,

    // UI Chrome
    MIDNIGHT_PANEL: 0x1A1A2E,
    DEEP_INDIGO: 0x16213E,
    DUSK_BLUE: 0x0F3460,
    PARCHMENT: 0xE8D5A3,
    LINEN_WHITE: 0xF5F0E1,
    ALERT_RED: 0xC0392B,
    VERIFIED_GREEN: 0x27AE60,
    CAUTION_AMBER: 0xF39C12,
    INTRIGUE_VIOLET: 0x8E44AD,

    // Phase Overlays (as CSS hex for tint)
    DAY_OVERLAY: 0xFFF5E0,
    JUDGEMENT_OVERLAY: 0xD4D4E8,
    NIGHT_OVERLAY: 0x1A1A3E
};
```

### 4.3 Event Bus

Create `src/client/utils/EventBus.js`:

```javascript
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback, context = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
        return this; // Allow chaining
    }

    once(event, callback, context = null) {
        const wrapper = (...args) => {
            callback.apply(context, args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper, context);
        return this;
    }

    off(event, callback) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(event, handlers.filter(h => h.callback !== callback));
        }
        return this;
    }

    emit(event, payload = {}) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(({ callback, context }) => {
                try {
                    callback.call(context, payload);
                } catch (error) {
                    console.error(`EventBus error on '${event}':`, error);
                }
            });
        }
        return this;
    }

    removeAllListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }
}

// Global singleton instance
export const gameEvents = new EventBus();
```

---

# PART 2: ASSET PIPELINE

---

## STEP 5: GENERATE ALL GAME SPRITES

### 5.1 Run Existing Sprite Generation Scripts

Your project already contains 7 sprite generation scripts in the `scripts/` directory. These use the `pngjs` library (already installed in `node_modules/`) to programmatically create all pixel art sprites.

Run all generators in sequence:

```bash
cd c:\duskvillage

# Generate all sprite assets
node scripts/generate_character_sprites.js
node scripts/generate_building_sprites.js
node scripts/generate_terrain_sprites.js
node scripts/generate_props_sprites.js
node scripts/generate_fragment_icons.js
node scripts/generate_ui_sprites.js
node scripts/generate_vfx_sprites.js
```

Or use the combined npm script:

```bash
npm run generate:sprites
```

### 5.2 Verify Generated Assets

After running the scripts, verify the following directories contain the expected files:

| Directory | Expected Files | Count |
| :--- | :--- | :--- |
| `assets/sprites/characters/` | `Chef.png`, `Construction Worker.png`, `Mechanic.png`, `Nurse.png`, `Office Worker.png`, `Police.png`, `spr_player_shadow.png` | 7 |
| `assets/sprites/portraits/` | `port_avatar_01_select.png` through `port_avatar_06_select.png`, `port_avatar_01_elim.png` through `port_avatar_06_elim.png`, `port_avatar_anon.png`, `port_role_survivor.png`, `port_role_instigator.png` | 15 |
| `assets/sprites/buildings/` | `spr_bldg_villagehall.png`, `spr_bldg_library.png`, `spr_bldg_school.png`, `spr_bldg_clinic.png`, `spr_bldg_cottages.png`, `spr_statue_angel.png`, `spr_gate_iron.png`, `spr_mailboxes.png`, `building_badges.png`, `tileset_buildings_master.png` | 10+ |
| `assets/sprites/terrain/` | `tile_ground_dirt.png`, `tile_ground_cobble.png`, `tile_ground_grass.png`, `tile_ground_stone.png`, `spr_tree_autumn_oak.png`, `spr_tree_pine_border.png`, `spr_foliage_bushes.png`, `spr_tall_grass.png`, `spr_fallen_leaves.png`, `spr_wall_octagonal.png`, `prop_fence_picket.png`, `tileset_terrain_trees.png` | 12+ |
| `assets/sprites/props/` | `outdoor_props.png`, `interior_props.png` | 2+ |
| `assets/sprites/icons/` | `memory_fragments.png`, `spr_frag_world_pulse.png` | 2+ |
| `assets/sprites/ui/` | `ui_panel_9slice_default.png`, `ui_panel_9slice_alert.png`, `ui_panel_9slice_success.png`, `ui_panel_9slice_secure.png`, `ui_btn_primary.png`, `ui_btn_danger_ban.png`, `ui_btn_ghost_forgive.png`, `ui_progress_vote.png`, `ui_atlas.png` | 9+ |
| `assets/sprites/vfx/` | `vfx_ban_sever.png`, `vfx_dissolve_player.png`, `vfx_verify_sparkle.png`, `vfx_statue_burst.png` | 4 |

### 5.3 Sprite Sheet Reference Chart

Each character avatar is a sprite sheet structured as follows:

```
256×72 px sprite sheet (16 columns × 3 rows of 16×24 px cells)

Row 0 (Walk Cycle):
[S0][S1][S2][S3] [N0][N1][N2][N3] [E0][E1][E2][E3] [W0][W1][W2][W3]
  South walk        North walk        East walk         West walk

Row 1 (Idle + Interact):
[SI0][SI1] [NI0][NI1] [EI0][EI1] [WI0][WI1] [INT0][INT1][INT2] [___]
  S idle     N idle     E idle     W idle     Interact/Pickup    (pad)

Row 2 (Elimination):
[D0][D1][D2][D3][D4][D5][D6][D7] [___][___][___][___][___][___][___][___]
  Dissolve animation (8 frames)     (padding)
```

**Frame naming convention for Phaser:**
```javascript
// When loading sprite sheets, define frames per animation:
this.anims.create({
    key: 'avatar_01_walk_south',
    frames: this.anims.generateFrameNumbers('spr_avatar_01', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});
```

---

## STEP 6: FONT ASSETS

### 6.1 Download Required Fonts

Download these two Google Fonts families:

1. **Silkscreen** — Display/Headers
   - Download from: https://fonts.google.com/specimen/Silkscreen
   - Files needed: `Silkscreen-Regular.ttf`, `Silkscreen-Bold.ttf`

2. **Pixelify Sans** — Body/UI Text
   - Download from: https://fonts.google.com/specimen/Pixelify+Sans
   - Files needed: `PixelifySans-Regular.ttf`, `PixelifySans-Medium.ttf`, `PixelifySans-Bold.ttf`

### 6.2 Install Fonts

Place all `.ttf` files in `assets/fonts/`:

```
assets/fonts/
├── Silkscreen-Regular.ttf
├── Silkscreen-Bold.ttf
├── PixelifySans-Regular.ttf
├── PixelifySans-Medium.ttf
└── PixelifySans-Bold.ttf
```

### 6.3 Load Fonts in Phaser

Fonts are loaded during the Boot Scene (see Step 9) using Phaser's `WebFontLoader` plugin or CSS `@font-face` declarations:

```css
/* Add to public/index.html <style> or a separate CSS file */
@font-face {
    font-family: 'Silkscreen';
    src: url('assets/fonts/Silkscreen-Regular.ttf') format('truetype');
    font-weight: 400;
}
@font-face {
    font-family: 'Silkscreen';
    src: url('assets/fonts/Silkscreen-Bold.ttf') format('truetype');
    font-weight: 700;
}
@font-face {
    font-family: 'Pixelify Sans';
    src: url('assets/fonts/PixelifySans-Regular.ttf') format('truetype');
    font-weight: 400;
}
@font-face {
    font-family: 'Pixelify Sans';
    src: url('assets/fonts/PixelifySans-Bold.ttf') format('truetype');
    font-weight: 700;
}
```

---

## STEP 7: TILEMAP CREATION WITH TILED

### 7.1 Install Tiled Map Editor

Download **Tiled** (free, open-source): https://www.mapeditor.org/

### 7.2 Create the Village Exterior Tilemap

This is the most critical asset — the main overworld map. Use `village_layout_map.png` as your reference.

#### 7.2.1 Map Properties

| Property | Value |
| :--- | :--- |
| **Orientation** | Orthogonal |
| **Tile Size** | 16×16 px |
| **Map Size** | 60×45 tiles (960×720 px at base resolution) |
| **Tile Render Order** | Right-Down |
| **Infinite Map** | No (fixed size) |

#### 7.2.2 Tilesets to Import

Import these tileset images into Tiled:

| Tileset Name | Image File | Tile Size | Notes |
| :--- | :--- | :--- | :--- |
| `terrain_ground` | `tile_ground_grass.png`, `tile_ground_dirt.png`, `tile_ground_cobble.png`, `tile_ground_stone.png` | 16×16 | Ground layer autotiles |
| `terrain_trees` | `tileset_terrain_trees.png` | 16×16 / 32×48 / 32×64 | Trees & foliage (multi-tile) |
| `buildings` | `tileset_buildings_master.png` | 16×16 | Building exteriors (multi-tile) |
| `props` | `outdoor_props.png` | 16×16 | Outdoor props & decorations |
| `walls_gates` | `spr_wall_octagonal.png`, `spr_gate_iron.png` | 16×16 | Perimeter wall & gates |

#### 7.2.3 Layer Setup (in Tiled)

Create these layers in the Tiled map editor, **in this exact order** (bottom to top):

| Layer # | Name | Type | Contents |
| :--- | :--- | :--- | :--- |
| 0 | `ground` | Tile Layer | Grass, dirt paths, cobblestone plaza |
| 1 | `ground_decals` | Tile Layer | Fallen leaves, flower patches, puddles |
| 2 | `paths` | Tile Layer | Stone walkways, dirt branch paths |
| 3 | `walls_lower` | Tile Layer | Octagonal perimeter wall base |
| 4 | `buildings_base` | Tile Layer | Building foundation & ground-level walls |
| 5 | `buildings_upper` | Tile Layer | Building roofs, upper walls |
| 6 | `props` | Object Layer | Benches, lamp posts, signs, barrels (positioned objects) |
| 7 | `trees_trunks` | Tile Layer | Tree trunks (collide) |
| 8 | `trees_canopy` | Tile Layer | Tree canopies (overlap, no collision) |
| 9 | `collision` | Object Layer | Invisible collision rectangles (buildings, walls, water) |
| 10 | `spawn_points` | Object Layer | Player spawn points, fragment spawn points, building doors |

#### 7.2.4 Object Layer Properties

In the `spawn_points` object layer, place the following named objects:

**Player House Spawns (10 points):**
```
Name: spawn_H01, Type: player_spawn, Properties: { houseId: "H01" }
Name: spawn_H02, Type: player_spawn, Properties: { houseId: "H02" }
... (through H10)
```

**Building Doors (4 doors + 10 houses):**
```
Name: door_village_hall, Type: building_door, Properties: { buildingId: "VILLAGE_HALL" }
Name: door_library, Type: building_door, Properties: { buildingId: "LIBRARY" }
Name: door_school, Type: building_door, Properties: { buildingId: "SCHOOL" }
Name: door_clinic, Type: building_door, Properties: { buildingId: "CLINIC" }
Name: door_H01, Type: building_door, Properties: { buildingId: "HOUSE_H01" }
... (through H10)
```

**Fragment Spawn Points (per mystery, conditionally active):**
```
Name: frag_spawn_clinic_01, Type: fragment_spawn, Properties: { location: "CLINIC" }
Name: frag_spawn_school_01, Type: fragment_spawn, Properties: { location: "SCHOOL" }
... (etc.)
```

**Village Square Center:**
```
Name: village_square_center, Type: teleport_point
Name: statue_interaction, Type: interaction_point, Properties: { action: "SOLVE_MYSTERY" }
```

#### 7.2.5 Exporting the Map

Export from Tiled as **JSON** format:
- File → Export As → `village_exterior.json`
- Save to: `assets/tilemaps/village_exterior.json`
- Embed tilesets: **Yes** (or reference external tilesets with relative paths)

### 7.3 Create Interior Tilemaps

Create 5 separate interior maps:

| Map File | Size | Building | Key Objects |
| :--- | :--- | :--- | :--- |
| `interior_village_hall.json` | 12×10 tiles | Village Hall | Council table, ledger lectern, filing cabinet, mystery-specific props |
| `interior_library.json` | 10×8 tiles | Library | **Verification podium** (central), database terminal, shelves, registry books |
| `interior_school.json` | 10×8 tiles | School | Student desks, chalkboard, lockers, counselor desk |
| `interior_clinic.json` | 8×6 tiles | Clinic | Intake desk, medicine cabinet, examination table, flyers |
| `interior_house.json` | 6×5 tiles | Houses (shared template) | Bed, writing desk, door |

Each interior map should have the same layer structure:

```
Layer 0: floor (tile layer)
Layer 1: walls (tile layer)
Layer 2: furniture (tile layer — collision)
Layer 3: props (object layer — interactables)
Layer 4: collision (object layer — invisible colliders)
Layer 5: spawn_points (object layer — entry/exit, fragment spawns, interaction points)
```

### 7.4 Map Coordinate Reference

Based on `village_layout_map.png`, here are approximate tile positions for key locations on the 60×45 tile exterior map:

| Location | Tile X | Tile Y | Size (Tiles) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Village Square Center** | 30 | 22 | — | Statue at center |
| **Village Hall (North)** | 27 | 5 | 6×5 | Centered top |
| **Library (East)** | 45 | 18 | 5×4 | Right side |
| **School (South)** | 28 | 35 | 4×4 | Centered bottom |
| **Clinic (West)** | 10 | 18 | 4×3 | Left side |
| **H01** | 18 | 6 | 3×3 | Upper-left area |
| **H02** | 38 | 6 | 3×3 | Upper-right area |
| **H03** | 48 | 10 | 3×3 | Right-upper area |
| **H04** | 50 | 24 | 3×3 | Right-middle area |
| **H05** | 48 | 34 | 3×3 | Right-lower area |
| **H06** | 38 | 38 | 3×3 | Lower-right area |
| **H07** | 22 | 38 | 3×3 | Lower-left area |
| **H08** | 8 | 34 | 3×3 | Left-lower area |
| **H09** | 5 | 24 | 3×3 | Left-middle area |
| **H10** | 8 | 10 | 3×3 | Left-upper area |

---

## STEP 8: AUDIO ASSET CREATION

### 8.1 Sound Effect Production

Create all SFX as `.wav` files (16-bit, 44100 Hz mono) using a tool like **sfxr**, **Bfxr**, or **ChipTone** (all free 8-bit sound generators):

| SFX ID | File | Duration | How to Create |
| :--- | :--- | :--- | :--- |
| `sfx_button_click` | `audio/sfx/button_click.wav` | 50ms | Short blip/click, high frequency |
| `sfx_panel_open` | `audio/sfx/panel_open.wav` | 150ms | Whoosh/sweep upward |
| `sfx_fragment_pickup` | `audio/sfx/fragment_pickup.wav` | 300ms | 3-note ascending chime (C-E-G) |
| `sfx_fragment_verified` | `audio/sfx/fragment_verified.wav` | 500ms | Triumphant chord (C-E-G-C) |
| `sfx_solve_fail` | `audio/sfx/solve_fail.wav` | 400ms | 2-note descend (E-C), buzzy |
| `sfx_bell_day` | `audio/sfx/bell_day.wav` | 2000ms | Deep bell toll, resonant |
| `sfx_bell_night` | `audio/sfx/bell_night.wav` | 1500ms | Muffled bell, lower pitch |
| `sfx_ban_sever` | `audio/sfx/ban_sever.wav` | 1000ms | Electric crackle + sever |
| `mus_victory_fanfare` | `audio/music/victory_fanfare.wav` | 4000ms | Major key fanfare (C major) |
| `mus_defeat_sting` | `audio/music/defeat_sting.wav` | 3000ms | Minor key sting (A minor) |

### 8.2 Ambient Loops

Create 3 ambient loops (loopable `.ogg` or `.wav`):

| Ambient ID | File | Duration | Description |
| :--- | :--- | :--- | :--- |
| `amb_day` | `audio/music/ambient_day.ogg` | 30–60s loop | Birds chirping, gentle wind, distant village sounds |
| `amb_judgement` | `audio/music/ambient_judgement.ogg` | 30–60s loop | Low wind drone, subtle tension |
| `amb_night` | `audio/music/ambient_night.ogg` | 30–60s loop | Crickets, owl hoots, quiet eerie atmosphere |

### 8.3 Audio File Format Guidelines

- **SFX:** `.wav` format (uncompressed, fast loading)
- **Music/Ambient:** `.ogg` format (compressed, smaller file size)
- **Sample Rate:** 44100 Hz
- **Channels:** Mono (SFX), Stereo (Ambient)
- **Bit Depth:** 16-bit

---

# PART 3: CORE ENGINE SYSTEMS

---

## STEP 9: BOOT SCENE — ASSET LOADING

### 9.1 Create BootScene.js

Create `src/client/scenes/BootScene.js`:

```javascript
import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // === LOADING BAR ===
        const { width, height } = this.cameras.main;
        const barWidth = width * 0.5;
        const barHeight = 16;
        const barX = (width - barWidth) / 2;
        const barY = height / 2;

        // Background bar
        const bgBar = this.add.rectangle(barX, barY, barWidth, barHeight, 0x0F3460);
        bgBar.setOrigin(0, 0.5);

        // Fill bar
        const fillBar = this.add.rectangle(barX + 2, barY, 0, barHeight - 4, 0x27AE60);
        fillBar.setOrigin(0, 0.5);

        // Loading text
        const loadingText = this.add.text(width / 2, barY - 30, 'LOADING...', {
            fontFamily: 'Silkscreen, "Press Start 2P", monospace',
            fontSize: '24px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        // Progress callback
        this.load.on('progress', (value) => {
            fillBar.width = (barWidth - 4) * value;
        });

        this.load.on('complete', () => {
            loadingText.setText('READY');
        });

        // === LOAD ALL ASSETS ===

        // --- Character Sprites ---
        const avatarFiles = ['Chef.png', 'Construction Worker.png', 'Mechanic.png', 'Nurse.png', 'Office Worker.png', 'Police.png'];
        avatarFiles.forEach((file, index) => {
            const id = String(index + 1).padStart(2, '0');
            this.load.spritesheet(`spr_avatar_${id}`, `assets/sprites/characters/${file}`, {
                frameWidth: 16,
                frameHeight: 24
            });
        });
        this.load.image('spr_player_shadow', 'assets/sprites/characters/spr_player_shadow.png');

        // --- Portraits ---
        for (let i = 1; i <= 6; i++) {
            const id = String(i).padStart(2, '0');
            this.load.image(`port_avatar_${id}_select`, `assets/sprites/portraits/port_avatar_${id}_select.png`);
            this.load.image(`port_avatar_${id}_elim`, `assets/sprites/portraits/port_avatar_${id}_elim.png`);
        }
        this.load.image('port_avatar_anon', 'assets/sprites/portraits/port_avatar_anon.png');
        this.load.image('port_role_survivor', 'assets/sprites/portraits/port_role_survivor.png');
        this.load.image('port_role_instigator', 'assets/sprites/portraits/port_role_instigator.png');

        // --- Buildings ---
        this.load.image('spr_bldg_villagehall', 'assets/sprites/buildings/spr_bldg_villagehall.png');
        this.load.image('spr_bldg_library', 'assets/sprites/buildings/spr_bldg_library.png');
        this.load.image('spr_bldg_school', 'assets/sprites/buildings/spr_bldg_school.png');
        this.load.image('spr_bldg_clinic', 'assets/sprites/buildings/spr_bldg_clinic.png');
        this.load.image('spr_bldg_cottages', 'assets/sprites/buildings/spr_bldg_cottages.png');
        this.load.image('spr_statue_angel', 'assets/sprites/buildings/spr_statue_angel.png');
        this.load.image('spr_gate_iron', 'assets/sprites/buildings/spr_gate_iron.png');
        this.load.image('spr_mailboxes', 'assets/sprites/buildings/spr_mailboxes.png');
        this.load.image('building_badges', 'assets/sprites/buildings/building_badges.png');
        this.load.image('tileset_buildings_master', 'assets/sprites/buildings/tileset_buildings_master.png');

        // --- Terrain ---
        this.load.image('tile_ground_dirt', 'assets/sprites/terrain/tile_ground_dirt.png');
        this.load.image('tile_ground_cobble', 'assets/sprites/terrain/tile_ground_cobble.png');
        this.load.image('tile_ground_grass', 'assets/sprites/terrain/tile_ground_grass.png');
        this.load.image('tile_ground_stone', 'assets/sprites/terrain/tile_ground_stone.png');
        this.load.image('spr_tree_autumn_oak', 'assets/sprites/terrain/spr_tree_autumn_oak.png');
        this.load.image('spr_tree_pine_border', 'assets/sprites/terrain/spr_tree_pine_border.png');
        this.load.image('spr_foliage_bushes', 'assets/sprites/terrain/spr_foliage_bushes.png');
        this.load.spritesheet('spr_tall_grass', 'assets/sprites/terrain/spr_tall_grass.png', {
            frameWidth: 16, frameHeight: 24
        });
        this.load.spritesheet('spr_fallen_leaves', 'assets/sprites/terrain/spr_fallen_leaves.png', {
            frameWidth: 16, frameHeight: 16
        });
        this.load.image('spr_wall_octagonal', 'assets/sprites/terrain/spr_wall_octagonal.png');
        this.load.image('prop_fence_picket', 'assets/sprites/terrain/prop_fence_picket.png');
        this.load.image('tileset_terrain_trees', 'assets/sprites/terrain/tileset_terrain_trees.png');

        // --- Props ---
        this.load.image('outdoor_props', 'assets/sprites/props/outdoor_props.png');
        this.load.image('interior_props', 'assets/sprites/props/interior_props.png');

        // --- Icons ---
        this.load.spritesheet('memory_fragments', 'assets/sprites/icons/memory_fragments.png', {
            frameWidth: 16, frameHeight: 16
        });
        this.load.spritesheet('spr_frag_world_pulse', 'assets/sprites/icons/spr_frag_world_pulse.png', {
            frameWidth: 16, frameHeight: 16
        });

        // --- UI ---
        this.load.image('ui_panel_default', 'assets/sprites/ui/ui_panel_9slice_default.png');
        this.load.image('ui_panel_alert', 'assets/sprites/ui/ui_panel_9slice_alert.png');
        this.load.image('ui_panel_success', 'assets/sprites/ui/ui_panel_9slice_success.png');
        this.load.image('ui_panel_secure', 'assets/sprites/ui/ui_panel_9slice_secure.png');
        this.load.image('ui_btn_primary', 'assets/sprites/ui/ui_btn_primary.png');
        this.load.image('ui_btn_danger_ban', 'assets/sprites/ui/ui_btn_danger_ban.png');
        this.load.image('ui_btn_ghost_forgive', 'assets/sprites/ui/ui_btn_ghost_forgive.png');
        this.load.image('ui_progress_vote', 'assets/sprites/ui/ui_progress_vote.png');
        this.load.image('ui_atlas', 'assets/sprites/ui/ui_atlas.png');

        // --- VFX ---
        this.load.spritesheet('vfx_ban_sever', 'assets/sprites/vfx/vfx_ban_sever.png', {
            frameWidth: 64, frameHeight: 64
        });
        this.load.spritesheet('vfx_dissolve_player', 'assets/sprites/vfx/vfx_dissolve_player.png', {
            frameWidth: 16, frameHeight: 24
        });
        this.load.spritesheet('vfx_verify_sparkle', 'assets/sprites/vfx/vfx_verify_sparkle.png', {
            frameWidth: 24, frameHeight: 24
        });
        this.load.spritesheet('vfx_statue_burst', 'assets/sprites/vfx/vfx_statue_burst.png', {
            frameWidth: 64, frameHeight: 64
        });

        // --- Tilemaps ---
        this.load.tilemapTiledJSON('map_village_exterior', 'assets/tilemaps/village_exterior.json');
        this.load.tilemapTiledJSON('map_interior_village_hall', 'assets/tilemaps/interior_village_hall.json');
        this.load.tilemapTiledJSON('map_interior_library', 'assets/tilemaps/interior_library.json');
        this.load.tilemapTiledJSON('map_interior_school', 'assets/tilemaps/interior_school.json');
        this.load.tilemapTiledJSON('map_interior_clinic', 'assets/tilemaps/interior_clinic.json');
        this.load.tilemapTiledJSON('map_interior_house', 'assets/tilemaps/interior_house.json');

        // --- Audio ---
        this.load.audio('sfx_button_click', 'assets/audio/sfx/button_click.wav');
        this.load.audio('sfx_panel_open', 'assets/audio/sfx/panel_open.wav');
        this.load.audio('sfx_fragment_pickup', 'assets/audio/sfx/fragment_pickup.wav');
        this.load.audio('sfx_fragment_verified', 'assets/audio/sfx/fragment_verified.wav');
        this.load.audio('sfx_solve_fail', 'assets/audio/sfx/solve_fail.wav');
        this.load.audio('sfx_bell_day', 'assets/audio/sfx/bell_day.wav');
        this.load.audio('sfx_bell_night', 'assets/audio/sfx/bell_night.wav');
        this.load.audio('sfx_ban_sever', 'assets/audio/sfx/ban_sever.wav');
        this.load.audio('mus_victory_fanfare', 'assets/audio/music/victory_fanfare.wav');
        this.load.audio('mus_defeat_sting', 'assets/audio/music/defeat_sting.wav');
        this.load.audio('amb_day', 'assets/audio/music/ambient_day.ogg');
        this.load.audio('amb_judgement', 'assets/audio/music/ambient_judgement.ogg');
        this.load.audio('amb_night', 'assets/audio/music/ambient_night.ogg');
    }

    create() {
        // === CREATE ALL ANIMATIONS ===
        this.createCharacterAnimations();
        this.createVFXAnimations();
        this.createWorldAnimations();

        // Transition to Menu
        this.scene.start('MenuScene');
    }

    createCharacterAnimations() {
        for (let i = 1; i <= 6; i++) {
            const id = String(i).padStart(2, '0');
            const key = `spr_avatar_${id}`;

            // Walk cycles (4 frames each, 4 directions)
            const directions = ['south', 'north', 'east', 'west'];
            directions.forEach((dir, dirIndex) => {
                const startFrame = dirIndex * 4;
                this.anims.create({
                    key: `avatar_${id}_walk_${dir}`,
                    frames: this.anims.generateFrameNumbers(key, {
                        start: startFrame,
                        end: startFrame + 3
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            });

            // Idle breathing (2 frames each, 4 directions)
            directions.forEach((dir, dirIndex) => {
                const startFrame = 16 + (dirIndex * 2); // Row 1
                this.anims.create({
                    key: `avatar_${id}_idle_${dir}`,
                    frames: this.anims.generateFrameNumbers(key, {
                        start: startFrame,
                        end: startFrame + 1
                    }),
                    frameRate: 2,
                    repeat: -1
                });
            });

            // Interact / Pickup (3 frames)
            this.anims.create({
                key: `avatar_${id}_interact`,
                frames: this.anims.generateFrameNumbers(key, {
                    start: 24, end: 26 // Row 1, after idles
                }),
                frameRate: 10,
                repeat: 0
            });

            // Elimination dissolve (8 frames)
            this.anims.create({
                key: `avatar_${id}_dissolve`,
                frames: this.anims.generateFrameNumbers(key, {
                    start: 32, end: 39 // Row 2
                }),
                frameRate: 10,
                repeat: 0
            });
        }
    }

    createVFXAnimations() {
        // Ban sever (8 frames)
        this.anims.create({
            key: 'vfx_ban_sever_play',
            frames: this.anims.generateFrameNumbers('vfx_ban_sever', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });

        // Dissolve player (8 frames)
        this.anims.create({
            key: 'vfx_dissolve_play',
            frames: this.anims.generateFrameNumbers('vfx_dissolve_player', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });

        // Verify sparkle (4 frames, looping during verification)
        this.anims.create({
            key: 'vfx_sparkle_play',
            frames: this.anims.generateFrameNumbers('vfx_verify_sparkle', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Statue burst (8 frames)
        this.anims.create({
            key: 'vfx_statue_burst_play',
            frames: this.anims.generateFrameNumbers('vfx_statue_burst', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
    }

    createWorldAnimations() {
        // Fragment world pulse (2 frames)
        this.anims.create({
            key: 'frag_world_pulse',
            frames: this.anims.generateFrameNumbers('spr_frag_world_pulse', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });

        // Tall grass sway (2 frames)
        this.anims.create({
            key: 'tall_grass_sway',
            frames: this.anims.generateFrameNumbers('spr_tall_grass', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });

        // Fallen leaves drift (3 frames)
        this.anims.create({
            key: 'leaves_drift',
            frames: this.anims.generateFrameNumbers('spr_fallen_leaves', { start: 0, end: 2 }),
            frameRate: 3,
            repeat: -1
        });
    }
}
```

---

## STEP 10: MENU SCENE

### 10.1 Create MenuScene.js

Create `src/client/scenes/MenuScene.js`:

```javascript
import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.cameras.main.setBackgroundColor(COLORS.MIDNIGHT_PANEL);

        // Title
        this.add.text(width / 2, height * 0.25, 'DUSK VILLAGE', {
            fontFamily: 'Silkscreen',
            fontSize: '48px',
            color: '#F5F0E1',
            stroke: '#0F3460',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height * 0.35, 'A Social Deduction Mystery', {
            fontFamily: 'Pixelify Sans',
            fontSize: '20px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        // Create Room Button
        this.createButton(width / 2, height * 0.55, 'CREATE ROOM', () => {
            this.scene.start('LobbyScene', { isHost: true });
        });

        // Join Room Button
        this.createButton(width / 2, height * 0.65, 'JOIN ROOM', () => {
            this.scene.start('LobbyScene', { isHost: false });
        });

        // Settings Button
        this.createButton(width / 2, height * 0.75, 'SETTINGS', () => {
            // Open settings panel (audio, controls, display)
        });

        // Version text
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontFamily: 'Pixelify Sans',
            fontSize: '12px',
            color: '#0F3460'
        }).setOrigin(1, 1);
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#E8D5A3',
            backgroundColor: '#0F3460',
            padding: { left: 24, right: 24, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setColor('#F5F0E1');
            btn.setBackgroundColor('#1A5276');
        });
        btn.on('pointerout', () => {
            btn.setColor('#E8D5A3');
            btn.setBackgroundColor('#0F3460');
        });
        btn.on('pointerdown', () => {
            this.sound.play('sfx_button_click', { volume: 0.5 });
            callback();
        });

        return btn;
    }
}
```

---

## STEP 11: LOBBY SCENE

### 11.1 Create LobbyScene.js

Create `src/client/scenes/LobbyScene.js`:

```javascript
import Phaser from 'phaser';
import { CONFIG, COLORS } from '../utils/Constants.js';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
    }

    init(data) {
        this.isHost = data.isHost || false;
        this.players = [];
        this.roomCode = '';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.cameras.main.setBackgroundColor(COLORS.MIDNIGHT_PANEL);

        // Title
        this.add.text(width / 2, 40, 'LOBBY', {
            fontFamily: 'Silkscreen',
            fontSize: '32px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        // Room code display
        this.roomCodeText = this.add.text(width / 2, 80, 'Room: ------', {
            fontFamily: 'Pixelify Sans',
            fontSize: '20px',
            color: '#F39C12'
        }).setOrigin(0.5);

        // Player slots (10 slots arranged in 2 columns of 5)
        this.playerSlots = [];
        for (let i = 0; i < CONFIG.TOTAL_PLAYERS; i++) {
            const col = i < 5 ? 0 : 1;
            const row = i % 5;
            const slotX = width * 0.3 + col * (width * 0.4);
            const slotY = 130 + row * 50;

            const slot = this.createPlayerSlot(slotX, slotY, i + 1);
            this.playerSlots.push(slot);
        }

        // Player count text
        this.playerCountText = this.add.text(width / 2, height - 100, '0 / 10 Players', {
            fontFamily: 'Pixelify Sans',
            fontSize: '18px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        // Start button (host only)
        if (this.isHost) {
            this.startButton = this.createButton(width / 2, height - 50, 'START GAME', () => {
                this.startGame();
            });
            this.startButton.setAlpha(0.5); // Disabled until all ready
        }

        // Back button
        this.createButton(60, height - 30, '← BACK', () => {
            this.scene.start('MenuScene');
        });

        // Connect to server
        this.connectToServer();
    }

    createPlayerSlot(x, y, slotNumber) {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, 250, 40, 0x16213E);
        bg.setStrokeStyle(2, 0x0F3460);

        // Slot number
        const numText = this.add.text(-110, 0, `P${slotNumber}`, {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#0F3460'
        }).setOrigin(0, 0.5);

        // Player name (empty)
        const nameText = this.add.text(-70, 0, 'Waiting...', {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#0F3460'
        }).setOrigin(0, 0.5);

        // Ready indicator
        const readyText = this.add.text(100, 0, '', {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#27AE60'
        }).setOrigin(0.5);

        container.add([bg, numText, nameText, readyText]);

        return { container, bg, numText, nameText, readyText, occupied: false };
    }

    connectToServer() {
        // WebSocket connection handled by SocketClient
        // See Step 28 for full networking implementation
    }

    updatePlayerSlot(slotIndex, playerData) {
        const slot = this.playerSlots[slotIndex];
        slot.nameText.setText(playerData.displayName);
        slot.nameText.setColor('#E8D5A3');
        slot.readyText.setText(playerData.isReady ? '✓ READY' : '');
        slot.bg.setStrokeStyle(2, playerData.isReady ? 0x27AE60 : 0x0F3460);
        slot.occupied = true;
    }

    startGame() {
        // Send start signal to server
        // Server validates all 10 players are ready
        this.scene.start('CharacterSelectScene');
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Silkscreen',
            fontSize: '16px',
            color: '#E8D5A3',
            backgroundColor: '#0F3460',
            padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.sound.play('sfx_button_click', { volume: 0.5 });
            callback();
        });

        return btn;
    }
}
```

---

## STEP 12: CHARACTER SELECT SCENE

### 12.1 Create CharacterSelectScene.js

Create `src/client/scenes/CharacterSelectScene.js`:

```javascript
import Phaser from 'phaser';
import { CONFIG, COLORS } from '../utils/Constants.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    init(data) {
        this.selectedAvatar = null;
        this.isConfirmed = false;
        this.timeRemaining = CONFIG.CHARACTER_SELECT_DURATION;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(COLORS.MIDNIGHT_PANEL);

        // Title
        this.add.text(width / 2, 40, 'CHOOSE YOUR CHARACTER', {
            fontFamily: 'Silkscreen',
            fontSize: '28px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        // Timer
        this.timerText = this.add.text(width / 2, 80, `Time: 0:${this.timeRemaining}`, {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        // Avatar cards (6 official avatars)
        const avatarNames = ['CHEF', 'CONSTRUCTION WORKER', 'MECHANIC', 'NURSE', 'OFFICE WORKER', 'POLICE'];
        const avatarColors = ['#FFFFFF', '#E67E22', '#1B365D', '#1ABC9C', '#4A5568', '#0F3460'];

        this.avatarCards = [];
        const cardWidth = 110;
        const totalWidth = cardWidth * 6 + 15 * 5;
        const startX = (width - totalWidth) / 2 + cardWidth / 2;

        for (let i = 0; i < 6; i++) {
            const id = String(i + 1).padStart(2, '0');
            const x = startX + i * (cardWidth + 15);
            const y = height * 0.45;

            const card = this.createAvatarCard(x, y, id, avatarNames[i], avatarColors[i]);
            this.avatarCards.push(card);
        }

        // Confirm button
        this.confirmButton = this.add.text(width / 2, height * 0.75, 'SELECT A CHARACTER', {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#0F3460',
            backgroundColor: '#16213E',
            padding: { left: 24, right: 24, top: 10, bottom: 10 }
        }).setOrigin(0.5);

        // Countdown timer
        this.time.addEvent({
            delay: 1000,
            repeat: this.timeRemaining - 1,
            callback: () => {
                this.timeRemaining--;
                const min = Math.floor(this.timeRemaining / 60);
                const sec = this.timeRemaining % 60;
                this.timerText.setText(`Time: ${min}:${String(sec).padStart(2, '0')}`);

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#C0392B');
                }

                if (this.timeRemaining <= 0 && !this.isConfirmed) {
                    // Auto-select random avatar
                    this.selectAvatar(String(Math.floor(Math.random() * 6) + 1).padStart(2, '0'));
                    this.confirmSelection();
                }
            }
        });
    }

    createAvatarCard(x, y, id, name, accentColor) {
        const container = this.add.container(x, y);

        // Card background
        const bg = this.add.rectangle(0, 0, 100, 150, 0x16213E);
        bg.setStrokeStyle(2, 0x0F3460);
        bg.setInteractive({ useHandCursor: true });

        // Avatar sprite preview
        const avatar = this.add.sprite(0, -20, `spr_avatar_${id}`, 0);
        avatar.setScale(3); // Scale up for preview

        // Name label
        const nameLabel = this.add.text(0, 45, name, {
            fontFamily: 'Silkscreen',
            fontSize: '10px',
            color: '#E8D5A3',
            align: 'center',
            wordWrap: { width: 90 }
        }).setOrigin(0.5);

        // Selection indicator (hidden by default)
        const selectIndicator = this.add.text(0, 65, '★ SELECTED', {
            fontFamily: 'Pixelify Sans',
            fontSize: '10px',
            color: '#27AE60'
        }).setOrigin(0.5).setVisible(false);

        container.add([bg, avatar, nameLabel, selectIndicator]);

        // Click handler
        bg.on('pointerdown', () => {
            if (!this.isConfirmed) {
                this.selectAvatar(id);
            }
        });

        bg.on('pointerover', () => {
            if (!this.isConfirmed) {
                bg.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(accentColor).color);
            }
        });

        bg.on('pointerout', () => {
            if (this.selectedAvatar !== id) {
                bg.setStrokeStyle(2, 0x0F3460);
            }
        });

        return { container, bg, avatar, nameLabel, selectIndicator, id };
    }

    selectAvatar(avatarId) {
        this.selectedAvatar = avatarId;

        // Update all cards
        this.avatarCards.forEach(card => {
            if (card.id === avatarId) {
                card.bg.setStrokeStyle(3, 0x27AE60);
                card.selectIndicator.setVisible(true);
            } else {
                card.bg.setStrokeStyle(2, 0x0F3460);
                card.selectIndicator.setVisible(false);
            }
        });

        // Enable confirm button
        this.confirmButton.setText(`CONFIRM: ${this.getAvatarName(avatarId)}`);
        this.confirmButton.setColor('#F5F0E1');
        this.confirmButton.setBackgroundColor('#0F3460');
        this.confirmButton.setInteractive({ useHandCursor: true });
        this.confirmButton.on('pointerdown', () => this.confirmSelection());
    }

    confirmSelection() {
        if (this.isConfirmed || !this.selectedAvatar) return;
        this.isConfirmed = true;

        this.sound.play('sfx_button_click', { volume: 0.5 });

        // Send selection to server
        // socketClient.send('CHARACTER_SELECTED', { avatarId: this.selectedAvatar });

        this.confirmButton.setText('CONFIRMED ✓');
        this.confirmButton.setColor('#27AE60');
        this.confirmButton.removeInteractive();
    }

    getAvatarName(id) {
        const names = {
            '01': 'CHEF',
            '02': 'CONSTRUCTION WORKER',
            '03': 'MECHANIC',
            '04': 'NURSE',
            '05': 'OFFICE WORKER',
            '06': 'POLICE'
        };
        return names[id] || 'UNKNOWN';
    }
}
```

---

## STEP 13: EVENT BUS & HELPERS

### 13.1 Helpers Utility

Create `src/client/utils/Helpers.js`:

```javascript
/**
 * Calculate distance between two points
 */
export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Format seconds to M:SS display
 */
export function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * Generate a random room code (e.g., "DV-A3K9")
 */
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DV-${code}`;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}
```

---

## STEP 14: PHASE MANAGER (CLIENT-SIDE)

### 14.1 Create PhaseManager.js

Create `src/client/systems/PhaseManager.js`:

```javascript
import { PHASES, CONFIG, COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { formatTime } from '../utils/Helpers.js';

export class PhaseManager {
    constructor(scene) {
        this.scene = scene;
        this.currentPhase = PHASES.DAY_PHASE;
        this.timeRemaining = 0;
        this.totalDuration = 0;
        this.isRunning = false;
        this.timerEvent = null;
    }

    startPhase(phase) {
        this.currentPhase = phase;
        this.totalDuration = this.getPhaseDuration(phase);
        this.timeRemaining = this.totalDuration;
        this.isRunning = true;

        gameEvents.emit('phase:changed', {
            from: this.currentPhase,
            to: phase,
            duration: this.totalDuration
        });

        // Start countdown
        if (this.timerEvent) this.timerEvent.remove();
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            repeat: this.totalDuration - 1,
            callback: () => this.tick()
        });
    }

    tick() {
        this.timeRemaining--;

        gameEvents.emit('phase:timerTick', {
            remaining: this.timeRemaining,
            total: this.totalDuration,
            displayString: formatTime(this.timeRemaining)
        });

        // Warning threshold
        if (this.timeRemaining === CONFIG.TIMER_WARNING_THRESHOLD) {
            gameEvents.emit('phase:timerWarning', { remaining: this.timeRemaining });
        }

        // Critical threshold
        if (this.timeRemaining === CONFIG.TIMER_CRITICAL_THRESHOLD) {
            gameEvents.emit('phase:timerCritical', { remaining: this.timeRemaining });
        }

        // Expired
        if (this.timeRemaining <= 0) {
            this.isRunning = false;
            gameEvents.emit('phase:timerExpired', { phase: this.currentPhase });
        }
    }

    getPhaseDuration(phase) {
        switch (phase) {
            case PHASES.ROLE_ASSIGNMENT: return CONFIG.ROLE_ASSIGNMENT_DURATION;
            case PHASES.DAY_PHASE: return CONFIG.DAY_PHASE_DURATION;
            case PHASES.JUDGEMENT_PHASE: return CONFIG.JUDGEMENT_PHASE_DURATION;
            case PHASES.NIGHT_PHASE: return CONFIG.NIGHT_PHASE_DURATION;
            default: return 0;
        }
    }

    getPhaseOverlayColor(phase) {
        switch (phase) {
            case PHASES.DAY_PHASE: return { color: COLORS.DAY_OVERLAY, alpha: 0.08 };
            case PHASES.JUDGEMENT_PHASE: return { color: COLORS.JUDGEMENT_OVERLAY, alpha: 0.12 };
            case PHASES.NIGHT_PHASE: return { color: COLORS.NIGHT_OVERLAY, alpha: 0.40 };
            default: return { color: 0x000000, alpha: 0 };
        }
    }

    isMovementAllowed(playerRole) {
        switch (this.currentPhase) {
            case PHASES.DAY_PHASE: return true;
            case PHASES.NIGHT_PHASE: return playerRole === 'INSTIGATOR';
            default: return false;
        }
    }

    isChatAllowed(chatMode, playerRole) {
        switch (this.currentPhase) {
            case PHASES.DAY_PHASE: return chatMode === 'PROXIMITY';
            case PHASES.JUDGEMENT_PHASE: return chatMode === 'TOWN';
            case PHASES.NIGHT_PHASE: return chatMode === 'INSTIGATOR' && playerRole === 'INSTIGATOR';
            case PHASES.GAME_OVER: return chatMode === 'TOWN';
            default: return false;
        }
    }

    destroy() {
        if (this.timerEvent) this.timerEvent.remove();
    }
}
```

---

# PART 4: GAME WORLD

---

## STEP 15: GAME SCENE — MAP LOADING & CAMERA

### 15.1 Create GameScene.js

Create `src/client/scenes/GameScene.js`:

```javascript
import Phaser from 'phaser';
import { CONFIG, COLORS, PHASES } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { PhaseManager } from '../systems/PhaseManager.js';
import { PlayerController } from '../systems/PlayerController.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.localPlayerId = data.playerId;
        this.localPlayerRole = data.role;
        this.localPlayerAvatar = data.avatarId;
        this.currentMystery = data.mystery;
        this.allPlayers = data.players || [];
    }

    create() {
        // === 1. LOAD TILEMAP ===
        this.map = this.make.tilemap({ key: 'map_village_exterior' });

        // Add tilesets (names must match Tiled tileset names)
        const grassTiles = this.map.addTilesetImage('tile_ground_grass', 'tile_ground_grass');
        const dirtTiles = this.map.addTilesetImage('tile_ground_dirt', 'tile_ground_dirt');
        const cobbleTiles = this.map.addTilesetImage('tile_ground_cobble', 'tile_ground_cobble');
        const stoneTiles = this.map.addTilesetImage('tile_ground_stone', 'tile_ground_stone');
        const allTilesets = [grassTiles, dirtTiles, cobbleTiles, stoneTiles];

        // Create layers
        this.groundLayer = this.map.createLayer('ground', allTilesets);
        this.decalLayer = this.map.createLayer('ground_decals', allTilesets);
        this.pathLayer = this.map.createLayer('paths', allTilesets);

        // Collision layers
        this.wallLayer = this.map.createLayer('walls_lower', allTilesets);
        if (this.wallLayer) this.wallLayer.setCollisionByExclusion([-1]);

        this.buildingBaseLayer = this.map.createLayer('buildings_base', allTilesets);
        this.buildingUpperLayer = this.map.createLayer('buildings_upper', allTilesets);
        this.treeTrunkLayer = this.map.createLayer('trees_trunks', allTilesets);
        this.treeCanopyLayer = this.map.createLayer('trees_canopy', allTilesets);
        if (this.treeCanopyLayer) this.treeCanopyLayer.setDepth(100); // Render above players

        // === 2. SPAWN POINTS ===
        this.spawnPoints = {};
        const spawnLayer = this.map.getObjectLayer('spawn_points');
        if (spawnLayer) {
            spawnLayer.objects.forEach(obj => {
                this.spawnPoints[obj.name] = { x: obj.x, y: obj.y, properties: obj.properties };
            });
        }

        // === 3. CREATE LOCAL PLAYER ===
        const spawnKey = `spawn_H${String(this.allPlayers.indexOf(this.localPlayerId) + 1).padStart(2, '0')}`;
        const spawn = this.spawnPoints[spawnKey] || { x: 480, y: 360 };

        this.localPlayer = this.createPlayer(
            spawn.x, spawn.y,
            this.localPlayerAvatar,
            this.localPlayerId
        );

        // === 4. CREATE OTHER PLAYERS ===
        this.remotePlayers = new Map();
        this.allPlayers.forEach(playerData => {
            if (playerData.id !== this.localPlayerId) {
                const remoteSpawn = this.spawnPoints[`spawn_H${String(playerData.slot).padStart(2, '0')}`];
                const remotePlayer = this.createPlayer(
                    remoteSpawn?.x || 480, remoteSpawn?.y || 360,
                    playerData.avatarId,
                    playerData.id
                );
                this.remotePlayers.set(playerData.id, remotePlayer);
            }
        });

        // === 5. CAMERA SETUP ===
        this.cameras.main.startFollow(this.localPlayer.sprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(CONFIG.DEFAULT_RENDER_SCALE);

        // === 6. COLLISION ===
        if (this.wallLayer) {
            this.physics.add.collider(this.localPlayer.sprite, this.wallLayer);
        }

        // === 7. PHASE OVERLAY ===
        this.phaseOverlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width * 2,
            this.cameras.main.height * 2,
            COLORS.DAY_OVERLAY,
            0.08
        );
        this.phaseOverlay.setScrollFactor(0);
        this.phaseOverlay.setDepth(200);

        // === 8. INITIALIZE SYSTEMS ===
        this.phaseManager = new PhaseManager(this);
        this.playerController = new PlayerController(this, this.localPlayer);

        // === 9. INPUT SETUP ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dropKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // === 10. EVENT LISTENERS ===
        this.setupEventListeners();

        // === 11. START FIRST PHASE ===
        // Normally triggered by server after role assignment
        // this.phaseManager.startPhase(PHASES.ROLE_ASSIGNMENT);
    }

    createPlayer(x, y, avatarId, playerId) {
        const spriteKey = `spr_avatar_${avatarId}`;
        const sprite = this.physics.add.sprite(x, y, spriteKey, 0);
        sprite.setSize(10, 8);   // Collision hitbox (smaller than sprite)
        sprite.setOffset(3, 16); // Center hitbox at feet
        sprite.setDepth(50);     // Player layer

        // Shadow
        const shadow = this.add.image(x, y + 12, 'spr_player_shadow');
        shadow.setAlpha(0.5);
        shadow.setDepth(49);

        return {
            id: playerId,
            avatarId,
            sprite,
            shadow,
            direction: 'south',
            isMoving: false,
            isAlive: true
        };
    }

    update(time, delta) {
        if (!this.localPlayer || !this.localPlayer.isAlive) return;

        // Process input
        this.handleMovement();

        // Update shadow position
        this.localPlayer.shadow.setPosition(
            this.localPlayer.sprite.x,
            this.localPlayer.sprite.y + 12
        );

        // Y-sort all player sprites
        this.sortPlayerDepth();
    }

    handleMovement() {
        if (!this.phaseManager.isMovementAllowed(this.localPlayerRole)) {
            this.localPlayer.sprite.setVelocity(0, 0);
            return;
        }

        const speed = CONFIG.PLAYER_SPEED * CONFIG.DEFAULT_RENDER_SCALE;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            vx = -speed;
            this.localPlayer.direction = 'west';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            vx = speed;
            this.localPlayer.direction = 'east';
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            vy = -speed;
            this.localPlayer.direction = 'north';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            vy = speed;
            this.localPlayer.direction = 'south';
        }

        // No diagonal movement (prioritize last pressed)
        if (vx !== 0 && vy !== 0) {
            // Prioritize vertical if both pressed
            vx = 0;
        }

        this.localPlayer.sprite.setVelocity(vx, vy);

        // Animation
        const avatarKey = `avatar_${this.localPlayerAvatar}`;
        if (vx !== 0 || vy !== 0) {
            this.localPlayer.sprite.anims.play(`${avatarKey}_walk_${this.localPlayer.direction}`, true);
            this.localPlayer.isMoving = true;
        } else {
            this.localPlayer.sprite.anims.play(`${avatarKey}_idle_${this.localPlayer.direction}`, true);
            this.localPlayer.isMoving = false;
        }
    }

    sortPlayerDepth() {
        const allSprites = [this.localPlayer.sprite];
        this.remotePlayers.forEach(rp => allSprites.push(rp.sprite));

        allSprites.sort((a, b) => (a.y + a.height) - (b.y + b.height));
        allSprites.forEach((sprite, index) => {
            sprite.setDepth(50 + index * 0.01);
        });
    }

    setupEventListeners() {
        gameEvents.on('phase:changed', (data) => {
            this.onPhaseChanged(data);
        });

        gameEvents.on('phase:timerTick', (data) => {
            // HUD updates handled by HUDManager
        });
    }

    onPhaseChanged(data) {
        const overlay = this.phaseManager.getPhaseOverlayColor(data.to);

        // Animate overlay transition
        this.tweens.add({
            targets: this.phaseOverlay,
            fillColor: overlay.color,
            fillAlpha: overlay.alpha,
            duration: CONFIG.PHASE_TRANSITION_FADE,
            ease: 'Linear'
        });
    }
}
```

---

## STEP 16: PLAYER CONTROLLER

### 16.1 Create PlayerController.js

Create `src/client/systems/PlayerController.js`:

```javascript
import { CONFIG, PHASES } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { getDistance } from '../utils/Helpers.js';

export class PlayerController {
    constructor(scene, localPlayer) {
        this.scene = scene;
        this.player = localPlayer;
        this.interactionCooldown = false;
        this.idleTimer = 0;
        this.IDLE_THRESHOLD = 3000; // 3 seconds before idle animation
    }

    /**
     * Check for nearby interactable objects and trigger interaction
     */
    checkInteraction(worldFragments, buildingDoors, interactables) {
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;

        // Check fragments first
        for (const fragment of worldFragments) {
            if (getDistance(px, py, fragment.x, fragment.y) <= CONFIG.FRAGMENT_INTERACTION_RADIUS) {
                gameEvents.emit('fragment:attemptPickup', {
                    playerId: this.player.id,
                    fragmentId: fragment.id
                });
                return;
            }
        }

        // Check building doors
        for (const door of buildingDoors) {
            if (getDistance(px, py, door.x, door.y) <= CONFIG.FRAGMENT_INTERACTION_RADIUS) {
                gameEvents.emit('building:attemptEntry', {
                    playerId: this.player.id,
                    buildingId: door.buildingId
                });
                return;
            }
        }

        // Check interactables (statue, podium, etc.)
        for (const obj of interactables) {
            if (getDistance(px, py, obj.x, obj.y) <= CONFIG.FRAGMENT_INTERACTION_RADIUS) {
                gameEvents.emit('interaction:trigger', {
                    playerId: this.player.id,
                    objectId: obj.id,
                    action: obj.action
                });
                return;
            }
        }
    }

    /**
     * Drop the currently held fragment
     */
    dropFragment() {
        if (this.player.heldFragment) {
            gameEvents.emit('fragment:attemptDrop', {
                playerId: this.player.id,
                fragmentId: this.player.heldFragment.id,
                position: {
                    x: this.player.sprite.x,
                    y: this.player.sprite.y
                }
            });
        }
    }

    destroy() {
        // Cleanup
    }
}
```

---

## STEP 17: BUILDING ENTRY/EXIT & INTERIOR SCENE

### 17.1 Create InteriorScene.js

Create `src/client/scenes/InteriorScene.js`:

```javascript
import Phaser from 'phaser';
import { CONFIG, COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export default class InteriorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InteriorScene' });
    }

    init(data) {
        this.buildingId = data.buildingId;
        this.buildingType = data.buildingType;
        this.localPlayer = data.localPlayer;
        this.entryTile = data.entryTile;
    }

    create() {
        // Load interior tilemap
        const mapKey = `map_interior_${this.buildingType.toLowerCase()}`;
        this.map = this.make.tilemap({ key: mapKey });

        // Add tilesets and create layers
        // (Similar structure to GameScene tilemap setup)

        // Create player sprite inside interior
        this.playerSprite = this.physics.add.sprite(
            this.entryTile.x * CONFIG.TILE_SIZE,
            this.entryTile.y * CONFIG.TILE_SIZE,
            `spr_avatar_${this.localPlayer.avatarId}`,
            0
        );

        // Camera
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(CONFIG.DEFAULT_RENDER_SCALE);

        // Create interactable props based on building type
        this.setupInteractables();

        // Exit door
        this.setupExitDoor();

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    setupInteractables() {
        // Based on building type, create interactive objects
        // For Library: verification podium
        // For School: chalkboard, lockers, counselor desk
        // For Clinic: intake desk, medicine cabinet
        // etc.

        if (this.buildingType === 'LIBRARY') {
            this.createVerificationPodium();
        }
    }

    createVerificationPodium() {
        // The central verification point in the Library
        // Requires 2 players to stand on it for 10 seconds
        const podiumX = 5 * CONFIG.TILE_SIZE;
        const podiumY = 3 * CONFIG.TILE_SIZE;

        this.podium = this.add.sprite(podiumX, podiumY, 'interior_props');
        this.podium.setDepth(10);

        // Interaction zone
        this.podiumZone = this.add.zone(podiumX, podiumY, 48, 32);
        this.physics.add.existing(this.podiumZone, true);
    }

    setupExitDoor() {
        // Exit door to return to exterior
        const exitTile = this.map.findObject('spawn_points', obj => obj.name === 'exit_door');
        if (exitTile) {
            this.exitZone = this.add.zone(exitTile.x, exitTile.y, 16, 16);
            this.physics.add.existing(this.exitZone, true);

            this.physics.add.overlap(this.playerSprite, this.exitZone, () => {
                this.exitBuilding();
            });
        }
    }

    exitBuilding() {
        gameEvents.emit('building:exit', {
            playerId: this.localPlayer.id,
            buildingId: this.buildingId
        });

        // Return to GameScene
        this.scene.stop('InteriorScene');
        this.scene.resume('GameScene');
    }

    update(time, delta) {
        this.handleMovement();
    }

    handleMovement() {
        // Same movement logic as GameScene (refactor to shared utility)
        const speed = CONFIG.PLAYER_SPEED * CONFIG.DEFAULT_RENDER_SCALE;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

        if (vx !== 0 && vy !== 0) vx = 0; // No diagonal

        this.playerSprite.setVelocity(vx, vy);
    }
}
```

---

## STEP 18: FRAGMENT ENTITIES & WORLD SPAWNING

### 18.1 Create MemoryFragment Entity

Create `src/client/entities/MemoryFragment.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';

export class MemoryFragment {
    constructor(scene, fragmentData) {
        this.scene = scene;
        this.id = fragmentData.id;
        this.mysteryId = fragmentData.mysteryId;
        this.fragmentType = fragmentData.fragmentType;
        this.isAuthentic = fragmentData.isAuthentic;
        this.title = fragmentData.title;
        this.description = fragmentData.description;
        this.iconAsset = fragmentData.iconAsset;
        this.clueText = fragmentData.clueText;
        this.spawnLocation = fragmentData.spawnLocation;
        this.isVerified = false;
        this.markedAsForged = false;

        // Create world sprite (pulsing scroll)
        this.worldSprite = scene.add.sprite(
            fragmentData.spawnTile.x * 16,
            fragmentData.spawnTile.y * 16,
            'spr_frag_world_pulse'
        );
        this.worldSprite.play('frag_world_pulse');
        this.worldSprite.setDepth(40);

        // Interaction zone
        this.interactionZone = scene.add.zone(
            this.worldSprite.x,
            this.worldSprite.y,
            24, 24
        );
        scene.physics.add.existing(this.interactionZone, true);
    }

    pickup(playerId) {
        this.worldSprite.setVisible(false);
        this.interactionZone.setActive(false);
        this.heldByPlayerId = playerId;
    }

    drop(x, y) {
        this.worldSprite.setPosition(x, y);
        this.worldSprite.setVisible(true);
        this.interactionZone.setPosition(x, y);
        this.interactionZone.setActive(true);
        this.heldByPlayerId = null;
    }

    verify(isAuthentic) {
        this.isVerified = true;
        if (!isAuthentic) {
            this.markedAsForged = true;
        }
    }

    destroy() {
        this.worldSprite.destroy();
        this.interactionZone.destroy();
    }
}
```

---

## STEP 19: FRAGMENT MANAGER (CLIENT-SIDE)

### 19.1 Create FragmentManager.js

Create `src/client/systems/FragmentManager.js`:

```javascript
import { MemoryFragment } from '../entities/MemoryFragment.js';
import { gameEvents } from '../utils/EventBus.js';

export class FragmentManager {
    constructor(scene) {
        this.scene = scene;
        this.worldFragments = new Map();  // id -> MemoryFragment
        this.heldFragments = new Map();   // playerId -> MemoryFragment

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('fragment:spawned', (data) => this.spawnFragment(data));
        gameEvents.on('fragment:pickedUpConfirmed', (data) => this.onPickupConfirmed(data));
        gameEvents.on('fragment:droppedConfirmed', (data) => this.onDropConfirmed(data));
        gameEvents.on('fragment:verifiedResult', (data) => this.onVerified(data));
    }

    spawnFragment(fragmentData) {
        const fragment = new MemoryFragment(this.scene, fragmentData);
        this.worldFragments.set(fragment.id, fragment);
    }

    onPickupConfirmed(data) {
        const fragment = this.worldFragments.get(data.fragmentId);
        if (fragment) {
            fragment.pickup(data.playerId);
            this.worldFragments.delete(data.fragmentId);
            this.heldFragments.set(data.playerId, fragment);

            if (data.playerId === this.scene.localPlayerId) {
                // Play pickup SFX and animation
                this.scene.sound.play('sfx_fragment_pickup', { volume: 0.6 });
                gameEvents.emit('inventory:updated', {
                    fragment: {
                        id: fragment.id,
                        title: fragment.title,
                        type: fragment.fragmentType,
                        isVerified: fragment.isVerified
                    }
                });

                // Show clue text
                gameEvents.emit('chat:systemMessage', {
                    content: `Clue: ${fragment.clueText}`
                });
            }
        }
    }

    onDropConfirmed(data) {
        const fragment = this.heldFragments.get(data.playerId);
        if (fragment) {
            fragment.drop(data.position.x, data.position.y);
            this.heldFragments.delete(data.playerId);
            this.worldFragments.set(fragment.id, fragment);

            if (data.playerId === this.scene.localPlayerId) {
                gameEvents.emit('inventory:updated', { fragment: null });
            }
        }
    }

    onVerified(data) {
        const fragment = this.heldFragments.get(data.playerId);
        if (fragment && fragment.id === data.fragmentId) {
            fragment.verify(data.isAuthentic);

            if (data.isAuthentic) {
                this.scene.sound.play('sfx_fragment_verified', { volume: 0.7 });
            } else {
                this.scene.sound.play('sfx_solve_fail', { volume: 0.7 });
            }

            gameEvents.emit('mystery:fragmentVerified', {
                fragmentId: fragment.id,
                fragmentType: fragment.fragmentType,
                isAuthentic: data.isAuthentic
            });
        }
    }

    getWorldFragmentsNear(x, y, radius) {
        const nearby = [];
        this.worldFragments.forEach(fragment => {
            const dx = fragment.worldSprite.x - x;
            const dy = fragment.worldSprite.y - y;
            if (Math.sqrt(dx * dx + dy * dy) <= radius) {
                nearby.push(fragment);
            }
        });
        return nearby;
    }

    destroy() {
        this.worldFragments.forEach(f => f.destroy());
        this.worldFragments.clear();
        this.heldFragments.clear();
    }
}
```

---

# PART 5: GAMEPLAY SYSTEMS

---

## STEP 20: LIBRARY VERIFICATION SYSTEM

### 20.1 Create VerificationSystem.js

Create `src/client/systems/VerificationSystem.js`:

```javascript
import { CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VerificationSystem {
    constructor(scene) {
        this.scene = scene;
        this.isVerifying = false;
        this.verificationTimer = 0;
        this.verificationPartner = null;
        this.progressBar = null;
    }

    startVerification(playerAId, playerBId) {
        this.isVerifying = true;
        this.verificationTimer = CONFIG.VERIFICATION_DURATION * 1000;
        this.verificationPartner = playerBId;

        // Create progress bar UI
        this.createProgressBar();

        // Play sparkle VFX
        gameEvents.emit('vfx:play', {
            key: 'vfx_sparkle_play',
            x: this.scene.localPlayer.sprite.x,
            y: this.scene.localPlayer.sprite.y - 20,
            loop: true
        });

        // Start timer
        this.timerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: CONFIG.VERIFICATION_DURATION * 10 - 1,
            callback: () => this.tickVerification()
        });
    }

    tickVerification() {
        this.verificationTimer -= 100;

        // Update progress bar
        const progress = 1 - (this.verificationTimer / (CONFIG.VERIFICATION_DURATION * 1000));
        this.updateProgressBar(progress);

        if (this.verificationTimer <= 0) {
            this.completeVerification();
        }
    }

    interruptVerification() {
        if (!this.isVerifying) return;

        this.isVerifying = false;
        this.verificationTimer = 0;

        if (this.timerEvent) this.timerEvent.remove();
        this.destroyProgressBar();

        gameEvents.emit('vfx:stop', { key: 'vfx_sparkle_play' });
        gameEvents.emit('chat:systemMessage', {
            content: 'Verification interrupted! Stay at the podium.'
        });
    }

    completeVerification() {
        this.isVerifying = false;
        this.destroyProgressBar();

        gameEvents.emit('vfx:stop', { key: 'vfx_sparkle_play' });

        // Send verification request to server
        // Server responds with VERIFICATION_RESULT
        gameEvents.emit('network:send', {
            type: 'VERIFICATION_COMPLETE',
            playerAId: this.scene.localPlayerId,
            playerBId: this.verificationPartner
        });
    }

    createProgressBar() {
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.height - 100;

        this.progressBg = this.scene.add.rectangle(x, y, 200, 16, 0x0F3460);
        this.progressBg.setScrollFactor(0).setDepth(300);

        this.progressFill = this.scene.add.rectangle(x - 98, y, 0, 12, 0x27AE60);
        this.progressFill.setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);

        this.progressText = this.scene.add.text(x, y - 16, 'VERIFYING...', {
            fontFamily: 'Pixelify Sans',
            fontSize: '12px',
            color: '#E8D5A3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    }

    updateProgressBar(progress) {
        if (this.progressFill) {
            this.progressFill.width = 196 * progress;
        }
    }

    destroyProgressBar() {
        if (this.progressBg) this.progressBg.destroy();
        if (this.progressFill) this.progressFill.destroy();
        if (this.progressText) this.progressText.destroy();
    }

    destroy() {
        if (this.timerEvent) this.timerEvent.remove();
        this.destroyProgressBar();
    }
}
```

---

## STEP 21: VOTING SYSTEM (CLIENT-SIDE)

### 21.1 Create VotingSystem.js

Create `src/client/systems/VotingSystem.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';

export class VotingSystem {
    constructor(scene) {
        this.scene = scene;
        this.isVotingActive = false;
        this.nominatedPlayerId = null;
        this.localVote = null;
        this.voteResults = { ban: 0, forgive: 0, total: 0 };

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('vote:nominationReceived', (data) => {
            this.startVoting(data.nominatedPlayerId, data.nominatedPlayerName);
        });

        gameEvents.on('vote:resultReceived', (data) => {
            this.resolveVoting(data);
        });
    }

    nominate(targetPlayerId) {
        // Send nomination to server
        gameEvents.emit('network:send', {
            type: 'VOTE_NOMINATE',
            nominatorId: this.scene.localPlayerId,
            targetId: targetPlayerId
        });
    }

    startVoting(nominatedPlayerId, nominatedPlayerName) {
        this.isVotingActive = true;
        this.nominatedPlayerId = nominatedPlayerId;
        this.localVote = null;

        // Show voting UI
        gameEvents.emit('ui:showVotingModal', {
            nominatedPlayerId,
            nominatedPlayerName,
            totalVoters: this.scene.allPlayers.filter(p => p.isAlive).length
        });
    }

    castVote(choice) {
        if (!this.isVotingActive || this.localVote !== null) return;

        this.localVote = choice;

        gameEvents.emit('network:send', {
            type: 'VOTE_CAST',
            voterId: this.scene.localPlayerId,
            choice: choice  // 'BAN' or 'FORGIVE'
        });

        gameEvents.emit('ui:voteCast', { choice });
    }

    resolveVoting(data) {
        this.isVotingActive = false;
        this.voteResults = {
            ban: data.banVotes,
            forgive: data.forgiveVotes,
            total: data.totalVoters,
            result: data.result  // 'EVICTED' | 'FORGIVEN' | 'SKIPPED'
        };

        gameEvents.emit('ui:voteResolved', data);

        if (data.result === 'EVICTED') {
            gameEvents.emit('player:evicted', {
                playerId: data.nominatedPlayerId,
                day: data.currentDay
            });
        }
    }

    destroy() {
        // Cleanup
    }
}
```

---

## STEP 22: SABOTAGE SYSTEM (CLIENT-SIDE)

### 22.1 Create SabotageSystem.js

Create `src/client/systems/SabotageSystem.js`:

```javascript
import { ROLES } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class SabotageSystem {
    constructor(scene) {
        this.scene = scene;
        this.hasLockedBuildingThisNight = false;
        this.hasPlantedFragmentThisNight = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('phase:changed', (data) => {
            if (data.to === 'NIGHT_PHASE') {
                this.resetNightAbilities();
            }
        });
    }

    resetNightAbilities() {
        this.hasLockedBuildingThisNight = false;
        this.hasPlantedFragmentThisNight = false;
    }

    lockBuilding(buildingId) {
        if (this.scene.localPlayerRole !== ROLES.INSTIGATOR) return;
        if (this.hasLockedBuildingThisNight) {
            gameEvents.emit('chat:systemMessage', {
                content: 'You have already locked a building tonight.'
            });
            return;
        }

        this.hasLockedBuildingThisNight = true;

        gameEvents.emit('network:send', {
            type: 'SABOTAGE_LOCK_BUILDING',
            instigatorId: this.scene.localPlayerId,
            buildingId: buildingId
        });

        gameEvents.emit('chat:systemMessage', {
            content: `You locked ${buildingId} for 30 seconds.`
        });
    }

    plantForgedFragment(location, fragmentType) {
        if (this.scene.localPlayerRole !== ROLES.INSTIGATOR) return;
        if (this.hasPlantedFragmentThisNight) {
            gameEvents.emit('chat:systemMessage', {
                content: 'You have already planted a fragment tonight.'
            });
            return;
        }

        this.hasPlantedFragmentThisNight = true;

        gameEvents.emit('network:send', {
            type: 'SABOTAGE_PLANT_FRAGMENT',
            instigatorId: this.scene.localPlayerId,
            location: location,
            fragmentType: fragmentType
        });

        gameEvents.emit('chat:systemMessage', {
            content: `You planted a forged ${fragmentType} fragment at ${location}.`
        });
    }

    destroy() {
        // Cleanup
    }
}
```

---

## STEP 23: CHAT SYSTEM (CLIENT-SIDE)

### 23.1 Create ChatSystem.js

Create `src/client/systems/ChatSystem.js`:

```javascript
import { CHAT_MODES, CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { getDistance } from '../utils/Helpers.js';

export class ChatSystem {
    constructor(scene) {
        this.scene = scene;
        this.messages = [];
        this.maxMessages = 100;

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('chat:send', (data) => this.sendMessage(data));
        gameEvents.on('chat:received', (data) => this.receiveMessage(data));
        gameEvents.on('chat:systemMessage', (data) => this.addSystemMessage(data.content));
    }

    sendMessage(data) {
        const { content, mode } = data;

        if (content.length === 0 || content.length > CONFIG.MAX_MESSAGE_LENGTH) return;

        // Validate mode for current phase
        if (!this.scene.phaseManager.isChatAllowed(mode, this.scene.localPlayerRole)) {
            this.addSystemMessage('Cannot send messages in this mode during this phase.');
            return;
        }

        gameEvents.emit('network:send', {
            type: 'CHAT_SEND',
            senderId: this.scene.localPlayerId,
            content: content,
            mode: mode,
            position: {
                x: this.scene.localPlayer.sprite.x,
                y: this.scene.localPlayer.sprite.y
            }
        });
    }

    receiveMessage(messageData) {
        // For proximity chat, check if sender is within range
        if (messageData.mode === CHAT_MODES.PROXIMITY) {
            const localX = this.scene.localPlayer.sprite.x;
            const localY = this.scene.localPlayer.sprite.y;
            const dist = getDistance(localX, localY, messageData.position.x, messageData.position.y);

            if (dist > CONFIG.PROXIMITY_CHAT_RADIUS &&
                messageData.senderId !== this.scene.localPlayerId) {
                return; // Too far away to hear
            }
        }

        this.messages.push(messageData);
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        gameEvents.emit('ui:chatMessageReceived', messageData);
    }

    addSystemMessage(content) {
        const msg = {
            id: `sys_${Date.now()}`,
            senderId: 'SYSTEM',
            senderName: 'SYSTEM',
            mode: CHAT_MODES.SYSTEM,
            content: content,
            timestamp: Date.now()
        };
        this.messages.push(msg);
        gameEvents.emit('ui:chatMessageReceived', msg);
    }

    destroy() {
        this.messages = [];
    }
}
```

---

## STEP 24: WIN CONDITION SYSTEM

### 24.1 Create WinCondition.js

Create `src/client/systems/WinCondition.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';

export class WinCondition {
    constructor(scene) {
        this.scene = scene;

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('game:overReceived', (data) => {
            this.handleGameOver(data);
        });
    }

    handleGameOver(data) {
        // data = { winner, reason, roleReveal, mysteryResult }
        this.scene.scene.start('GameOverScene', {
            winner: data.winner,          // 'SURVIVORS' or 'INSTIGATORS'
            reason: data.reason,          // 'MYSTERY_SOLVED', 'ALL_INSTIGATORS_EVICTED', 'VOTING_PARITY'
            roleReveal: data.roleReveal,  // Array of { playerId, role, avatarId, isAlive }
            mysteryResult: data.mysteryResult,
            localPlayerRole: this.scene.localPlayerRole
        });
    }

    destroy() {
        // Cleanup
    }
}
```

---

## STEP 25: GAME OVER SCENE

### 25.1 Create GameOverScene.js

Create `src/client/scenes/GameOverScene.js`:

```javascript
import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.winner = data.winner;
        this.reason = data.reason;
        this.roleReveal = data.roleReveal;
        this.mysteryResult = data.mysteryResult;
        this.localPlayerRole = data.localPlayerRole;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor(COLORS.MIDNIGHT_PANEL);

        const localWon = (this.winner === 'SURVIVORS' && this.localPlayerRole === 'SURVIVOR') ||
                          (this.winner === 'INSTIGATORS' && this.localPlayerRole === 'INSTIGATOR');

        // Play audio
        if (localWon) {
            this.sound.play('mus_victory_fanfare', { volume: 0.7 });
        } else {
            this.sound.play('mus_defeat_sting', { volume: 0.7 });
        }

        // Title
        const titleText = localWon ? '★ VICTORY ★' : 'DEFEAT';
        const titleColor = localWon ? '#27AE60' : '#C0392B';

        this.add.text(width / 2, 50, titleText, {
            fontFamily: 'Silkscreen',
            fontSize: '40px',
            color: titleColor
        }).setOrigin(0.5);

        // Winner faction
        this.add.text(width / 2, 100, `${this.winner} WIN`, {
            fontFamily: 'Silkscreen',
            fontSize: '24px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        // Reason
        const reasonText = this.getReasonText();
        this.add.text(width / 2, 140, reasonText, {
            fontFamily: 'Pixelify Sans',
            fontSize: '16px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        // Role Reveal List
        this.add.text(width / 2, 190, 'PLAYER ROLES', {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.roleReveal.forEach((player, index) => {
            const y = 220 + index * 28;
            const roleColor = player.role === 'SURVIVOR' ? '#27AE60' : '#C0392B';
            const statusText = player.isAlive ? 'Alive' : `Evicted D${player.eliminationDay}`;

            this.add.text(width * 0.3, y, player.displayName, {
                fontFamily: 'Pixelify Sans',
                fontSize: '14px',
                color: '#E8D5A3'
            }).setOrigin(0, 0.5);

            this.add.text(width * 0.55, y, player.role, {
                fontFamily: 'Pixelify Sans',
                fontSize: '14px',
                color: roleColor
            }).setOrigin(0, 0.5);

            this.add.text(width * 0.75, y, statusText, {
                fontFamily: 'Pixelify Sans',
                fontSize: '14px',
                color: player.isAlive ? '#E8D5A3' : '#0F3460'
            }).setOrigin(0, 0.5);
        });

        // Buttons
        const btnY = height - 60;
        this.createButton(width * 0.35, btnY, 'PLAY AGAIN', () => {
            this.scene.start('LobbyScene', { isHost: false });
        });
        this.createButton(width * 0.65, btnY, 'MAIN MENU', () => {
            this.scene.start('MenuScene');
        });
    }

    getReasonText() {
        switch (this.reason) {
            case 'MYSTERY_SOLVED': return '"The mystery has been solved. Misinformation contained."';
            case 'ALL_INSTIGATORS_EVICTED': return '"All instigators have been identified and removed."';
            case 'VOTING_PARITY': return '"The instigators have gained control of the village."';
            default: return '';
        }
    }

    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'Silkscreen',
            fontSize: '16px',
            color: '#E8D5A3',
            backgroundColor: '#0F3460',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.sound.play('sfx_button_click', { volume: 0.5 });
            callback();
        });
    }
}
```

---

## STEP 26: MYSTERY REGISTRY DATA

### 26.1 Create MysteryRegistry.js (Shared/Server)

Create `src/server/MysteryRegistry.js`:

```javascript
const MYSTERIES = [
    {
        id: 'COUNTERFEIT_CURE',
        title: 'The Counterfeit Cure',
        milTheme: 'Medical Misinformation',
        narrativeIntro: 'A mysterious herbal cure has been circulating through Dusk Village. Residents are falling ill, but the source remains unknown...',
        fragments: {
            claim: {
                id: 'frag_cure_claim',
                title: 'Herbal Cure Flyer',
                description: 'A promotional flyer for an unregulated herbal cure.',
                location: 'CLINIC',
                spawnTile: { x: 4, y: 3 },
                clueText: 'The student ledger at the School may reveal more...',
                iconAsset: 'ico_frag_cure_claim'
            },
            context: {
                id: 'frag_cure_context',
                title: 'Student Health Ledger',
                description: 'A ledger showing a student falling ill after consuming a supplement.',
                location: 'SCHOOL',
                spawnTile: { x: 6, y: 5 },
                clueText: 'The Library\'s medical registry holds the final piece...',
                iconAsset: 'ico_frag_cure_context'
            },
            source: {
                id: 'frag_cure_source',
                title: 'Medical Fraud Registry',
                description: 'A medical registry proving the "doctor" is a documented fraud.',
                location: 'LIBRARY',
                spawnTile: { x: 3, y: 4 },
                clueText: 'This is the source. Verify all fragments to solve the mystery.',
                iconAsset: 'ico_frag_cure_source'
            }
        },
        forgedVariants: {
            claim: {
                title: 'Approved Herbal Supplement',
                description: 'An official-looking approval certificate.',
                clueText: 'Check the Village Hall for public health records...'
            },
            context: {
                title: 'Student Recovery Log',
                description: 'A log showing recovery thanks to the supplement.',
                clueText: 'The Clinic has the treatment records...'
            },
            source: {
                title: 'Licensed Practitioner Certificate',
                description: 'A certificate showing valid credentials.',
                clueText: 'Cross-reference with the School\'s health forms...'
            }
        }
    },
    {
        id: 'SILENT_HALLWAYS',
        title: 'The Silent Hallways',
        milTheme: 'Online Harassment',
        narrativeIntro: 'A student has vanished from the halls. Whispers of digital harassment echo through the village...',
        fragments: {
            claim: { id: 'frag_hallways_claim', title: 'Slanderous Messages', description: 'Printed copies of slanderous digital messages.', location: 'SCHOOL', spawnTile: { x: 7, y: 3 }, clueText: 'Look in the Houses for unsent letters...', iconAsset: 'ico_frag_hallways_claim' },
            context: { id: 'frag_hallways_context', title: 'Unsent Diary Entries', description: 'Diary entries detailing mental health decline.', location: 'HOUSE', spawnTile: { x: 3, y: 2 }, clueText: 'Trace the source at the Library...', iconAsset: 'ico_frag_hallways_context' },
            source: { id: 'frag_hallways_source', title: 'IP Address Trace', description: 'Digital footprint tracing harassment to a specific IP.', location: 'LIBRARY', spawnTile: { x: 4, y: 5 }, clueText: 'This is the source. Verify to solve.', iconAsset: 'ico_frag_hallways_source' }
        },
        forgedVariants: {
            claim: { title: 'Friendly Chat Log', description: 'Positive supportive messages.', clueText: 'Check the Clinic for counseling records...' },
            context: { title: 'Happy Journal Entry', description: 'Journal showing a thriving student.', clueText: 'The Village Hall attendance records may help...' },
            source: { title: 'Clean Network Log', description: 'Network log showing no suspicious activity.', clueText: 'Cross-check with the School records...' }
        }
    },
    {
        id: 'BREAKING_POINT',
        title: 'The Breaking Point',
        milTheme: 'Cyberbullying Awareness',
        narrativeIntro: 'A resident has filed an unexplained leave of absence. Something drove them to the breaking point...',
        fragments: {
            claim: { id: 'frag_breakpoint_claim', title: 'Leave of Absence Form', description: 'A sudden leave of absence filed by a resident.', location: 'VILLAGE_HALL', spawnTile: { x: 5, y: 4 }, clueText: 'Visit the School counselor for context...', iconAsset: 'ico_frag_breakpoint_claim' },
            context: { id: 'frag_breakpoint_context', title: 'Counselor\'s Log', description: 'Notes detailing severe social isolation.', location: 'SCHOOL', spawnTile: { x: 4, y: 6 }, clueText: 'The Library chat archives hold the answer...', iconAsset: 'ico_frag_breakpoint_context' },
            source: { id: 'frag_breakpoint_source', title: 'Chat Archive', description: 'Chat archive revealing a coordinated hate campaign.', location: 'LIBRARY', spawnTile: { x: 6, y: 3 }, clueText: 'This is the source. Verify to solve.', iconAsset: 'ico_frag_breakpoint_source' }
        },
        forgedVariants: {
            claim: { title: 'Vacation Request', description: 'A standard vacation request form.', clueText: 'The Clinic may have health clearance records...' },
            context: { title: 'Positive Counselor Review', description: 'Glowing social assessment report.', clueText: 'Check the Houses for personal correspondence...' },
            source: { title: 'Clean Chat History', description: 'Friendly supportive group chat.', clueText: 'The Village Hall has community records...' }
        }
    },
    {
        id: 'ILLUSORY_TRUTH',
        title: 'The Illusory Truth',
        milTheme: 'Deepfakes & Manipulation',
        narrativeIntro: 'A scandalous photograph of a village official has surfaced. But is it real?',
        fragments: {
            claim: { id: 'frag_illusion_claim', title: 'Scandalous Photograph', description: 'A scandalous photograph of a village official.', location: 'VILLAGE_HALL', spawnTile: { x: 8, y: 3 }, clueText: 'Search the Houses for software receipts...', iconAsset: 'ico_frag_illusion_claim' },
            context: { id: 'frag_illusion_context', title: 'Software Receipt', description: 'Receipt for high-end digital image editing tools.', location: 'HOUSE', spawnTile: { x: 2, y: 3 }, clueText: 'The Library has the original metadata...', iconAsset: 'ico_frag_illusion_context' },
            source: { id: 'frag_illusion_source', title: 'Original Camera Metadata', description: 'Unedited camera raw file metadata.', location: 'LIBRARY', spawnTile: { x: 5, y: 5 }, clueText: 'This is the source. Verify to solve.', iconAsset: 'ico_frag_illusion_source' }
        },
        forgedVariants: {
            claim: { title: 'Verified Photograph', description: 'Photo with official verification stamp.', clueText: 'The School yearbook may have matching photos...' },
            context: { title: 'Art Supply Order', description: 'Standard art supplies purchase.', clueText: 'The Clinic records may show context...' },
            source: { title: 'Matching EXIF Data', description: 'Metadata confirming photo authenticity.', clueText: 'Cross-reference at the Village Hall...' }
        }
    },
    {
        id: 'EMPTY_VAULT',
        title: 'The Empty Vault',
        milTheme: 'Phishing & Digital Scams',
        narrativeIntro: 'Residents are receiving urgent payment notices. Savings accounts are being drained overnight...',
        fragments: {
            claim: { id: 'frag_vault_claim', title: 'Urgent Payment Notice', description: 'Fraudulent notice demanding immediate payment.', location: 'HOUSE', spawnTile: { x: 3, y: 4 }, clueText: 'Check the Village Hall for bank records...', iconAsset: 'ico_frag_vault_claim' },
            context: { id: 'frag_vault_context', title: 'Bank Transfer Log', description: 'Unauthorized transfer log draining savings.', location: 'VILLAGE_HALL', spawnTile: { x: 6, y: 6 }, clueText: 'The Library scam registry is the key...', iconAsset: 'ico_frag_vault_context' },
            source: { id: 'frag_vault_source', title: 'Scam Registry', description: 'Payment address matched to a known crime syndicate.', location: 'LIBRARY', spawnTile: { x: 4, y: 4 }, clueText: 'This is the source. Verify to solve.', iconAsset: 'ico_frag_vault_source' }
        },
        forgedVariants: {
            claim: { title: 'Official Tax Notice', description: 'Legitimate-looking government tax notice.', clueText: 'The School may have exemption records...' },
            context: { title: 'Authorized Transfer Receipt', description: 'Approved fund transfer documentation.', clueText: 'The Clinic billing records may clarify...' },
            source: { title: 'Verified Business License', description: 'Valid business registration certificate.', clueText: 'Cross-reference at the Village Hall...' }
        }
    }
];

module.exports = { MYSTERIES };
```

---

## STEP 27: COMPLETE MYSTERY SOLVE FLOW

### 27.1 Solve Mystery Integration

The solve flow connects the Fragment Manager, Verification System, and Win Condition:

```
                     ┌──────────────────────────────┐
                     │  Player approaches statue     │
                     │  during Day Phase              │
                     └──────────┬───────────────────┘
                                │
                     ┌──────────▼───────────────────┐
                     │  Press E to interact          │
                     │  → Opens Solve Mystery Modal  │
                     └──────────┬───────────────────┘
                                │
                     ┌──────────▼───────────────────┐
                     │  Player drags held fragment   │
                     │  into correct slot            │
                     │  (Claim/Context/Source)        │
                     └──────────┬───────────────────┘
                                │
                     ┌──────────▼───────────────────┐
                     │  All 3 slots filled?          │
                     │  (requires 3 verified frags)  │
                     └──────┬───────────┬───────────┘
                       NO   │           │  YES
                            │   ┌───────▼───────────┐
                            │   │  Click SUBMIT      │
                            │   └───────┬───────────┘
                            │           │
                            │   ┌───────▼───────────┐
                            │   │  Server validates: │
                            │   │  • All verified?   │
                            │   │  • All authentic?  │
                            │   │  • Correct mystery?│
                            │   │  • Correct types?  │
                            │   └──┬────────────┬───┘
                            │   SUCCESS       FAIL
                            │     │              │
                            │  ┌──▼──────────┐ ┌─▼───────────┐
                            │  │ SURVIVORS   │ │ Screen shake │
                            │  │ WIN!        │ │ Error msg    │
                            │  │ statue_burst│ │ Frags return │
                            │  └─────────────┘ └─────────────┘
```

---

# PART 6: MULTIPLAYER NETWORKING

---

## STEP 28: WEBSOCKET SERVER

### 28.1 Create Server Entry Point

Create `src/server/server.js`:

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { RoomManager } = require('./RoomManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Serve static files (production)
app.use(express.static(path.join(__dirname, '../../dist')));

// Room Manager
const roomManager = new RoomManager();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
    let playerId = null;
    let roomCode = null;

    ws.on('message', (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage);
            handleMessage(ws, message);
        } catch (err) {
            console.error('Invalid message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected:', playerId);
        if (roomCode && playerId) {
            roomManager.handleDisconnect(roomCode, playerId);
        }
    });

    function handleMessage(ws, message) {
        switch (message.type) {
            case 'CREATE_ROOM':
                const room = roomManager.createRoom(ws, message.playerName);
                playerId = room.hostId;
                roomCode = room.code;
                ws.send(JSON.stringify({
                    type: 'ROOM_CREATED',
                    roomCode: room.code,
                    playerId: playerId,
                    slot: 1
                }));
                break;

            case 'JOIN_ROOM':
                const joinResult = roomManager.joinRoom(message.roomCode, ws, message.playerName);
                if (joinResult.success) {
                    playerId = joinResult.playerId;
                    roomCode = message.roomCode;
                    ws.send(JSON.stringify({
                        type: 'ROOM_JOINED',
                        playerId: playerId,
                        slot: joinResult.slot,
                        players: joinResult.currentPlayers
                    }));
                    // Broadcast to room
                    roomManager.broadcast(roomCode, {
                        type: 'PLAYER_JOINED',
                        playerId: playerId,
                        playerName: message.playerName,
                        slot: joinResult.slot
                    }, playerId);
                } else {
                    ws.send(JSON.stringify({
                        type: 'JOIN_ERROR',
                        reason: joinResult.reason
                    }));
                }
                break;

            case 'PLAYER_READY':
                roomManager.setPlayerReady(roomCode, playerId, message.isReady);
                break;

            case 'START_GAME':
                roomManager.startGame(roomCode, playerId);
                break;

            case 'CHARACTER_SELECTED':
                roomManager.setCharacter(roomCode, playerId, message.avatarId);
                break;

            case 'PLAYER_MOVE':
                roomManager.handlePlayerMove(roomCode, playerId, message);
                break;

            case 'FRAGMENT_PICKUP':
                roomManager.handleFragmentPickup(roomCode, playerId, message.fragmentId);
                break;

            case 'FRAGMENT_DROP':
                roomManager.handleFragmentDrop(roomCode, playerId, message.position);
                break;

            case 'VERIFICATION_COMPLETE':
                roomManager.handleVerification(roomCode, message.playerAId, message.playerBId);
                break;

            case 'VOTE_NOMINATE':
                roomManager.handleNomination(roomCode, playerId, message.targetId);
                break;

            case 'VOTE_CAST':
                roomManager.handleVote(roomCode, playerId, message.choice);
                break;

            case 'CHAT_SEND':
                roomManager.handleChat(roomCode, playerId, message);
                break;

            case 'SOLVE_ATTEMPT':
                roomManager.handleSolveAttempt(roomCode, playerId, message);
                break;

            case 'SABOTAGE_LOCK_BUILDING':
                roomManager.handleSabotageLock(roomCode, playerId, message.buildingId);
                break;

            case 'SABOTAGE_PLANT_FRAGMENT':
                roomManager.handleSabotagePlant(roomCode, playerId, message);
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dusk Village server running on port ${PORT}`);
});
```

---

## STEP 29: ROOM MANAGER (SERVER)

### 29.1 Create RoomManager.js

Create `src/server/RoomManager.js`:

```javascript
const { v4: uuidv4 } = require('uuid');
const { GameSession } = require('./GameSession');

class RoomManager {
    constructor() {
        this.rooms = new Map();  // roomCode -> GameSession
    }

    createRoom(ws, playerName) {
        const code = this.generateRoomCode();
        const playerId = uuidv4();

        const session = new GameSession(code);
        session.addPlayer(playerId, playerName, ws, 1, true);

        this.rooms.set(code, session);

        return { code, hostId: playerId };
    }

    joinRoom(roomCode, ws, playerName) {
        const session = this.rooms.get(roomCode);
        if (!session) return { success: false, reason: 'Room not found' };
        if (session.players.size >= 10) return { success: false, reason: 'Room is full' };
        if (session.state !== 'LOBBY') return { success: false, reason: 'Game already in progress' };

        const playerId = uuidv4();
        const slot = session.getNextAvailableSlot();

        session.addPlayer(playerId, playerName, ws, slot, false);

        return {
            success: true,
            playerId,
            slot,
            currentPlayers: session.getPlayerList()
        };
    }

    startGame(roomCode, hostId) {
        const session = this.rooms.get(roomCode);
        if (!session) return;
        if (session.hostId !== hostId) return;
        if (session.players.size < 10) return;

        session.startGame();
    }

    broadcast(roomCode, message, excludeId = null) {
        const session = this.rooms.get(roomCode);
        if (!session) return;
        session.broadcast(message, excludeId);
    }

    // ... (delegated methods for all game actions)
    handlePlayerMove(roomCode, playerId, moveData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handlePlayerMove(playerId, moveData);
    }

    handleFragmentPickup(roomCode, playerId, fragmentId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleFragmentPickup(playerId, fragmentId);
    }

    handleFragmentDrop(roomCode, playerId, position) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleFragmentDrop(playerId, position);
    }

    handleVerification(roomCode, playerAId, playerBId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleVerification(playerAId, playerBId);
    }

    handleNomination(roomCode, nominatorId, targetId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleNomination(nominatorId, targetId);
    }

    handleVote(roomCode, voterId, choice) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleVote(voterId, choice);
    }

    handleChat(roomCode, senderId, chatData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleChat(senderId, chatData);
    }

    handleSolveAttempt(roomCode, playerId, solveData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSolveAttempt(playerId, solveData);
    }

    handleSabotageLock(roomCode, instigatorId, buildingId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSabotageLock(instigatorId, buildingId);
    }

    handleSabotagePlant(roomCode, instigatorId, plantData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSabotagePlant(instigatorId, plantData);
    }

    handleDisconnect(roomCode, playerId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleDisconnect(playerId);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
            code = 'DV-';
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }
}

module.exports = { RoomManager };
```

---

## STEP 30: GAME SESSION (SERVER — AUTHORITATIVE LOGIC)

### 30.1 Create GameSession.js

Create `src/server/GameSession.js` — this is the **authoritative game logic**:

```javascript
const { MYSTERIES } = require('./MysteryRegistry');
const { v4: uuidv4 } = require('uuid');

class GameSession {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.state = 'LOBBY';
        this.players = new Map();
        this.hostId = null;
        this.currentPhase = null;
        this.currentDayNumber = 0;
        this.currentMystery = null;
        this.phaseTimer = null;

        // Fragment state
        this.worldFragments = new Map();
        this.pendingLockouts = [];
        this.pendingForgedFragments = [];

        // Voting
        this.nominatedPlayerId = null;
        this.votes = new Map();

        // History
        this.evictionHistory = [];
        this.verificationHistory = [];
    }

    addPlayer(playerId, name, ws, slot, isHost) {
        this.players.set(playerId, {
            id: playerId,
            name: name,
            ws: ws,
            slot: slot,
            isHost: isHost,
            avatarId: null,
            role: null,
            isAlive: true,
            isConnected: true,
            isReady: false,
            heldFragmentId: null,
            currentLocation: 'EXTERIOR',
            x: 0, y: 0,
            hasLockedBuildingThisNight: false,
            hasPlantedFragmentThisNight: false,
            currentVote: null
        });

        if (isHost) this.hostId = playerId;
    }

    startGame() {
        this.state = 'CHARACTER_SELECT';
        this.broadcast({ type: 'GAME_STARTING', phase: 'CHARACTER_SELECT' });

        // After character select timeout, assign roles
        setTimeout(() => {
            this.assignRoles();
            this.selectMystery();
            this.spawnFragments();
            this.startRoleAssignment();
        }, 30000); // 30 second character select
    }

    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const shuffled = this.fisherYatesShuffle(playerIds);

        // First 3 = Instigators, rest = Survivors
        shuffled.forEach((id, index) => {
            const player = this.players.get(id);
            player.role = index < 3 ? 'INSTIGATOR' : 'SURVIVOR';
        });

        // Send private role assignments
        this.players.forEach((player) => {
            const teammates = player.role === 'INSTIGATOR'
                ? Array.from(this.players.values())
                    .filter(p => p.role === 'INSTIGATOR' && p.id !== player.id)
                    .map(p => ({ id: p.id, name: p.name }))
                : [];

            this.sendToPlayer(player.id, {
                type: 'ROLE_ASSIGNED',
                role: player.role,
                teammates: teammates
            });
        });
    }

    selectMystery() {
        this.currentMystery = MYSTERIES[Math.floor(Math.random() * MYSTERIES.length)];
    }

    spawnFragments() {
        const mystery = this.currentMystery;
        ['claim', 'context', 'source'].forEach(type => {
            const fragData = mystery.fragments[type];
            this.worldFragments.set(fragData.id, {
                ...fragData,
                fragmentType: type.toUpperCase(),
                isAuthentic: true,
                isPickedUp: false,
                heldByPlayerId: null,
                isVerified: false
            });
        });
    }

    startRoleAssignment() {
        this.currentPhase = 'ROLE_ASSIGNMENT';
        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'ROLE_ASSIGNMENT',
            duration: 10,
            mystery: {
                id: this.currentMystery.id,
                title: this.currentMystery.title,
                narrativeIntro: this.currentMystery.narrativeIntro
            }
        });

        this.phaseTimer = setTimeout(() => this.startDayPhase(), 10000);
    }

    startDayPhase() {
        this.currentPhase = 'DAY_PHASE';
        this.currentDayNumber++;

        // Apply pending lockouts
        this.pendingLockouts.forEach(lockout => {
            this.broadcast({
                type: 'BUILDING_LOCKED',
                buildingId: lockout.buildingId,
                duration: 30
            });
        });
        this.pendingLockouts = [];

        // Spawn pending forged fragments
        this.pendingForgedFragments.forEach(frag => {
            this.worldFragments.set(frag.id, frag);
            this.broadcast({
                type: 'FRAGMENT_SPAWNED',
                fragment: frag
            });
        });
        this.pendingForgedFragments = [];

        // Reset night abilities
        this.players.forEach(p => {
            p.hasLockedBuildingThisNight = false;
            p.hasPlantedFragmentThisNight = false;
        });

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'DAY_PHASE',
            duration: 120,
            dayNumber: this.currentDayNumber
        });

        this.phaseTimer = setTimeout(() => this.startJudgementPhase(), 120000);
    }

    startJudgementPhase() {
        this.currentPhase = 'JUDGEMENT_PHASE';
        this.nominatedPlayerId = null;
        this.votes.clear();

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'JUDGEMENT_PHASE',
            duration: 60
        });

        this.phaseTimer = setTimeout(() => this.resolveJudgement(), 60000);
    }

    resolveJudgement() {
        if (this.nominatedPlayerId) {
            const livingPlayers = this.getAlivePlayers();
            const totalVoters = livingPlayers.length;
            let banVotes = 0;
            let forgiveVotes = 0;

            this.votes.forEach((choice) => {
                if (choice === 'BAN') banVotes++;
                else if (choice === 'FORGIVE') forgiveVotes++;
            });

            const majorityThreshold = Math.floor(totalVoters / 2) + 1;
            let result = 'FORGIVEN';

            if (banVotes >= majorityThreshold) {
                result = 'EVICTED';
                this.evictPlayer(this.nominatedPlayerId);
            }

            this.broadcast({
                type: 'VOTE_RESULT',
                nominatedPlayerId: this.nominatedPlayerId,
                banVotes,
                forgiveVotes,
                totalVoters,
                result
            });
        }

        // Check win condition
        const winResult = this.checkWinCondition();
        if (winResult) {
            this.endGame(winResult);
            return;
        }

        this.startNightPhase();
    }

    startNightPhase() {
        this.currentPhase = 'NIGHT_PHASE';

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'NIGHT_PHASE',
            duration: 60
        });

        this.phaseTimer = setTimeout(() => this.startDayPhase(), 60000);
    }

    evictPlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isAlive = false;

            // Drop held fragment
            if (player.heldFragmentId) {
                const fragment = this.worldFragments.get(player.heldFragmentId);
                if (fragment) {
                    fragment.isPickedUp = false;
                    fragment.heldByPlayerId = null;
                }
                player.heldFragmentId = null;
            }

            this.evictionHistory.push({
                day: this.currentDayNumber,
                playerId: playerId,
                role: player.role
            });

            this.broadcast({
                type: 'PLAYER_EVICTED',
                playerId: playerId,
                day: this.currentDayNumber
            });
        }
    }

    checkWinCondition() {
        const alive = this.getAlivePlayers();
        const aliveSurvivors = alive.filter(p => p.role === 'SURVIVOR').length;
        const aliveInstigators = alive.filter(p => p.role === 'INSTIGATOR').length;

        if (aliveInstigators === 0) {
            return { winner: 'SURVIVORS', reason: 'ALL_INSTIGATORS_EVICTED' };
        }

        if (aliveSurvivors <= aliveInstigators) {
            return { winner: 'INSTIGATORS', reason: 'VOTING_PARITY' };
        }

        return null;
    }

    handleSolveAttempt(playerId, solveData) {
        const { claimId, contextId, sourceId } = solveData;
        const mystery = this.currentMystery;

        const claim = this.worldFragments.get(claimId) || this.getHeldFragment(claimId);
        const context = this.worldFragments.get(contextId) || this.getHeldFragment(contextId);
        const source = this.worldFragments.get(sourceId) || this.getHeldFragment(sourceId);

        if (!claim || !context || !source) {
            this.sendToPlayer(playerId, { type: 'SOLVE_FAILED', reason: 'Missing fragments.' });
            return;
        }

        if (!claim.isVerified || !context.isVerified || !source.isVerified) {
            this.sendToPlayer(playerId, { type: 'SOLVE_FAILED', reason: 'Fragments must be verified.' });
            return;
        }

        if (!claim.isAuthentic || !context.isAuthentic || !source.isAuthentic) {
            this.sendToPlayer(playerId, { type: 'SOLVE_FAILED', reason: 'Forged fragments detected!' });
            return;
        }

        if (claim.fragmentType !== 'CLAIM' || context.fragmentType !== 'CONTEXT' || source.fragmentType !== 'SOURCE') {
            this.sendToPlayer(playerId, { type: 'SOLVE_FAILED', reason: 'Wrong fragment slots.' });
            return;
        }

        // SUCCESS
        this.endGame({ winner: 'SURVIVORS', reason: 'MYSTERY_SOLVED' });
    }

    endGame(result) {
        this.currentPhase = 'GAME_OVER';
        clearTimeout(this.phaseTimer);

        // Reveal all roles
        const roleReveal = Array.from(this.players.values()).map(p => ({
            playerId: p.id,
            displayName: p.name,
            role: p.role,
            avatarId: p.avatarId,
            isAlive: p.isAlive,
            eliminationDay: this.evictionHistory.find(e => e.playerId === p.id)?.day || null
        }));

        this.broadcast({
            type: 'GAME_OVER',
            winner: result.winner,
            reason: result.reason,
            roleReveal: roleReveal,
            mysteryResult: {
                id: this.currentMystery.id,
                title: this.currentMystery.title
            }
        });
    }

    handleVerification(playerAId, playerBId) {
        const playerA = this.players.get(playerAId);
        const playerB = this.players.get(playerBId);
        if (!playerA || !playerB) return;

        // Verify fragments held by both players
        [playerA, playerB].forEach(player => {
            if (player.heldFragmentId) {
                const fragment = this.worldFragments.get(player.heldFragmentId) ||
                                 this.getHeldFragment(player.heldFragmentId);
                if (fragment) {
                    fragment.isVerified = true;

                    // Send result ONLY to the two players at the podium
                    [playerAId, playerBId].forEach(pid => {
                        this.sendToPlayer(pid, {
                            type: 'VERIFICATION_RESULT',
                            fragmentId: fragment.id,
                            isAuthentic: fragment.isAuthentic,
                            playerId: player.id
                        });
                    });
                }
            }
        });
    }

    handleNomination(nominatorId, targetId) {
        if (this.currentPhase !== 'JUDGEMENT_PHASE') return;
        if (this.nominatedPlayerId) return; // Only 1 nomination per phase
        if (nominatorId === targetId) return;

        const target = this.players.get(targetId);
        if (!target || !target.isAlive) return;

        this.nominatedPlayerId = targetId;

        this.broadcast({
            type: 'VOTE_NOMINATION',
            nominatorId: nominatorId,
            nominatedPlayerId: targetId,
            nominatedPlayerName: target.name
        });
    }

    handleVote(voterId, choice) {
        if (this.currentPhase !== 'JUDGEMENT_PHASE') return;
        if (!this.nominatedPlayerId) return;
        if (this.votes.has(voterId)) return;

        const voter = this.players.get(voterId);
        if (!voter || !voter.isAlive) return;

        this.votes.set(voterId, choice);

        this.broadcast({
            type: 'VOTE_CAST_UPDATE',
            voterId: voterId,
            totalVotesCast: this.votes.size,
            totalVoters: this.getAlivePlayers().length
        });
    }

    handleChat(senderId, chatData) {
        const sender = this.players.get(senderId);
        if (!sender || !sender.isAlive) return;

        const message = {
            type: 'CHAT_MESSAGE',
            senderId: senderId,
            senderName: sender.name,
            content: chatData.content.substring(0, 256),
            mode: chatData.mode,
            position: chatData.position,
            timestamp: Date.now()
        };

        // Route based on chat mode
        switch (chatData.mode) {
            case 'PROXIMITY':
                // Send to nearby players
                this.players.forEach(player => {
                    if (player.isAlive && player.isConnected) {
                        const dist = Math.sqrt(
                            (player.x - chatData.position.x) ** 2 +
                            (player.y - chatData.position.y) ** 2
                        );
                        if (dist <= 64 || player.id === senderId) {
                            this.sendToPlayer(player.id, message);
                        }
                    }
                });
                break;

            case 'TOWN':
                this.getAlivePlayers().forEach(p => this.sendToPlayer(p.id, message));
                break;

            case 'INSTIGATOR':
                if (sender.role !== 'INSTIGATOR') return;
                this.players.forEach(p => {
                    if (p.role === 'INSTIGATOR' && p.isConnected) {
                        this.sendToPlayer(p.id, message);
                    }
                });
                break;
        }
    }

    handlePlayerMove(playerId, moveData) {
        const player = this.players.get(playerId);
        if (!player) return;

        // Validate movement permission
        if (this.currentPhase === 'DAY_PHASE' ||
            (this.currentPhase === 'NIGHT_PHASE' && player.role === 'INSTIGATOR')) {
            player.x = moveData.x;
            player.y = moveData.y;

            // Broadcast to other players
            this.broadcast({
                type: 'PLAYER_STATE_UPDATE',
                playerId: playerId,
                x: moveData.x,
                y: moveData.y,
                direction: moveData.direction,
                animation: moveData.animation
            }, playerId);
        }
    }

    handleFragmentPickup(playerId, fragmentId) {
        const player = this.players.get(playerId);
        const fragment = this.worldFragments.get(fragmentId);
        if (!player || !fragment || fragment.isPickedUp) return;
        if (this.currentPhase !== 'DAY_PHASE') return;

        // Drop current fragment if holding one
        if (player.heldFragmentId) {
            this.handleFragmentDrop(playerId, { x: player.x, y: player.y });
        }

        fragment.isPickedUp = true;
        fragment.heldByPlayerId = playerId;
        player.heldFragmentId = fragmentId;

        this.broadcast({
            type: 'FRAGMENT_PICKED_UP',
            playerId: playerId,
            fragmentId: fragmentId
        });
    }

    handleFragmentDrop(playerId, position) {
        const player = this.players.get(playerId);
        if (!player || !player.heldFragmentId) return;

        const fragment = this.worldFragments.get(player.heldFragmentId) ||
                         this.getHeldFragment(player.heldFragmentId);
        if (fragment) {
            fragment.isPickedUp = false;
            fragment.heldByPlayerId = null;
            fragment.spawnTile = { x: position.x / 16, y: position.y / 16 };
        }

        const droppedFragId = player.heldFragmentId;
        player.heldFragmentId = null;

        this.broadcast({
            type: 'FRAGMENT_DROPPED',
            playerId: playerId,
            fragmentId: droppedFragId,
            position: position
        });
    }

    handleSabotageLock(instigatorId, buildingId) {
        const player = this.players.get(instigatorId);
        if (!player || player.role !== 'INSTIGATOR') return;
        if (this.currentPhase !== 'NIGHT_PHASE') return;
        if (player.hasLockedBuildingThisNight) return;

        player.hasLockedBuildingThisNight = true;
        this.pendingLockouts.push({ buildingId, instigatorId, lockDuration: 30000 });

        this.sendToPlayer(instigatorId, {
            type: 'SABOTAGE_CONFIRMED',
            action: 'LOCK',
            buildingId: buildingId
        });
    }

    handleSabotagePlant(instigatorId, plantData) {
        const player = this.players.get(instigatorId);
        if (!player || player.role !== 'INSTIGATOR') return;
        if (this.currentPhase !== 'NIGHT_PHASE') return;
        if (player.hasPlantedFragmentThisNight) return;

        player.hasPlantedFragmentThisNight = true;
        const mystery = this.currentMystery;
        const type = plantData.fragmentType.toLowerCase();
        const forged = mystery.forgedVariants[type];

        const forgedFragment = {
            id: uuidv4(),
            mysteryId: mystery.id,
            fragmentType: plantData.fragmentType,
            isAuthentic: false,
            title: forged.title,
            description: forged.description,
            iconAsset: mystery.fragments[type].iconAsset,
            spawnLocation: plantData.location,
            spawnTile: plantData.spawnTile || { x: Math.floor(Math.random() * 8) + 1, y: Math.floor(Math.random() * 6) + 1 },
            clueText: forged.clueText,
            isPickedUp: false,
            heldByPlayerId: null,
            isVerified: false,
            plantedByInstigatorId: instigatorId
        };

        this.pendingForgedFragments.push(forgedFragment);

        this.sendToPlayer(instigatorId, {
            type: 'SABOTAGE_CONFIRMED',
            action: 'PLANT',
            fragmentType: plantData.fragmentType,
            location: plantData.location
        });
    }

    handleDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isConnected = false;
            this.broadcast({
                type: 'PLAYER_DISCONNECTED',
                playerId: playerId
            });

            // Start reconnection timer
            setTimeout(() => {
                if (!player.isConnected) {
                    // Bot takeover or remove
                    this.broadcast({
                        type: 'PLAYER_BOT_TAKEOVER',
                        playerId: playerId
                    });
                }
            }, 30000);
        }
    }

    // === UTILITY METHODS ===

    getAlivePlayers() {
        return Array.from(this.players.values()).filter(p => p.isAlive);
    }

    getNextAvailableSlot() {
        const usedSlots = new Set(Array.from(this.players.values()).map(p => p.slot));
        for (let i = 1; i <= 10; i++) {
            if (!usedSlots.has(i)) return i;
        }
        return null;
    }

    getPlayerList() {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            slot: p.slot,
            isReady: p.isReady,
            avatarId: p.avatarId
        }));
    }

    getHeldFragment(fragmentId) {
        for (const [id, frag] of this.worldFragments) {
            if (id === fragmentId) return frag;
        }
        return null;
    }

    broadcast(message, excludeId = null) {
        const json = JSON.stringify(message);
        this.players.forEach(player => {
            if (player.id !== excludeId && player.isConnected && player.ws) {
                try {
                    player.ws.send(json);
                } catch (err) {
                    console.error('Send error:', err);
                }
            }
        });
    }

    sendToPlayer(playerId, message) {
        const player = this.players.get(playerId);
        if (player && player.isConnected && player.ws) {
            try {
                player.ws.send(JSON.stringify(message));
            } catch (err) {
                console.error('Send error:', err);
            }
        }
    }

    setPlayerReady(roomCode, playerId, isReady) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = isReady;
            this.broadcast({ type: 'PLAYER_READY', playerId, isReady });
        }
    }

    setCharacter(roomCode, playerId, avatarId) {
        const player = this.players.get(playerId);
        if (player) {
            player.avatarId = avatarId;
            this.broadcast({ type: 'CHARACTER_SELECTED', playerId, avatarId });
        }
    }

    fisherYatesShuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

module.exports = { GameSession };
```

---

## STEP 31: CLIENT SOCKET CONNECTION

### 31.1 Create SocketClient.js

Create `src/client/network/SocketClient.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';

export class SocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(url = `ws://${window.location.hostname}:3000/ws`) {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            gameEvents.emit('network:connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (err) {
                console.error('Parse error:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            gameEvents.emit('network:disconnected');
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Listen for outgoing messages
        gameEvents.on('network:send', (data) => this.send(data));
    }

    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        }
    }

    handleMessage(message) {
        // Route server messages to appropriate game systems via EventBus
        switch (message.type) {
            case 'ROOM_CREATED': gameEvents.emit('lobby:roomCreated', message); break;
            case 'ROOM_JOINED': gameEvents.emit('lobby:roomJoined', message); break;
            case 'PLAYER_JOINED': gameEvents.emit('lobby:playerJoined', message); break;
            case 'PLAYER_LEFT': gameEvents.emit('lobby:playerLeft', message); break;
            case 'PLAYER_READY': gameEvents.emit('lobby:playerReady', message); break;
            case 'GAME_STARTING': gameEvents.emit('game:starting', message); break;
            case 'ROLE_ASSIGNED': gameEvents.emit('role:assigned', message); break;
            case 'PHASE_CHANGE': gameEvents.emit('phase:serverChanged', message); break;
            case 'PLAYER_STATE_UPDATE': gameEvents.emit('player:remoteUpdate', message); break;
            case 'FRAGMENT_SPAWNED': gameEvents.emit('fragment:spawned', message); break;
            case 'FRAGMENT_PICKED_UP': gameEvents.emit('fragment:pickedUpConfirmed', message); break;
            case 'FRAGMENT_DROPPED': gameEvents.emit('fragment:droppedConfirmed', message); break;
            case 'VERIFICATION_RESULT': gameEvents.emit('fragment:verifiedResult', message); break;
            case 'VOTE_NOMINATION': gameEvents.emit('vote:nominationReceived', message); break;
            case 'VOTE_CAST_UPDATE': gameEvents.emit('vote:castUpdate', message); break;
            case 'VOTE_RESULT': gameEvents.emit('vote:resultReceived', message); break;
            case 'PLAYER_EVICTED': gameEvents.emit('player:evicted', message); break;
            case 'CHAT_MESSAGE': gameEvents.emit('chat:received', message); break;
            case 'BUILDING_LOCKED': gameEvents.emit('building:locked', message); break;
            case 'GAME_OVER': gameEvents.emit('game:overReceived', message); break;
            case 'SOLVE_FAILED': gameEvents.emit('mystery:solveFailed', message); break;
            default: console.warn('Unknown server message:', message.type);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
```

---

## STEP 32: MESSAGE HANDLER

### 32.1 Create MessageHandler.js

Create `src/client/network/MessageHandler.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';

/**
 * MessageHandler routes incoming server messages to the correct
 * client-side systems. It acts as the integration layer between
 * the network and game logic.
 */
export class MessageHandler {
    constructor(scene) {
        this.scene = scene;

        // Listen for server-driven phase changes
        gameEvents.on('phase:serverChanged', (data) => {
            this.scene.phaseManager.startPhase(data.phase);
        });

        // Listen for remote player updates
        gameEvents.on('player:remoteUpdate', (data) => {
            this.updateRemotePlayer(data);
        });
    }

    updateRemotePlayer(data) {
        const remotePlayer = this.scene.remotePlayers.get(data.playerId);
        if (remotePlayer) {
            // Interpolate position
            this.scene.tweens.add({
                targets: remotePlayer.sprite,
                x: data.x,
                y: data.y,
                duration: 66,  // ~15fps sync rate
                ease: 'Linear'
            });

            // Update animation
            const avatarKey = `avatar_${remotePlayer.avatarId}`;
            if (data.animation) {
                remotePlayer.sprite.anims.play(`${avatarKey}_${data.animation}`, true);
            }

            // Update shadow
            remotePlayer.shadow.setPosition(data.x, data.y + 12);
        }
    }
}
```

---

# PART 7: UI & HUD IMPLEMENTATION

---

## STEP 33: HUD MANAGER

### 33.1 Create HUDManager.js

Create `src/client/ui/HUDManager.js`:

```javascript
import { gameEvents } from '../utils/EventBus.js';
import { TopBar } from './TopBar.js';
import { PlayerListPanel } from './PlayerListPanel.js';
import { MysteryStatusPanel } from './MysteryStatusPanel.js';
import { ChatBox } from './ChatBox.js';
import { InventoryPanel } from './InventoryPanel.js';

export class HUDManager {
    constructor(scene) {
        this.scene = scene;

        // Create all HUD components
        this.topBar = new TopBar(scene);
        this.playerList = new PlayerListPanel(scene);
        this.mysteryStatus = new MysteryStatusPanel(scene);
        this.chatBox = new ChatBox(scene);
        this.inventory = new InventoryPanel(scene);
    }

    update(time, delta) {
        // Update components that need per-frame updates
    }

    destroy() {
        this.topBar.destroy();
        this.playerList.destroy();
        this.mysteryStatus.destroy();
        this.chatBox.destroy();
        this.inventory.destroy();
    }
}
```

### 33.2 Top Bar Component

Create `src/client/ui/TopBar.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class TopBar {
    constructor(scene) {
        this.scene = scene;
        const width = scene.cameras.main.width;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Background Bar (32px high)
        this.bg = scene.add.rectangle(width / 2, 16, width, 32, COLORS.MIDNIGHT_PANEL);
        this.border = scene.add.rectangle(width / 2, 31, width, 2, COLORS.DUSK_BLUE);

        // Phase Title (Left aligned)
        this.phaseText = scene.add.text(16, 16, 'DAY PHASE', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#F5F0E1'
        }).setOrigin(0, 0.5);

        // Timer Display (Center aligned)
        this.timerText = scene.add.text(width / 2, 16, '2:00', {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#E8D5A3'
        }).setOrigin(0.5, 0.5);

        // Phase Icon / Day Counter (Right aligned)
        this.dayText = scene.add.text(width - 16, 16, 'DAY 1', {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#F39C12'
        }).setOrigin(1, 0.5);

        this.container.add([this.bg, this.border, this.phaseText, this.timerText, this.dayText]);

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('phase:changed', (data) => {
            this.phaseText.setText(data.to.replace('_', ' '));
        });

        gameEvents.on('phase:timerTick', (data) => {
            this.timerText.setText(data.displayString);
            if (data.remaining <= 10) {
                this.timerText.setColor('#C0392B');
            } else if (data.remaining <= 30) {
                this.timerText.setColor('#F39C12');
            } else {
                this.timerText.setColor('#E8D5A3');
            }
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

### 33.3 Player List Panel

Create `src/client/ui/PlayerListPanel.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class PlayerListPanel {
    constructor(scene) {
        this.scene = scene;

        this.container = scene.add.container(12, 44);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Panel Container (120px wide)
        this.bg = scene.add.rectangle(0, 0, 120, 240, COLORS.MIDNIGHT_PANEL).setOrigin(0, 0);
        this.bg.setStrokeStyle(2, COLORS.DUSK_BLUE);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, 120, 20, COLORS.DEEP_INDIGO).setOrigin(0, 0);
        this.headerText = scene.add.text(60, 10, 'VILLAGERS', {
            fontFamily: 'Silkscreen',
            fontSize: '10px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.container.add([this.bg, this.header, this.headerText]);

        this.slots = [];
        for (let i = 0; i < 10; i++) {
            const y = 26 + i * 21;
            const slotBg = scene.add.rectangle(4, y, 112, 18, COLORS.DEEP_INDIGO).setOrigin(0, 0);

            const nameText = scene.add.text(8, y + 9, `P${i + 1}`, {
                fontFamily: 'Pixelify Sans',
                fontSize: '10px',
                color: '#E8D5A3'
            }).setOrigin(0, 0.5);

            const statusText = scene.add.text(112, y + 9, 'Alive', {
                fontFamily: 'Pixelify Sans',
                fontSize: '8px',
                color: '#27AE60'
            }).setOrigin(1, 0.5);

            this.container.add([slotBg, nameText, statusText]);
            this.slots.push({ slotBg, nameText, statusText });
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('player:evicted', (data) => {
            // Mark evicted player in slot
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

### 33.4 Mystery Status Panel

Create `src/client/ui/MysteryStatusPanel.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class MysteryStatusPanel {
    constructor(scene) {
        this.scene = scene;
        const width = scene.cameras.main.width;

        this.container = scene.add.container(width - 152, 44);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Panel Container (140px wide)
        this.bg = scene.add.rectangle(0, 0, 140, 130, COLORS.MIDNIGHT_PANEL).setOrigin(0, 0);
        this.bg.setStrokeStyle(2, COLORS.DUSK_BLUE);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, 140, 20, COLORS.DEEP_INDIGO).setOrigin(0, 0);
        this.titleText = scene.add.text(70, 10, 'MYSTERY STATUS', {
            fontFamily: 'Silkscreen',
            fontSize: '9px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.container.add([this.bg, this.header, this.titleText]);

        // 3 Fragment Rows: Claim, Context, Source
        const fragmentTypes = ['CLAIM', 'CONTEXT', 'SOURCE'];
        this.fragmentRows = {};

        fragmentTypes.forEach((type, index) => {
            const y = 30 + index * 32;

            const label = scene.add.text(10, y, type, {
                fontFamily: 'Silkscreen',
                fontSize: '9px',
                color: '#E8D5A3'
            });

            const status = scene.add.text(130, y, '[-]', {
                fontFamily: 'Pixelify Sans',
                fontSize: '12px',
                color: '#4A5568'
            }).setOrigin(1, 0);

            this.container.add([label, status]);
            this.fragmentRows[type] = status;
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('mystery:fragmentVerified', (data) => {
            const statusText = this.fragmentRows[data.fragmentType];
            if (statusText) {
                if (data.isAuthentic) {
                    statusText.setText('[✓]');
                    statusText.setColor('#27AE60');
                } else {
                    statusText.setText('[✗]');
                    statusText.setColor('#C0392B');
                }
            }
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

### 33.5 Inventory Panel

Create `src/client/ui/InventoryPanel.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class InventoryPanel {
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(width - 172, height - 92);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Panel Container (160px × 80px)
        this.bg = scene.add.rectangle(0, 0, 160, 80, COLORS.MIDNIGHT_PANEL).setOrigin(0, 0);
        this.bg.setStrokeStyle(2, COLORS.DUSK_BLUE);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, 160, 18, COLORS.DEEP_INDIGO).setOrigin(0, 0);
        this.headerText = scene.add.text(80, 9, 'HELD FRAGMENT', {
            fontFamily: 'Silkscreen',
            fontSize: '9px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        // Fragment Slot
        this.slotText = scene.add.text(80, 42, 'Empty (1 Slot Max)', {
            fontFamily: 'Pixelify Sans',
            fontSize: '11px',
            color: '#4A5568'
        }).setOrigin(0.5);

        // Drop Hint
        this.dropHint = scene.add.text(80, 64, 'Press Q to drop', {
            fontFamily: 'Pixelify Sans',
            fontSize: '9px',
            color: '#E8D5A3'
        }).setOrigin(0.5).setVisible(false);

        this.container.add([this.bg, this.header, this.headerText, this.slotText, this.dropHint]);

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('inventory:updated', (data) => {
            if (data.fragment) {
                this.slotText.setText(`${data.fragment.type}: ${data.fragment.title}`);
                this.slotText.setColor('#E8D5A3');
                this.dropHint.setVisible(true);
            } else {
                this.slotText.setText('Empty (1 Slot Max)');
                this.slotText.setColor('#4A5568');
                this.dropHint.setVisible(false);
            }
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 34: ROLE ASSIGNMENT MODAL

Create `src/client/ui/RoleAssignmentModal.js`:

```javascript
import { COLORS, ROLES } from '../utils/Constants.js';

export class RoleAssignmentModal {
    constructor(scene, roleData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        // Dim overlay
        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Modal Box
        this.box = scene.add.rectangle(width / 2, height / 2, 340, 260, COLORS.MIDNIGHT_PANEL);
        this.box.setStrokeStyle(3, roleData.role === ROLES.SURVIVOR ? COLORS.VERIFIED_GREEN : COLORS.ALERT_RED);

        // Title
        this.title = scene.add.text(width / 2, height / 2 - 100, '* YOUR ROLE *', {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        // Portrait Image
        const portraitKey = roleData.role === ROLES.SURVIVOR ? 'port_role_survivor' : 'port_role_instigator';
        this.portrait = scene.add.image(width / 2, height / 2 - 50, portraitKey).setScale(1.5);

        // Role Name
        const roleColor = roleData.role === ROLES.SURVIVOR ? '#27AE60' : '#C0392B';
        this.roleName = scene.add.text(width / 2, height / 2 + 10, roleData.role, {
            fontFamily: 'Silkscreen',
            fontSize: '22px',
            color: roleColor
        }).setOrigin(0.5);

        // Description
        const descText = roleData.role === ROLES.SURVIVOR
            ? 'Cross-reference Memory Fragments\nto solve the mystery and survive.'
            : 'Plant forged fragments and mislead\nthe village to gain parity.';

        this.description = scene.add.text(width / 2, height / 2 + 50, descText, {
            fontFamily: 'Pixelify Sans',
            fontSize: '12px',
            color: '#E8D5A3',
            align: 'center'
        }).setOrigin(0.5);

        // Understood Button (2-second delay)
        this.btn = scene.add.text(width / 2, height / 2 + 100, 'UNDERSTOOD (2s)', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#4A5568',
            backgroundColor: '#16213E',
            padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.box, this.title, this.portrait, this.roleName, this.description, this.btn]);

        // 2-second countdown before click enabled
        scene.time.delayedCall(2000, () => {
            this.btn.setText('UNDERSTOOD');
            this.btn.setColor('#F5F0E1');
            this.btn.setBackgroundColor('#0F3460');
            this.btn.setInteractive({ useHandCursor: true });
            this.btn.on('pointerdown', () => this.destroy());
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 35: VOTING MODAL

Create `src/client/ui/VotingModal.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VotingModal {
    constructor(scene, voteData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        // Dim overlay
        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        // Modal Box
        this.box = scene.add.rectangle(width / 2, height / 2, 380, 220, COLORS.MIDNIGHT_PANEL);
        this.box.setStrokeStyle(3, COLORS.CAUTION_AMBER);

        // Question
        this.title = scene.add.text(width / 2, height / 2 - 70, `VOTE: BAN ${voteData.nominatedPlayerName}?`, {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#F5F0E1',
            align: 'center'
        }).setOrigin(0.5);

        // BAN Button (Danger Red)
        this.banBtn = scene.add.text(width / 2 - 80, height / 2 + 10, 'BAN\n(Guilty)', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#F5F0E1',
            backgroundColor: '#C0392B',
            padding: { left: 24, right: 24, top: 12, bottom: 12 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // FORGIVE Button (Ghost Amber)
        this.forgiveBtn = scene.add.text(width / 2 + 80, height / 2 + 10, 'FORGIVE\n(Skip)', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#E8D5A3',
            backgroundColor: '#16213E',
            padding: { left: 20, right: 20, top: 12, bottom: 12 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.banBtn.on('pointerdown', () => {
            gameEvents.emit('vote:cast', { choice: 'BAN' });
            this.onVoteCast('BAN');
        });

        this.forgiveBtn.on('pointerdown', () => {
            gameEvents.emit('vote:cast', { choice: 'FORGIVE' });
            this.onVoteCast('FORGIVE');
        });

        // Status
        this.statusText = scene.add.text(width / 2, height / 2 + 80, 'Select your vote...', {
            fontFamily: 'Pixelify Sans',
            fontSize: '12px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.box, this.title, this.banBtn, this.forgiveBtn, this.statusText]);
    }

    onVoteCast(choice) {
        this.banBtn.removeInteractive();
        this.forgiveBtn.removeInteractive();
        this.banBtn.setAlpha(0.4);
        this.forgiveBtn.setAlpha(0.4);
        this.statusText.setText(`You voted: ${choice}`);
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 36: SOLVE MYSTERY MODAL

Create `src/client/ui/SolveMysteryModal.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class SolveMysteryModal {
    constructor(scene, mysteryData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Modal Box
        this.box = scene.add.rectangle(width / 2, height / 2, 420, 280, COLORS.MIDNIGHT_PANEL);
        this.box.setStrokeStyle(3, COLORS.DUSK_BLUE);

        // Header
        this.title = scene.add.text(width / 2, height / 2 - 110, 'SOLVE THE MYSTERY', {
            fontFamily: 'Silkscreen',
            fontSize: '18px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.mysteryTitle = scene.add.text(width / 2, height / 2 - 85, `"${mysteryData.title}"`, {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#F39C12'
        }).setOrigin(0.5);

        // 3 Drop Slots: Claim, Context, Source
        const slots = ['CLAIM', 'CONTEXT', 'SOURCE'];
        this.slots = {};

        slots.forEach((type, index) => {
            const x = width / 2 - 120 + index * 120;
            const y = height / 2 - 10;

            const slotBg = scene.add.rectangle(x, y, 90, 80, COLORS.DEEP_INDIGO);
            slotBg.setStrokeStyle(2, COLORS.DUSK_BLUE);

            const slotLabel = scene.add.text(x, y - 25, type, {
                fontFamily: 'Silkscreen',
                fontSize: '10px',
                color: '#E8D5A3'
            }).setOrigin(0.5);

            const slotContent = scene.add.text(x, y + 10, '[Empty]', {
                fontFamily: 'Pixelify Sans',
                fontSize: '10px',
                color: '#4A5568'
            }).setOrigin(0.5);

            this.container.add([slotBg, slotLabel, slotContent]);
            this.slots[type] = slotContent;
        });

        // Submit Button
        this.submitBtn = scene.add.text(width / 2 - 60, height / 2 + 90, 'SUBMIT', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#F5F0E1',
            backgroundColor: '#0F3460',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Cancel Button
        this.cancelBtn = scene.add.text(width / 2 + 60, height / 2 + 90, 'CANCEL', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#E8D5A3',
            backgroundColor: '#16213E',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.cancelBtn.on('pointerdown', () => this.destroy());

        this.container.add([this.dimOverlay, this.box, this.title, this.mysteryTitle, this.submitBtn, this.cancelBtn]);
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 37: LIBRARY CAPACITY MODAL

Create `src/client/ui/LibraryCapacityModal.js`:

```javascript
import { COLORS } from '../utils/Constants.js';

export class LibraryCapacityModal {
    constructor(scene, occupants) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        this.box = scene.add.rectangle(width / 2, height / 2, 300, 180, COLORS.MIDNIGHT_PANEL);
        this.box.setStrokeStyle(3, COLORS.ALERT_RED);

        this.title = scene.add.text(width / 2, height / 2 - 60, '! LIBRARY FULL (2/2)', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#C0392B'
        }).setOrigin(0.5);

        const occupantNames = occupants.map(o => `• ${o.name}`).join('\n');
        this.body = scene.add.text(width / 2, height / 2 - 10, `Current Occupants:\n${occupantNames}\n\nWait for a slot to open.`, {
            fontFamily: 'Pixelify Sans',
            fontSize: '12px',
            color: '#E8D5A3',
            align: 'center'
        }).setOrigin(0.5);

        this.btn = scene.add.text(width / 2, height / 2 + 55, 'OK', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#F5F0E1',
            backgroundColor: '#0F3460',
            padding: { left: 24, right: 24, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.btn.on('pointerdown', () => this.destroy());

        this.container.add([this.dimOverlay, this.box, this.title, this.body, this.btn]);
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 38: GAME OVER SCREEN

Create `src/client/ui/GameOverScreen.js`:

```javascript
import { COLORS } from '../utils/Constants.js';

export class GameOverScreen {
    constructor(scene, resultData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        const titleText = resultData.winner === 'SURVIVORS' ? '★ VICTORY ★' : 'DEFEAT';
        const titleColor = resultData.winner === 'SURVIVORS' ? '#27AE60' : '#C0392B';

        this.title = scene.add.text(width / 2, height / 2 - 120, titleText, {
            fontFamily: 'Silkscreen',
            fontSize: '36px',
            color: titleColor
        }).setOrigin(0.5);

        this.subtitle = scene.add.text(width / 2, height / 2 - 70, `${resultData.winner} WIN`, {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.reason = scene.add.text(width / 2, height / 2 - 40, resultData.reason, {
            fontFamily: 'Pixelify Sans',
            fontSize: '14px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.title, this.subtitle, this.reason]);
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 39: CHAT BOX UI

Create `src/client/ui/ChatBox.js`:

```javascript
import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class ChatBox {
    constructor(scene) {
        this.scene = scene;
        const height = scene.cameras.main.height;

        this.container = scene.add.container(12, height - 92);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Panel Box (280px × 80px)
        this.bg = scene.add.rectangle(0, 0, 280, 80, COLORS.MIDNIGHT_PANEL).setOrigin(0, 0);
        this.bg.setStrokeStyle(2, COLORS.DUSK_BLUE);

        // Messages Text Area
        this.logText = scene.add.text(6, 6, 'Welcome to Dusk Village.', {
            fontFamily: 'Pixelify Sans',
            fontSize: '9px',
            color: '#E8D5A3',
            wordWrap: { width: 268 }
        });

        this.container.add([this.bg, this.logText]);

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('ui:chatMessageReceived', (msg) => {
            const current = this.logText.text;
            const lines = current.split('\n').slice(-4);
            lines.push(`[${msg.mode}] ${msg.senderName}: ${msg.content}`);
            this.logText.setText(lines.join('\n'));
        });
    }

    destroy() {
        this.container.destroy();
    }
}
```

---

## STEP 40: HUD TOP BAR INTEGRATION

TopBar integration connects the PhaseManager timer events directly to the HUD header bar as defined in Step 33.2.


---

# PART 8: AUDIO & VISUAL POLISH

---

## STEP 41: AUDIO MANAGER

### 41.1 Integrate Audio with Phase System

```javascript
// In GameScene.js, add audio management:

setupAudio() {
    this.ambientDay = this.sound.add('amb_day', { loop: true, volume: 0.3 });
    this.ambientJudgement = this.sound.add('amb_judgement', { loop: true, volume: 0 });
    this.ambientNight = this.sound.add('amb_night', { loop: true, volume: 0 });

    // Start day ambient
    this.ambientDay.play();
    this.ambientJudgement.play();
    this.ambientNight.play();

    // Phase-based ambient crossfade
    gameEvents.on('phase:changed', (data) => {
        this.crossfadeAmbient(data.to);
    });
}

crossfadeAmbient(phase) {
    const duration = 1000;

    // Fade all out
    this.tweens.add({ targets: this.ambientDay, volume: 0, duration });
    this.tweens.add({ targets: this.ambientJudgement, volume: 0, duration });
    this.tweens.add({ targets: this.ambientNight, volume: 0, duration });

    // Fade target in
    switch (phase) {
        case 'DAY_PHASE':
            this.tweens.add({ targets: this.ambientDay, volume: 0.3, duration, delay: 500 });
            this.sound.play('sfx_bell_day', { volume: 0.5 });
            break;
        case 'JUDGEMENT_PHASE':
            this.tweens.add({ targets: this.ambientJudgement, volume: 0.4, duration, delay: 500 });
            break;
        case 'NIGHT_PHASE':
            this.tweens.add({ targets: this.ambientNight, volume: 0.2, duration, delay: 500 });
            this.sound.play('sfx_bell_night', { volume: 0.5 });
            break;
    }
}
```

---

## STEP 42: PHASE TRANSITION VFX

### 42.1 Dawn Sweep Effect

```javascript
playDawnSweep() {
    // Create a gradient band that sweeps left-to-right
    const { width, height } = this.cameras.main;

    const sweepBar = this.add.rectangle(-200, height / 2, 200, height, 0xFFF5E0, 0.3);
    sweepBar.setScrollFactor(0);
    sweepBar.setDepth(199);

    this.tweens.add({
        targets: sweepBar,
        x: width + 200,
        duration: 3000,
        ease: 'Linear',
        onComplete: () => sweepBar.destroy()
    });
}
```

---

## STEP 43: PARTICLE EFFECTS

### 43.1 Fallen Leaves Ambient Particles

```javascript
createLeafParticles() {
    // Create ambient leaf particles across the map
    const emitter = this.add.particles(0, 0, 'spr_fallen_leaves', {
        x: { min: 0, max: this.map.widthInPixels },
        y: -20,
        lifespan: 8000,
        speedY: { min: 10, max: 30 },
        speedX: { min: -15, max: 15 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 0.8, end: 0 },
        frequency: 2000,
        quantity: 1,
        frame: [0, 1, 2]
    });

    emitter.setDepth(150); // Above buildings, below HUD
}
```

---

## STEP 44: LANTERN LIGHT EFFECTS

### 44.1 Dynamic Light Points

```javascript
createLanternLights() {
    // Place point lights at each lamp post location
    const lampPositions = [
        // Village Square corner lamps (4)
        { x: 448, y: 320 }, { x: 512, y: 320 },
        { x: 448, y: 400 }, { x: 512, y: 400 },
        // Path lamps (additional)
    ];

    this.lanternLights = lampPositions.map(pos => {
        const light = this.add.pointlight(pos.x, pos.y, 0xF6AD55, 48, 0.3);
        light.setDepth(90);

        // Flicker effect
        this.tweens.add({
            targets: light,
            intensity: { from: 0.25, to: 0.35 },
            radius: { from: 44, to: 52 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return light;
    });
}
```

---

# PART 9: TESTING, OPTIMIZATION & DEPLOYMENT

---

## STEP 45: LOCAL DEVELOPMENT & TESTING

### 45.1 Running the Development Environment

```bash
# Terminal 1: Start the game server
cd c:\duskvillage
npm run dev:server

# Terminal 2: Start the client dev server
npm run dev:client

# Or run both simultaneously:
npm run dev
```

### 45.2 Accessing the Game

Open Chrome and navigate to: `http://localhost:8080`

### 45.3 Testing with Multiple Clients

To test multiplayer locally, open 10 browser tabs/windows all pointing to `http://localhost:8080`. Each tab simulates a different player.

---

## STEP 46: SINGLE-PLAYER DEBUG MODE

### 46.1 Create a Debug Configuration

For development, implement a debug mode that allows testing with fewer than 10 players:

```javascript
// In Constants.js, add:
export const DEBUG = {
    ENABLED: true,
    MIN_PLAYERS: 1,         // Allow starting with 1 player
    SKIP_CHARACTER_SELECT: false,
    AUTO_ASSIGN_ROLES: true,
    SHOW_ALL_ROLES: true,   // Reveal all roles (debug only)
    SHOW_FRAGMENT_AUTH: true, // Show auth status on fragments
    INVINCIBLE: false,
    INSTANT_VERIFICATION: false
};
```

---

## STEP 47: UNIT TESTING

### 47.1 Test Key Systems

Install Jest:

```bash
npm install --save-dev jest
```

Create tests for critical game logic:

```
tests/
├── GameSession.test.js        # Role assignment, win conditions
├── VotingSystem.test.js       # Vote tallying, majority rules
├── FragmentManager.test.js    # Pickup, drop, verification
├── PhaseManager.test.js       # Phase transitions, timer
├── MysteryRegistry.test.js    # Solve validation
└── ValidationLayer.test.js    # Anti-cheat checks
```

Example test:

```javascript
// tests/GameSession.test.js
const { GameSession } = require('../src/server/GameSession');

describe('GameSession', () => {
    let session;

    beforeEach(() => {
        session = new GameSession('DV-TEST');
        // Add 10 mock players
        for (let i = 1; i <= 10; i++) {
            session.addPlayer(`player_${i}`, `Player ${i}`, null, i, i === 1);
        }
    });

    test('assigns exactly 3 instigators and 7 survivors', () => {
        session.assignRoles();
        const roles = Array.from(session.players.values()).map(p => p.role);
        expect(roles.filter(r => r === 'INSTIGATOR')).toHaveLength(3);
        expect(roles.filter(r => r === 'SURVIVOR')).toHaveLength(7);
    });

    test('instigators win when survivors reach parity', () => {
        session.assignRoles();
        // Evict survivors until parity
        const survivors = Array.from(session.players.values()).filter(p => p.role === 'SURVIVOR');
        for (let i = 0; i < 5; i++) {
            session.evictPlayer(survivors[i].id);
        }
        // 2 survivors vs 3 instigators
        const result = session.checkWinCondition();
        expect(result.winner).toBe('INSTIGATORS');
        expect(result.reason).toBe('VOTING_PARITY');
    });

    test('survivors win when all instigators evicted', () => {
        session.assignRoles();
        const instigators = Array.from(session.players.values()).filter(p => p.role === 'INSTIGATOR');
        instigators.forEach(i => session.evictPlayer(i.id));
        const result = session.checkWinCondition();
        expect(result.winner).toBe('SURVIVORS');
        expect(result.reason).toBe('ALL_INSTIGATORS_EVICTED');
    });
});
```

Run tests:

```bash
npm test
```

---

## STEP 48: PERFORMANCE OPTIMIZATION

### 48.1 Optimization Checklist

| Area | Optimization | Priority |
| :--- | :--- | :--- |
| **Rendering** | Enable Phaser `pixelArt: true` to disable anti-aliasing | P0 |
| **Rendering** | Use `roundPixels: true` to prevent sub-pixel rendering | P0 |
| **Tilemap** | Only render tiles within camera viewport (Phaser handles this) | P0 |
| **Sprites** | Use sprite sheets instead of individual images | P0 |
| **Sprites** | Object pooling for particles and VFX | P1 |
| **Network** | Throttle position updates to 15/sec | P0 |
| **Network** | Delta compression for position updates | P1 |
| **Audio** | Lazy-load ambient tracks after initial boot | P1 |
| **Memory** | Destroy unused scenes when transitioning | P1 |
| **Memory** | Clean up event listeners on scene destroy | P0 |
| **Build** | Webpack code splitting for scenes | P2 |
| **Build** | Compress texture atlases | P1 |

---

## STEP 49: PRODUCTION BUILD

### 49.1 Build for Production

```bash
npm run build
```

This runs Webpack in production mode, generating optimized bundles in `dist/`:

```
dist/
├── index.html
├── bundle.[hash].js
└── assets/
    ├── sprites/
    ├── tilemaps/
    ├── audio/
    └── fonts/
```

### 49.2 Deploy the Server

For production deployment:

1. **Server Host:** Deploy `src/server/` to a Node.js hosting service (e.g., Heroku, Railway, DigitalOcean, AWS EC2)
2. **Client Host:** Serve the `dist/` folder via a CDN or static hosting (e.g., Netlify, Vercel, Cloudflare Pages)
3. **WebSocket:** Ensure the WebSocket URL in `SocketClient.js` points to the production server

```bash
# Production server start
NODE_ENV=production npm start
```

---

## STEP 50: FINAL INTEGRATION CHECKLIST

### 50.1 Pre-Launch Verification

| # | Check | Status |
| :--- | :--- | :--- |
| 1 | All 5 avatar sprites load and animate correctly (walk, idle, interact, dissolve) | ☐ |
| 2 | All 13 portraits display correctly (5 select, 5 eliminated, 1 anonymous, 2 role) | ☐ |
| 3 | Village exterior tilemap loads with correct collision | ☐ |
| 4 | All 5 interior maps load and have correct interactables | ☐ |
| 5 | 4-direction WASD movement works with no diagonal | ☐ |
| 6 | Camera follows player and clamps to map bounds | ☐ |
| 7 | Pixel-perfect rendering (no blurry sprites at any resolution) | ☐ |
| 8 | Lobby system: create room, join room, ready up, start game | ☐ |
| 9 | Character selection: 5 avatars, 30-second timer, confirm | ☐ |
| 10 | Role assignment: private reveal, 10-second countdown, unskippable modal | ☐ |
| 11 | Day Phase: 120-second timer, fragment pickup, building entry | ☐ |
| 12 | Library: 2-player max capacity, verification podium, 10-second timer | ☐ |
| 13 | Judgement Phase: 60-second timer, nomination, BAN/FORGIVE voting | ☐ |
| 14 | Night Phase: instigator movement, building lockout, forged fragment planting | ☐ |
| 15 | All 5 mysteries load correctly with correct fragment locations | ☐ |
| 16 | Fragment pickup, drop, swap, and verification flow works | ☐ |
| 17 | Solve Mystery interface validates correctly (success & fail) | ☐ |
| 18 | Proximity chat (64px range), Town chat, Instigator chat modes | ☐ |
| 19 | Phase transitions: overlay color changes, dawn sweep VFX | ☐ |
| 20 | Player eviction: dissolve VFX, ban sever VFX, portrait update | ☐ |
| 21 | Win conditions: Mystery Solved, All Instigators Evicted, Voting Parity | ☐ |
| 22 | Game Over screen: victory/defeat, role reveal, play again | ☐ |
| 23 | All 10 SFX play at correct triggers | ☐ |
| 24 | Ambient audio crossfades between phases | ☐ |
| 25 | HUD: Top Bar, Player List, Mystery Status, Chat Box, Inventory | ☐ |
| 26 | Timer visual urgency: amber at 30s, red at 10s, flash at final 10s | ☐ |
| 27 | WebSocket: 10 concurrent connections with no desync | ☐ |
| 28 | Server validates all critical actions (anti-cheat) | ☐ |
| 29 | Disconnection handling: 30-second reconnect window | ☐ |
| 30 | Production build generates correct dist/ output | ☐ |

---

## BUILD ORDER SUMMARY

For efficient development, follow this recommended build sequence:

```
PHASE 1 — FOUNDATION (Week 1-2)
├── Steps 1–4: Environment, npm, Webpack, Phaser config
├── Steps 5–8: Generate sprites, fonts, tilemaps, audio
└── Steps 9–14: Boot scene, menu, lobby, character select, phase manager

PHASE 2 — CORE GAMEPLAY (Week 3-4)
├── Steps 15–17: GameScene, player movement, interiors
├── Steps 18–19: Fragment entities, fragment manager
├── Steps 20–24: Verification, voting, sabotage, chat, win condition
└── Steps 25–27: Game over, mystery registry, solve flow

PHASE 3 — MULTIPLAYER (Week 5-6)
├── Steps 28–30: WebSocket server, room manager, game session
├── Steps 31–32: Client socket, message handler
└── Integrate client-server communication for all systems

PHASE 4 — UI & POLISH (Week 7-8)
├── Steps 33–40: HUD components, all modals
├── Steps 41–44: Audio manager, VFX, particles, lighting
└── Steps 45–50: Testing, optimization, deployment
```

---

*End of Complete Step-by-Step Build Guide — v1.0*
