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

    create() {
        // Ensure any floating prompts from the exterior world are hidden
        const ui = this.scene.get('UIScene');
        if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();

        // Set camera background to solid black
        this.cameras.main.setBackgroundColor('#000000');

        // Fullscreen solid black backdrop to prevent any underlying scene pixels
        this.add.rectangle(0, 0, 4000, 4000, 0x000000).setDepth(-100);

        // Calculate exact world center based on scale
        const scale = 2.0;
        const camW = this.scale.width / scale;
        const camH = this.scale.height / scale;

        const centerX = camW / 2;
        const centerY = camH / 2;

        // Interior Room Size: 50% Expanded (23x15 tiles = 368x240px)
        const roomW = 368;
        const roomH = 240;
        const roomX = centerX - roomW / 2;
        const roomY = centerY - roomH / 2;

        // Floor Color Theme
        const bTypeUpper = this.buildingType.toUpperCase();
        let floorColor = 0x4A2E1B; // Warm Timber
        if (bTypeUpper === 'LIBRARY') floorColor = 0x1E293B;
        else if (bTypeUpper === 'CLINIC') floorColor = 0x334155;
        else if (bTypeUpper === 'VILLAGE_HALL') floorColor = 0x582C12;

        // Centered Floor Rectangle
        const floor = this.add.rectangle(centerX, centerY, roomW, roomH, floorColor);
        floor.setStrokeStyle(3, 0x1E293B);

        // Dark Slate Wall Outline
        const wallGraphics = this.add.graphics();
        wallGraphics.lineStyle(6, 0x0F172A);
        wallGraphics.strokeRect(roomX + 3, roomY + 3, roomW - 6, roomH - 6);

        // Formatted Title (e.g. HOUSE H01, CLINIC, LIBRARY)
        const formattedTitle = this.buildingId ? String(this.buildingId).replace(/_/g, ' ') : bTypeUpper;
        
        // Trigger high-res HUD toast banner
        gameEvents.emit('hud:announcement', { text: `📍 Entering ${formattedTitle}`, color: '#F59E0B' });

        // Physics World Collision Bounds
        this.physics.world.setBounds(roomX + 8, roomY + 8, roomW - 16, roomH - 16);

        // Spawn Player Sprite (Bottom Center of room)
        const spawnX = centerX;
        const spawnY = roomY + roomH - 30;

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

        // Camera setup: Center camera perfectly on (centerX, centerY)
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

        // Decorative Area Rug
        let rugColor = 0x6B4324;
        let rugBorder = 0x8C5B34;
        if (bTypeUpper === 'LIBRARY' || bTypeUpper === 'ARCHIVES') { rugColor = 0x1E2E4A; rugBorder = 0x2E456B; }
        else if (bTypeUpper === 'CLINIC') { rugColor = 0x15380A; rugBorder = 0x274E13; }
        else if (bTypeUpper === 'VILLAGE_HALL') { rugColor = 0x7D1212; rugBorder = 0xA82424; }
        else if (bTypeUpper === 'SCHOOL') { rugColor = 0x8C5E1A; rugBorder = 0xC4801D; }

        const rug = this.add.rectangle(centerX, centerY + 5, 120, 70, rugColor);
        rug.setStrokeStyle(1.5, rugBorder);
        rug.setDepth(2);

        // Spawn interior stations and exit door
        this.setupInteractables(roomX, roomY, roomW);
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

    setupInteractables(rx, ry, rw) {
        this.stations = [];
        const bType = this.buildingType.toUpperCase();
        
        if (bType === 'VILLAGE_HALL') {
            // Main Council Table / Village Archive Desk
            this.createStation('Village Archive (DELIVER CLUE)', rx + rw / 2, ry + 75, 64, 24, 'interior_props', 'prop_council_table', 'DELIVER_FRAGMENT');
            // Lectern & Cabinets
            this.createPropDecor(rx + rw - 45, ry + 70, 'interior_props', 'prop_lectern');
            this.createPropDecor(rx + 45, ry + 28, 'interior_props', 'prop_filing_cabinet');
            this.createPropDecor(rx + rw - 45, ry + 28, 'interior_props', 'prop_filing_cabinet');
            // Archived Claims
            this.createStation('Archived Claims', rx + 45, ry + 70, 32, 32, 'outdoor_props', 'prop_barrels_crates');
            // Executive Notice Board
            this.createPropDecor(rx + 25, ry + 30, 'outdoor_props', 'prop_notice_board');
        } else if (bType === 'ARCHIVES' || bType === 'LIBRARY') {
            // Verification Podium (Central Interactive Station)
            this.podiumStation = this.createStation('VERIFICATION PODIUM (E)', rx + rw / 2, ry + 70, 48, 32, 'interior_props', 'prop_verify_podium', 'VERIFY_PODIUM');
            // Source Database & Bookshelves
            this.createStation('Source Database', rx + 45, ry + 70, 32, 32, 'interior_props', 'prop_db_terminal');
            this.createStation('Public Records', rx + rw - 45, ry + 65, 48, 48, 'interior_props', 'prop_bookshelf');
            this.createPropDecor(rx + 45, ry + 28, 'interior_props', 'prop_bookshelf');
        } else if (bType === 'SCHOOL') {
            // Chalkboard on Top Wall
            this.createPropDecor(rx + rw / 2, ry + 24, 'interior_props', 'prop_chalkboard');
            // Counselor Log Desk
            this.createStation('Counselor Log Desk', rx + rw / 2, ry + 55, 32, 32, 'interior_props', 'prop_lectern');
            // Student Desks (Classroom Rows)
            this.createPropDecor(rx + 60, ry + 95, 'interior_props', 'prop_school_desk');
            this.createPropDecor(rx + 95, ry + 95, 'interior_props', 'prop_school_desk');
            this.createPropDecor(rx + 145, ry + 95, 'interior_props', 'prop_school_desk');
            this.createPropDecor(rx + 180, ry + 95, 'interior_props', 'prop_school_desk');
            // Student Notice Board
            this.createStation('Student Notice Board', rx + 45, ry + 50, 32, 32, 'outdoor_props', 'prop_notice_board');
        } else if (bType === 'CLINIC') {
            // Intake Desk & Pharmacy Medicine Cabinet
            this.createStation('Medical Intake Desk', rx + rw / 2 - 30, ry + 60, 32, 32, 'interior_props', 'prop_lectern');
            this.createStation('Pharmacy Shelf', rx + rw - 45, ry + 40, 32, 32, 'interior_props', 'prop_medicine_cabinet');
            // Exam Table
        } else if (bType === 'LOCAL_HOUSE') {
            // Unoccupied Local House (Investigation Site)
            this.createStation('Old Bureau', rx + rw - 45, ry + 45, 32, 32, 'interior_props', 'prop_db_terminal');
            this.createStation('Unmade Bed', rx + 45, ry + 45, 32, 24, 'interior_props', 'prop_cottage_bed');
            this.createStation('Floorboard Cache', rx + rw / 2, ry + 70, 24, 24, null, null, 'INSPECT');
            this.createPropDecor(rx + 45, ry + 105, 'outdoor_props', 'prop_barrels_crates');
        } else {
            // Player Cottages H01-H10
            this.createStation('Bed', rx + 45, ry + 45, 32, 24, 'interior_props', 'prop_cottage_bed');
            this.createStation('Study Desk', rx + rw - 45, ry + 45, 32, 32, 'interior_props', 'prop_db_terminal');
            this.createPropDecor(rx + 45, ry + 105, 'outdoor_props', 'prop_barrels_crates');
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
        let visualObj;
        if (texKey && frameName && this.textures.exists(texKey)) {
            visualObj = this.add.image(x, y, texKey, frameName);
            visualObj.setDepth(y);
            this.physics.add.existing(visualObj, true);
            this.physics.add.collider(this.playerSprite, visualObj);
        } else {
            const rect = this.add.rectangle(x, y, w, h, 0x8B4513);
            rect.setStrokeStyle(1.5, 0x0F172A);
            rect.setDepth(y);
            this.physics.add.existing(rect, true);
            this.physics.add.collider(this.playerSprite, rect);
            visualObj = rect;
        }

        const zone = this.add.zone(x, y, w + 20, h + 20);
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

        this.exitZone = this.add.zone(exitX, exitY + 2, 36, 14);
        this.physics.add.existing(this.exitZone, true);

        this.lastLockedAlertTime = 0;
        this.physics.add.overlap(this.playerSprite, this.exitZone, () => {
            if (!this.isVerifying) {
                if (this.isLockedForInitiation || this.isLockedForNight) {
                    const now = Date.now();
                    if (now - this.lastLockedAlertTime > 2500) {
                        this.lastLockedAlertTime = now;
                        const msg = this.isLockedForNight ? 'DOOR LOCKED DURING NIGHT' : 'DOOR LOCKED DURING INITIATION';
                        gameEvents.emit('hud:announcement', { text: msg, color: '#EF4444' });
                    }
                } else {
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
