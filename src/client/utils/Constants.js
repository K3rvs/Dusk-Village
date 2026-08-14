export const CONFIG = {
    // Players
    TOTAL_PLAYERS: 10,
    SURVIVOR_COUNT: 7,
    INSTIGATOR_COUNT: 3,

    // Phase Durations (seconds)
    ROLE_ASSIGNMENT_DURATION: 15,       // 15 seconds Initiation Phase inside house
    DAY_PHASE_DURATION: 150,            // 2 minutes and 30 seconds Day Phase
    JUDGEMENT_PHASE_DURATION: 60,       // 1 minute Judgement Phase
    NIGHT_PHASE_DURATION: 30,           // 30 seconds Night Phase
    CHARACTER_SELECT_DURATION: 30,

    // Movement
    PLAYER_SPEED: 64,                   // px/sec (at base resolution)
    TILE_SIZE: 16,                      // px

    // Library
    LIBRARY_MAX_CAPACITY: 2,
    VERIFICATION_DURATION: 2,           // seconds

    // Sabotage
    BUILDING_LOCK_DURATION: 20,         // 20 seconds building lockout
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
