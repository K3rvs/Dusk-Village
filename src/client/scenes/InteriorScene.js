import Phaser from 'phaser';
import { CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export default class InteriorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InteriorScene' });
    }

    init(data) {
        this.buildingId = data.buildingId || 'HOUSE';
        this.buildingType = data.buildingType || 'house';
        this.localPlayer = data.localPlayer || { avatarId: '01', id: 'player' };
        this.isInitiation = data.isInitiation || false;
        this.isNightPhase = data.isNightPhase || false;
        this.role = data.role || 'SURVIVOR';
        this.teammates = data.teammates || [];
        this.mystery = data.mystery || null;
        this.isVerifying = false;
        this.isLockedForInitiation = this.isInitiation;
        this.isLockedForNight = this.isNightPhase && this.role === 'SURVIVOR';
    }

    getLayoutData() {
        const bTypeUpper = this.buildingType.toUpperCase();
        let key = 'layout_interior_house';
        if (bTypeUpper === 'VILLAGE_HALL' || bTypeUpper === 'VILLAGEHALL') key = 'layout_interior_villagehall';
        else if (bTypeUpper === 'LIBRARY' || bTypeUpper === 'ARCHIVES') key = 'layout_interior_library';
        else if (bTypeUpper === 'CLINIC') key = 'layout_interior_clinic';
        else if (bTypeUpper === 'SCHOOL') key = 'layout_interior_school';
        else if (bTypeUpper === 'LOCAL_HOUSE') key = 'layout_interior_local_house';
        
        if (this.cache.json.has(key)) {
            return this.cache.json.get(key);
        }
        return null;
    }

    getPropTextureKey(key) {
        if (this.textures.exists(key)) return key;
        const aliases = {
            'vh_podium': 'prop_podium',
            'vh_long_table': 'prop_hall_table',
            'vh_council_table': 'prop_teacher_table',
            'vh_record_cabinet': 'prop_clinic_cab_wd',
            'vh_records_box': 'prop_small_bookshelf',
            'vh_chair': 'prop_living_chair',
            'vh_wall_banner': 'prop_school_bookshelf',
            'vh_sideboard': 'prop_clinic_cab_wd',
            'vh_chandelier': 'prop_submit_table',
            'lib_bookcase_wide': 'prop_large_bookshelf',
            'lib_tall_bookshelf': 'prop_school_bookshelf',
            'lib_reading_table': 'prop_students_table',
            'lib_curator_desk': 'prop_library_desk',
            'lib_globe_stand': 'prop_small_table',
            'lib_card_catalog': 'prop_clinic_cab_wd',
            'lib_scroll_rack': 'prop_small_bookshelf',
            'lib_manuscript_shelf': 'prop_medium_bookshelf'
        };
        if (aliases[key] && this.textures.exists(aliases[key])) return aliases[key];
        return null;
    }

    create() {
        // Ensure any floating prompts from the exterior world are hidden
        const ui = this.scene.get('UIScene');
        if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();

        // Set camera background to solid black
        this.cameras.main.setBackgroundColor('#000000');
        this.add.rectangle(0, 0, 4000, 4000, 0x000000).setDepth(-100);

        const bTypeUpper = this.buildingType.toUpperCase();
        const layoutData = this.getLayoutData();

        // Read dimensions from layout JSON
        const cols = (layoutData && layoutData.width) ? layoutData.width : 23;
        const rows = (layoutData && layoutData.height) ? layoutData.height : 15;
        const roomW = cols * 16;
        const roomH = rows * 16;

        // Dynamic scale & centering
        const scale = Math.min(2.0, Math.min(this.scale.width / (roomW + 48), this.scale.height / (roomH + 48)));
        const camW = this.scale.width / scale;
        const camH = this.scale.height / scale;

        const centerX = camW / 2;
        const centerY = camH / 2;
        const roomX = centerX - roomW / 2;
        const roomY = centerY - roomH / 2;

        // Floor Color Theme
        let floorColor = 0x4A2E1B; // Warm Timber
        if (bTypeUpper === 'LIBRARY' || bTypeUpper === 'ARCHIVES') floorColor = 0x4A2E1B;
        else if (bTypeUpper === 'CLINIC') floorColor = 0x334155;
        else if (bTypeUpper === 'VILLAGE_HALL') floorColor = 0x582C12;
        else if (bTypeUpper === 'SCHOOL') floorColor = 0x5C3B1E;

        // Centered Floor Rectangle
        const floor = this.add.rectangle(centerX, centerY, roomW, roomH, floorColor);
        floor.setStrokeStyle(3, 0x1E293B);

        // Dark Slate Wall Outline
        const wallGraphics = this.add.graphics();
        wallGraphics.lineStyle(6, 0x0F172A);
        wallGraphics.strokeRect(roomX + 3, roomY + 3, roomW - 6, roomH - 6);

        // Formatted Title banner
        const formattedTitle = this.buildingId ? String(this.buildingId).replace(/_/g, ' ') : bTypeUpper;
        gameEvents.emit('hud:announcement', { text: `📍 Entering ${formattedTitle}`, color: '#F59E0B' });

        // Physics World Collision Bounds
        this.physics.world.setBounds(roomX + 8, roomY + 8, roomW - 16, roomH - 16);

        // Spawn Player Sprite (Bottom Center of room, comfortably above the door)
        const spawnX = centerX;
        const spawnY = roomY + roomH - 48;

        const avatarId = this.localPlayer.avatarId || '01';
        const spriteKey = `spr_avatar_${avatarId}`;
        if (this.textures.exists(spriteKey)) {
            this.playerSprite = this.physics.add.sprite(spawnX, spawnY, spriteKey, 0);
        } else {
            this.playerSprite = this.physics.add.sprite(spawnX, spawnY, '__DEFAULT');
            this.playerSprite.setDisplaySize(16, 24);
        }

        this.playerSprite.setCollideWorldBounds(true);
        this.playerSprite.setDepth(500);

        // Camera setup
        this.cameras.main.setZoom(scale);
        this.cameras.main.centerOn(centerX, centerY);

        // Input controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Solid Colliders Group
        this.solidColliders = this.physics.add.staticGroup();

        // Create Solid Collision Grid from layout JSON
        if (layoutData && Array.isArray(layoutData.collisionData)) {
            const cData = layoutData.collisionData;
            for (let y = 0; y < rows; y++) {
                let startX = null;
                for (let x = 0; x <= cols; x++) {
                    const isSolid = x < cols && cData[y * cols + x] === 1;
                    if (isSolid && startX === null) {
                        startX = x;
                    } else if (!isSolid && startX !== null) {
                        const count = x - startX;
                        const w = count * 16;
                        const h = 16;
                        const cx = roomX + startX * 16 + w / 2;
                        const cy = roomY + y * 16 + h / 2;
                        
                        const rect = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
                        this.physics.add.existing(rect, true);
                        this.solidColliders.add(rect);
                        startX = null;
                    }
                }
            }
            this.physics.add.collider(this.playerSprite, this.solidColliders);
        }

        // Spawn Interior Structures & Stations from Layout
        this.setupInteractablesFromLayout(layoutData, roomX, roomY, roomW, roomH, cols, rows);
        this.renderInteriorFragments(roomX, roomY, roomW);
        this.setupExitDoor(centerX, roomY + roomH - 8);

        // Initiation Phase setup if starting inside house
        if (this.isInitiation) {
            this.setupInitiationOverlay();
        }
    }

    setupInitiationOverlay() {
        const uiScene = this.scene.get('UIScene');
        if (uiScene && typeof uiScene.showInitiationModal === 'function') {
            uiScene.showInitiationModal(this.role);
        }

        this.time.delayedCall(10000, () => {
            this.isLockedForInitiation = false;
        });

        // Unlock and exit building when returning to Exterior (Day Phase / Judgement Phase)
        gameEvents.on('phase:serverChanged', (data) => {
            if (data.phase === 'DAY_PHASE' || data.phase === 'JUDGEMENT_PHASE') {
                this.isLockedForInitiation = false;
                this.isLockedForNight = false;
                this.exitBuilding();
            } else if (data.phase === 'NIGHT_PHASE') {
                if (this.role === 'SURVIVOR') {
                    this.isLockedForNight = true;
                }
            }
        });
        
        gameEvents.on('interior:lockForNight', () => {
            if (this.role === 'SURVIVOR') {
                this.isLockedForNight = true;
            }
        });
    }

    setupInteractablesFromLayout(layoutData, rx, ry, rw, rh, cols, rows) {
        this.stations = [];
        const structures = (layoutData && layoutData.structures) ? layoutData.structures : [];
        const bType = this.buildingType.toUpperCase();

        // Spawn all placed structures from layout JSON
        structures.forEach(s => {
            const propW = s.w || 1;
            const propH = s.h || 1;
            const px = rx + (s.x + propW / 2) * 16;
            const py = ry + (s.y + propH) * 16;

            const tex = this.getPropTextureKey(s.key);
            if (tex) {
                const img = this.add.image(px, py, tex);
                img.setOrigin(0.5, 1.0);
                img.setDepth(py);
                img.setDisplaySize(propW * 16, propH * 16);
            }

            // Register Interactive Stations based on prop keys
            if (s.key === 'prop_submit_table' || s.key === 'vh_council_table' || s.key === 'vh_long_table') {
                this.createStation('Village Archive (DELIVER CLUE)', px, py - (propH * 16) / 2, propW * 16, propH * 16, null, null, 'DELIVER_FRAGMENT');
            } else if (s.key === 'prop_podium_frag' || s.key === 'vh_podium' || s.key === 'prop_podium') {
                this.createStation('VERIFICATION PODIUM (E)', px, py - (propH * 16) / 2, propW * 16, propH * 16, null, null, 'VERIFY_PODIUM');
            } else if (s.key === 'prop_db_terminal' || s.key === 'vh_record_cabinet') {
                this.createStation('Archived Records', px, py - (propH * 16) / 2, propW * 16, propH * 16, null, null, 'INSPECT');
            }
        });

        // Ensure primary stations exist if not placed
        if (bType === 'VILLAGE_HALL' && !this.stations.some(st => st.action === 'DELIVER_FRAGMENT')) {
            this.createStation('Village Archive (DELIVER CLUE)', rx + rw / 2, ry + rh / 2, 64, 32, null, null, 'DELIVER_FRAGMENT');
        } else if ((bType === 'LIBRARY' || bType === 'ARCHIVES') && !this.stations.some(st => st.action === 'VERIFY_PODIUM')) {
            this.createStation('VERIFICATION PODIUM (E)', rx + rw / 2, ry + rh / 2, 48, 32, null, null, 'VERIFY_PODIUM');
        }

        this.interactKey.on('down', () => {
            if (this.isVerifying) return;

            let interacted = false;

            // Check fragment pickup
            if (this.interiorFragments) {
                for (const frag of this.interiorFragments) {
                    if (this.physics.overlap(this.playerSprite, frag.interactionZone)) {
                        gameEvents.emit('fragment:attemptPickup', { fragmentId: frag.id });
                        interacted = true;
                        break;
                    }
                }
            }

            if (interacted) return;

            this.stations.forEach(station => {
                if (this.physics.overlap(this.playerSprite, station.zone)) {
                    if (station.action === 'VERIFY_PODIUM') {
                        this.startVerification();
                    } else if (station.action === 'DELIVER_FRAGMENT') {
                        if (window.socketClient) {
                            window.socketClient.send({ type: 'FRAGMENT_DELIVER' });
                        }
                    } else if (station.action === 'SOLVE_MYSTERY') {
                        gameEvents.emit('interaction:trigger', { action: 'SOLVE_MYSTERY' });
                    }
                }
            });
        });
    }

    createStation(name, x, y, w, h, texKey = null, frameName = null, action = 'INSPECT') {
        const zone = this.add.zone(x, y, w + 24, h + 24);
        this.physics.add.existing(zone, true);

        const stationObj = { name, zone, action };
        this.stations.push(stationObj);
        return stationObj;
    }

    createPropDecor(x, y, texKey, frameName) {
        if (texKey && frameName && this.textures.exists(texKey)) {
            const prop = this.add.image(x, y, texKey, frameName);
            prop.setDepth(y);
            this.physics.add.existing(prop, true);
            this.physics.add.collider(this.playerSprite, prop);
            return prop;
        }
        return null;
    }

    renderInteriorFragments(rx, ry, rw) {
        this.interiorFragments = [];
        const gameScene = this.scene.get('GameScene');
        if (!gameScene || !gameScene.fragmentManager) return;

        const allFrags = gameScene.fragmentManager.worldFragments;
        const bType = this.buildingType.toUpperCase();
        const bId = (this.buildingId || '').toUpperCase();

        allFrags.forEach(frag => {
            const loc = (frag.location || '').toUpperCase();
            const matchesBuilding = loc === bType || 
                (loc === 'HOUSE' && (bType === 'HOUSE' || bId.startsWith('HOUSE'))) ||
                (loc === 'VILLAGE_HALL' && (bType === 'VILLAGE_HALL' || bType === 'VILLAGEHALL')) ||
                (loc === 'LIBRARY' && (bType === 'LIBRARY' || bType === 'ARCHIVES'));

            if (matchesBuilding) {
                // Determine spawn coordinates
                const spawnTile = frag.spawnTile || frag.spawnLocation || { x: 4, y: 3 };
                const fx = rx + (spawnTile.x || 4) * 16;
                const fy = ry + (spawnTile.y || 3) * 16;

                // Create sprite
                const sprite = this.add.sprite(fx, fy, 'spr_frag_world_pulse');
                if (this.anims.exists('frag_world_pulse')) {
                    sprite.play('frag_world_pulse');
                }
                sprite.setDepth(fy);

                // Interaction zone
                const zone = this.add.zone(fx, fy, 28, 28);
                this.physics.add.existing(zone, true);

                this.interiorFragments.push({
                    id: frag.id,
                    title: frag.title,
                    fragmentType: frag.fragmentType,
                    sprite,
                    interactionZone: zone
                });
            }
        });

        // Listen for pickup success to remove sprite
        gameEvents.on('fragment:pickedUpConfirmed', (data) => {
            const index = this.interiorFragments.findIndex(f => f.id === data.fragmentId);
            if (index !== -1) {
                const f = this.interiorFragments[index];
                f.sprite.destroy();
                f.interactionZone.destroy();
                this.interiorFragments.splice(index, 1);
                
                // Hide prompt if we just picked it up
                const ui = this.scene.get('UIScene');
                if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();
            }
        });
    }

    createPlayer(rx, ry, rw, rh) {
        // Spawn Player Sprite (Bottom Center of room)
        const spawnX = rx + rw / 2;
        const spawnY = ry + rh - 30;

        const avatarId = this.localPlayer.avatarId || '01';
        const spriteKey = `spr_avatar_${avatarId}`;
        if (this.textures.exists(spriteKey)) {
            this.playerSprite = this.physics.add.sprite(spawnX, spawnY, spriteKey, 0);
        } else {
            this.playerSprite = this.physics.add.sprite(spawnX, spawnY, '__DEFAULT');
            this.playerSprite.setDisplaySize(16, 24);
        }

        this.playerSprite.setCollideWorldBounds(true);
        this.playerSprite.setDepth(50);
    }

    startVerification() {
        this.isVerifying = true;
        
        const scale = CONFIG.DEFAULT_RENDER_SCALE || 3;
        const centerX = (this.scale.width / scale) / 2;
        
        const barWidth = 140;
        const barHeight = 12;
        const barX = centerX - barWidth / 2;
        const barY = 44;

        const bgBar = this.add.rectangle(barX, barY, barWidth, barHeight, 0x140F14, 0.95).setOrigin(0, 0.5).setDepth(200);
        bgBar.setStrokeStyle(1.5, 0x785338, 0.9);

        const fillBar = this.add.rectangle(barX + 2, barY, 0, barHeight - 4, 0x10B981).setOrigin(0, 0.5).setDepth(201);
        const label = this.add.text(centerX, barY - 14, 'VERIFYING DOCUMENT METADATA...', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7px',
            color: '#F59E0B'
        }).setOrigin(0.5).setDepth(202);

        let sparkle = null;
        if (this.textures.exists('vfx_verify_sparkle')) {
            sparkle = this.add.sprite(centerX, 68, 'vfx_verify_sparkle').setDepth(203);
            if (this.anims.exists('vfx_sparkle_play')) sparkle.play('vfx_sparkle_play');
        }

        let progress = 0;
        this.time.addEvent({
            delay: 50,
            repeat: 39,
            callback: () => {
                progress += 0.025;
                fillBar.width = (barWidth - 4) * progress;

                if (progress >= 1.0) {
                    this.isVerifying = false;
                    bgBar.destroy();
                    fillBar.destroy();
                    label.destroy();
                    if (sparkle) sparkle.destroy();

                    if (window.socketClient) {
                        window.socketClient.send({
                            type: 'VERIFICATION_COMPLETE',
                            playerAId: this.localPlayer.id,
                            playerBId: this.localPlayer.id
                        });
                    }
                }
            }
        });
    }

    setupExitDoor(exitX, exitY) {
        // Door Threshold Mat (Warm Timber with Amber Border)
        const mat = this.add.rectangle(exitX, exitY, 32, 8, 0x231E1B);
        mat.setStrokeStyle(1, 0xD97706, 0.9);

        this.exitZone = this.add.zone(exitX, exitY + 4, 36, 14);
        this.physics.add.existing(this.exitZone, true);

        this.canExit = false;
        this.time.delayedCall(700, () => {
            this.canExit = true;
        });

        this.lastLockedAlertTime = 0;
        this.physics.add.overlap(this.playerSprite, this.exitZone, () => {
            if (!this.isVerifying && this.canExit) {
                if (this.isLockedForInitiation || this.isLockedForNight) {
                    const now = Date.now();
                    if (now - this.lastLockedAlertTime > 2500) {
                        this.lastLockedAlertTime = now;
                        const msg = this.isLockedForNight ? 'DOOR LOCKED DURING NIGHT' : 'DOOR LOCKED DURING INITIATION';
                        gameEvents.emit('hud:announcement', { text: msg, color: '#EF4444' });
                    }
                } else {
                    this.canExit = false;
                    this.exitBuilding();
                }
            }
        });
    }

    exitBuilding() {
        gameEvents.emit('building:exit', {
            playerId: this.localPlayer.id,
            buildingId: this.buildingId
        });

        const ui = this.scene.get('UIScene');
        if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();

        this.scene.stop('InteriorScene');
    }

    update() {
        if (!this.isVerifying) {
            this.handleMovement();

            // High-resolution screen-space proximity prompts
            let overlappingFrag = null;
            if (this.interiorFragments) {
                for (const ifrag of this.interiorFragments) {
                    if (this.physics.overlap(this.playerSprite, ifrag.interactionZone)) {
                        overlappingFrag = ifrag;
                        break;
                    }
                }
            }

            let overlappingStation = null;
            if (!overlappingFrag && this.stations) {
                for (const st of this.stations) {
                    if (this.physics.overlap(this.playerSprite, st.zone)) {
                        overlappingStation = st;
                        break;
                    }
                }
            }

            const ui = this.scene.get('UIScene');
            if (ui) {
                if (overlappingFrag) {
                    ui.setInteractionPrompt(this.cameras.main.width / 2, this.cameras.main.height - 110, `[E] PICK UP ${overlappingFrag.fragmentType || 'CLUE'}`);
                } else if (overlappingStation) {
                    ui.setInteractionPrompt(this.cameras.main.width / 2, this.cameras.main.height - 110, `[E] ${overlappingStation.name.toUpperCase()}`);
                } else if (this.exitZone && this.physics.overlap(this.playerSprite, this.exitZone)) {
                    ui.setInteractionPrompt(this.cameras.main.width / 2, this.cameras.main.height - 110, '[S] EXIT TO VILLAGE');
                } else {
                    ui.hideInteractionPrompt();
                }
            }
        } else {
            this.playerSprite.setVelocity(0, 0);
        }
    }

    handleMovement() {
        const speed = CONFIG.PLAYER_SPEED * CONFIG.DEFAULT_RENDER_SCALE;
        let vx = 0;
        let vy = 0;

        let animDir = 'south';

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            vx = -speed;
            animDir = 'west';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            vx = speed;
            animDir = 'east';
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            vy = -speed;
            animDir = 'north';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            vy = speed;
            animDir = 'south';
        }

        if (vx !== 0 && vy !== 0) vx = 0;

        this.playerSprite.setVelocity(vx, vy);

        // Update player walk animation
        const avatarId = this.localPlayer.avatarId || '01';
        if (vx !== 0 || vy !== 0) {
            const animKey = `avatar_${avatarId}_walk_${animDir}`;
            if (this.anims.exists(animKey)) {
                this.playerSprite.anims.play(animKey, true);
            }
        } else {
            const idleKey = `avatar_${avatarId}_idle_${animDir}`;
            if (this.anims.exists(idleKey)) {
                this.playerSprite.anims.play(idleKey, true);
            }
        }
    }
}
