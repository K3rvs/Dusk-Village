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

        // --- Characters ---
        // Load the 16x24 pixel art spritesheets instead of the hi-res concept art
        for (let i = 1; i <= 6; i++) {
            const id = String(i).padStart(2, '0');
            this.load.spritesheet(`spr_avatar_${id}`, `assets/sprites/characters/spr_avatar_${id}.png`, {
                frameWidth: 16, frameHeight: 24
            });
        }
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

        // --- Buildings: Civic = 7x7 tiles (112x112px), Cottages = 5x5 tiles (80x80px) ---
        this.load.spritesheet('spr_bldg_villagehall', 'assets/sprites/buildings/sprite_building_villagehall.png', { frameWidth: 336, frameHeight: 336 });
        this.load.spritesheet('spr_bldg_library', 'assets/sprites/buildings/sprite_building_library.png', { frameWidth: 336, frameHeight: 336 });
        this.load.spritesheet('spr_bldg_school', 'assets/sprites/buildings/sprite_building_school.png', { frameWidth: 336, frameHeight: 336 });
        this.load.spritesheet('spr_bldg_clinic', 'assets/sprites/buildings/sprite_building_clinic.png', { frameWidth: 336, frameHeight: 336 });
        for (let i = 1; i <= 10; i++) {
            const num = i < 10 ? `0${i}` : `${i}`;
            this.load.spritesheet(`spr_bldg_house_${num}`, `assets/sprites/buildings/sprite_building_player-house-${num}.png`, { frameWidth: 336, frameHeight: 336 });
        }

        this.load.image('spr_statue_angel', 'assets/sprites/buildings/sprite_statue_angel.png');
        this.load.image('spr_bldg_fountain', 'assets/sprites/buildings/sprite_fountain.png');
        this.load.image('spr_gate_iron', 'assets/sprites/buildings/spr_gate_iron.png');
        this.load.image('spr_mailboxes', 'assets/sprites/buildings/spr_mailboxes.png');
        this.load.image('building_badges', 'assets/sprites/buildings/building_badges.png');
        this.load.image('tileset_buildings_master', 'assets/sprites/buildings/tileset_buildings_master.png');

        // --- Terrain ---
        this.load.image('tile_ground_dirt', 'assets/sprites/terrain/tile_ground_dirt.png');
        this.load.image('tile_ground_cobble', 'assets/sprites/terrain/tile_ground_cobble.png');
        this.load.image('tile_ground_grass', 'assets/sprites/terrain/tile_ground_grass_01.png');
        this.load.image('tile_ground_stone', 'assets/sprites/terrain/tile_ground_stone.png');
        this.load.spritesheet('spr_tree_autumn_oak', 'assets/sprites/terrain/spr_tree_autumn_oak.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('spr_tree_pine_border', 'assets/sprites/terrain/sprite_tree_pine.png');
        this.load.image('spr_bush_rose', 'assets/sprites/terrain/sprite_bush_rose.png');
        this.load.image('spr_foliage_bushes', 'assets/sprites/terrain/spr_foliage_bushes.png');
        this.load.spritesheet('spr_bush_circular', 'assets/sprites/terrain/spr_bush_circular.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('spr_tall_grass', 'assets/sprites/terrain/spr_tall_grass.png', {
            frameWidth: 16, frameHeight: 24
        });
        this.load.spritesheet('spr_fallen_leaves', 'assets/sprites/terrain/spr_fallen_leaves.png', {
            frameWidth: 16, frameHeight: 16
        });
        this.load.image('spr_wall_octagonal', 'assets/sprites/terrain/spr_wall_octagonal.png');
        this.load.image('prop_fence_picket', 'assets/sprites/terrain/prop_fence_picket.png');
        this.load.image('tileset_terrain_trees', 'assets/sprites/terrain/tileset_terrain_trees.png');

        // --- Props & Furniture ---
        this.load.image('outdoor_props', 'assets/sprites/props/outdoor_props.png');
        this.load.image('interior_props', 'assets/sprites/props/interior_props.png');
        this.load.image('mkt_stand_1', 'assets/sprites/props/marketplace/market stand 1.png');
        this.load.image('mkt_stand_2', 'assets/sprites/props/marketplace/market stand 2.png');
        this.load.image('mkt_stand_3', 'assets/sprites/props/marketplace/market stand 3.png');
        this.load.image('mkt_stand_4', 'assets/sprites/props/marketplace/market stand 4.png');
        this.load.image('mkt_stand_5', 'assets/sprites/props/marketplace/market stand 5.png');
        this.load.image('mkt_cart', 'assets/sprites/props/marketplace/cart.png');
        this.load.image('mkt_picnic', 'assets/sprites/props/marketplace/picnic table.png');
        this.load.image('mkt_sign', 'assets/sprites/props/marketplace/sign post.png');
        this.load.image('mkt_flower_bed', 'assets/sprites/props/marketplace/flower bed.png');


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
        this.load.image('bg_menu_dusk', 'assets/sprites/ui/bg_menu_dusk.jpg');

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

        // --- Tilemaps (using the generated maps in assets/tilemaps) ---
        this.load.tilemapTiledJSON('map_village_exterior', 'assets/tilemaps/village_exterior.json');
        this.load.tilemapTiledJSON('map_interior_village_hall', 'assets/tilemaps/interior_village_hall.json');
        this.load.tilemapTiledJSON('map_interior_library', 'assets/tilemaps/interior_library.json');
        this.load.tilemapTiledJSON('map_interior_school', 'assets/tilemaps/interior_school.json');
        this.load.tilemapTiledJSON('map_interior_clinic', 'assets/tilemaps/interior_clinic.json');
        this.load.tilemapTiledJSON('map_interior_house', 'assets/tilemaps/interior_house.json');

        // --- Audio (graceful handling — files may not exist yet) ---
        // SFX
        const sfxFiles = [
            ['sfx_button_click', 'assets/audio/sfx/button_click.wav'],
            ['sfx_panel_open', 'assets/audio/sfx/panel_open.wav'],
            ['sfx_fragment_pickup', 'assets/audio/sfx/fragment_pickup.wav'],
            ['sfx_fragment_verified', 'assets/audio/sfx/fragment_verified.wav'],
            ['sfx_solve_fail', 'assets/audio/sfx/solve_fail.wav'],
            ['sfx_bell_day', 'assets/audio/sfx/bell_day.wav'],
            ['sfx_bell_night', 'assets/audio/sfx/bell_night.wav'],
            ['sfx_ban_sever', 'assets/audio/sfx/ban_sever.wav']
        ];
        // Music
        const musicFiles = [
            ['mus_victory_fanfare', 'assets/audio/music/victory_fanfare.wav'],
            ['mus_defeat_sting', 'assets/audio/music/defeat_sting.wav'],
            ['amb_day', 'assets/audio/music/ambient_day.ogg'],
            ['amb_judgement', 'assets/audio/music/ambient_judgement.ogg'],
            ['amb_night', 'assets/audio/music/ambient_night.ogg']
        ];

        [...sfxFiles, ...musicFiles].forEach(([key, path]) => {
            this.load.audio(key, path);
        });

        // Handle load errors gracefully (missing audio/tilemap files)
        this.load.on('loaderror', (fileObj) => {
            console.warn(`Asset not found (skipped): ${fileObj.key} — ${fileObj.url}`);
        });
    }

    create() {
        // === CREATE ALL ANIMATIONS & PROP FRAMES ===
        this.createCharacterAnimations();
        this.createVFXAnimations();
        this.createWorldAnimations();
        this.createPropFrames();

        // Wait for Web Fonts to load before transitioning to MenuScene
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                this.scene.start('MenuScene');
            }).catch(() => {
                this.scene.start('MenuScene');
            });
        } else {
            this.scene.start('MenuScene');
        }
    }

    createCharacterAnimations() {
        for (let i = 1; i <= 6; i++) {
            const id = String(i).padStart(2, '0');
            const key = `spr_avatar_${id}`;

            // Check if texture exists before creating animations
            if (!this.textures.exists(key)) continue;

            // Walk cycles (4 frames each, 4 directions: N, S, E, W)
            const directions = ['north', 'south', 'east', 'west'];
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

            // Idle breathing (2 frames each, 4 directions: N, S, E, W)
            directions.forEach((dir, dirIndex) => {
                const startFrame = 16 + (dirIndex * 2);
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
                frames: this.anims.generateFrameNumbers(key, { start: 24, end: 26 }),
                frameRate: 10,
                repeat: 0
            });

            // Elimination dissolve (8 frames)
            this.anims.create({
                key: `avatar_${id}_dissolve`,
                frames: this.anims.generateFrameNumbers(key, { start: 32, end: 39 }),
                frameRate: 10,
                repeat: 0
            });
        }
    }

    createVFXAnimations() {
        // Ban sever (8 frames)
        if (this.textures.exists('vfx_ban_sever')) {
            this.anims.create({
                key: 'vfx_ban_sever_play',
                frames: this.anims.generateFrameNumbers('vfx_ban_sever', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Dissolve player (8 frames)
        if (this.textures.exists('vfx_dissolve_player')) {
            this.anims.create({
                key: 'vfx_dissolve_play',
                frames: this.anims.generateFrameNumbers('vfx_dissolve_player', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: 0
            });
        }

        // Verify sparkle (4 frames, looping during verification)
        if (this.textures.exists('vfx_verify_sparkle')) {
            this.anims.create({
                key: 'vfx_sparkle_play',
                frames: this.anims.generateFrameNumbers('vfx_verify_sparkle', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Statue burst (8 frames)
        if (this.textures.exists('vfx_statue_burst')) {
            this.anims.create({
                key: 'vfx_statue_burst_play',
                frames: this.anims.generateFrameNumbers('vfx_statue_burst', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: 0
            });
        }
    }

    createWorldAnimations() {
        // Fragment world pulse (2 frames)
        if (this.textures.exists('spr_frag_world_pulse')) {
            this.anims.create({
                key: 'frag_world_pulse',
                frames: this.anims.generateFrameNumbers('spr_frag_world_pulse', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Tall grass sway (2 frames)
        if (this.textures.exists('spr_tall_grass')) {
            this.anims.create({
                key: 'tall_grass_sway',
                frames: this.anims.generateFrameNumbers('spr_tall_grass', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Fallen leaves drift (3 frames)
        if (this.textures.exists('spr_fallen_leaves')) {
            this.anims.create({
                key: 'leaves_drift',
                frames: this.anims.generateFrameNumbers('spr_fallen_leaves', { start: 0, end: 2 }),
                frameRate: 3,
                repeat: -1
            });
        }
    }

    createPropFrames() {
        const intTex = this.textures.get('interior_props');
        if (intTex && !intTex.has('prop_council_table')) {
            intTex.add('prop_council_table', 0, 0, 0, 64, 24);
            intTex.add('prop_filing_cabinet', 0, 64, 0, 16, 32);
            intTex.add('prop_lectern', 0, 80, 0, 32, 32);
            intTex.add('prop_verify_podium', 0, 0, 32, 48, 32);
            intTex.add('prop_db_terminal', 0, 48, 32, 32, 32);
            intTex.add('prop_bookshelf', 0, 80, 32, 48, 48);
            intTex.add('prop_school_desk', 0, 0, 80, 16, 16);
            intTex.add('prop_chalkboard', 0, 16, 80, 32, 24);
            intTex.add('prop_medicine_cabinet', 0, 48, 80, 32, 32);
            intTex.add('prop_exam_table', 0, 80, 80, 32, 16);
            intTex.add('prop_cottage_bed', 0, 112, 80, 32, 24);
        }

        const outTex = this.textures.get('outdoor_props');
        if (outTex && !outTex.has('prop_notice_board')) {
            outTex.add('prop_swings', 0, 0, 0, 32, 32);
            outTex.add('prop_slide', 0, 32, 0, 32, 24);
            outTex.add('prop_bench', 0, 64, 0, 32, 16);
            outTex.add('prop_lamp_post', 0, 96, 0, 16, 32);
            outTex.add('prop_well', 0, 0, 32, 32, 32);
            outTex.add('prop_notice_board', 0, 32, 32, 32, 32);
            outTex.add('prop_flower_cart', 0, 64, 32, 32, 24);
            outTex.add('prop_signpost', 0, 96, 32, 16, 32);
            outTex.add('prop_hay_bales', 0, 112, 32, 16, 16);
            outTex.add('prop_barrels_crates', 0, 0, 64, 32, 32);
        }
    }
}
