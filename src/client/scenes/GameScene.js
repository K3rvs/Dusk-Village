import Phaser from 'phaser';
import { CONFIG, COLORS, PHASES } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { PhaseManager } from '../systems/PhaseManager.js';
import { PlayerController } from '../systems/PlayerController.js';
import { ChatSystem } from '../systems/ChatSystem.js';
import { SabotageSystem } from '../systems/SabotageSystem.js';
import { FragmentManager } from '../systems/FragmentManager.js';
import villageLayout from '../../../village_layout.json';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.localPlayerId = data.playerId || 'local_player';
        this.localPlayerRole = data.role || 'SURVIVOR';
        this.localPlayerAvatar = data.avatarId || '01';
        this.currentMystery = data.mystery || null;
        this.allPlayers = data.players || [];
        this.instigatorTeammates = data.teammates || [];
        this.activeModal = null;
    }

    create() {
        // === 1. RENDER GROUND TILES (1:1 with Map Layout) ===
        this.createGroundLayer();
        this.spawnBuildings();
        this.spawnTreesAndDecorations();

        // === 1b. CREATE TILE-BASED SOLID COLLISION GRID (1:1 with Map Editor) ===
        this.createCollisionLayer();

        // === 2. CREATE LOCAL PLAYER ===
        const localPlayerData = this.allPlayers.find(p => p.id === this.localPlayerId);
        const mySlot = (localPlayerData && localPlayerData.slot) ? localPlayerData.slot : 1;
        const cottageSpawns = {
            1: { id: 'HOUSE_H01', x: 216,  y: 184 },
            2: { id: 'HOUSE_H02', x: 376,  y: 184 },
            3: { id: 'HOUSE_H03', x: 1144, y: 184 },
            4: { id: 'HOUSE_H04', x: 1304, y: 184 },
            5: { id: 'HOUSE_H05', x: 216,  y: 920 },
            6: { id: 'HOUSE_H06', x: 376,  y: 920 },
            7: { id: 'HOUSE_H07', x: 536,  y: 920 },
            8: { id: 'HOUSE_H08', x: 984,  y: 920 },
            9: { id: 'HOUSE_H09', x: 1144, y: 920 },
            10: { id: 'HOUSE_H10', x: 1304, y: 920 }
        };
        const myCottage = cottageSpawns[mySlot] || cottageSpawns[1];
        this.myCottage = myCottage;
        const spawnX = myCottage.x;
        const spawnY = myCottage.y;

        this.localPlayer = this.createPlayer(spawnX, spawnY, this.localPlayerAvatar, this.localPlayerId);

        // === 3. CREATE REMOTE PLAYERS ===
        this.remotePlayers = new Map();
        this.allPlayers.forEach(playerData => {
            if (playerData.id !== this.localPlayerId) {
                const remoteSlot = playerData.slot || 1;
                const remoteCottage = cottageSpawns[remoteSlot] || cottageSpawns[1];
                const remotePlayer = this.createPlayer(
                    remoteCottage.x,
                    remoteCottage.y,
                    playerData.avatarId || '01',
                    playerData.id
                );
                this.remotePlayers.set(playerData.id, remotePlayer);
            }
        });

        // === 4. CAMERA SETUP ===
        this.cameras.main.setZoom(CONFIG.DEFAULT_RENDER_SCALE);
        // We handle following and clamping manually in update() to properly account for zoom!


        // === 5. COLLISION (Driven 1:1 by Map Editor Collision Grid) ===
        if (this.solidColliders) {
            this.physics.add.collider(this.localPlayer.sprite, this.solidColliders);
        }

        // === 6. PHASE OVERLAY ===
        this.phaseOverlay = this.add.rectangle(
            0,
            0,
            4000,
            4000,
            COLORS.DAY_OVERLAY,
            0.08
        );
        this.phaseOverlay.setOrigin(0, 0);
        this.phaseOverlay.setScrollFactor(0);
        this.phaseOverlay.setDepth(2000);

        // === 7. INITIALIZE SYSTEMS ===
        this.phaseManager = new PhaseManager(this);
        this.playerController = new PlayerController(this, this.localPlayer);
        this.chatSystem = new ChatSystem(this);
        this.sabotageSystem = new SabotageSystem(this);
        this.fragmentManager = new FragmentManager(this);
        
        this.scene.launch('UIScene', {
            gameScene: this,
            localPlayerId: this.localPlayerId,
            localPlayerRole: this.localPlayerRole,
            allPlayers: this.allPlayers
        });

        // === 8. INPUT SETUP ===
        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dropKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // Interaction Prompt tracking state
        this.nearestInteraction = null;

        // === 9. EVENT LISTENERS ===
        this.setupEventListeners();

        // Start initial phase
        this.phaseManager.startPhase(PHASES.ROLE_ASSIGNMENT);

        // Launch player into their own cottage interior for Initiation Phase (10s)
        this.scene.setVisible(false, 'GameScene');
        this.scene.pause('GameScene');
        this.scene.launch('InteriorScene', {
            buildingId: myCottage.id,
            buildingType: 'house',
            localPlayer: this.localPlayer,
            isInitiation: true,
            role: this.localPlayerRole,
            teammates: this.instigatorTeammates,
            mystery: this.currentMystery
        });
    }

    createGroundLayer() {
        const tileSize = 16;
        const cols = villageLayout.width || 94;
        const rows = villageLayout.height || 70;
        const worldW = cols * tileSize; // 1504
        const worldH = rows * tileSize; // 1120
        const groundData = villageLayout.groundData;

        // 1. Base Rich Grass TileSprite Layer (Depth 0)
        if (this.textures.exists('tile_ground_grass')) {
            this.add.tileSprite(worldW / 2, worldH / 2, worldW, worldH, 'tile_ground_grass').setDepth(0);
        } else {
            this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x38972C).setDepth(0);
        }

        // 2. High-Performance Ground Texture (Dirt, Cobblestone Plaza, Stone Borders)
        if (groundData && Array.isArray(groundData)) {
            const rt = this.add.renderTexture(0, 0, worldW, worldH).setOrigin(0, 0).setDepth(1);
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tile = groundData[y * cols + x];
                    let textureKey = null;

                    if (tile === 2) textureKey = 'tile_ground_dirt';
                    else if (tile === 3) textureKey = 'tile_ground_cobble';
                    else if (tile === 19) textureKey = 'tile_ground_stone';
                    else if (tile === 4) textureKey = 'tile_ground_cobble'; // Water / Stream

                    if (textureKey && this.textures.exists(textureKey)) {
                        rt.draw(textureKey, x * tileSize, y * tileSize);
                    }
                }
            }
        }
    }

    createCollisionLayer() {
        this.solidColliders = this.physics.add.staticGroup();
        const tileSize = 16;
        const cols = villageLayout.width || 94;
        const rows = villageLayout.height || 70;
        const collisionData = villageLayout.collisionData;

        if (collisionData && Array.isArray(collisionData)) {
            // Merge contiguous horizontal solid tiles in each row for high performance
            for (let y = 0; y < rows; y++) {
                let startX = null;
                for (let x = 0; x <= cols; x++) {
                    const isSolid = x < cols && collisionData[y * cols + x] === 1;
                    if (isSolid && startX === null) {
                        startX = x;
                    } else if (!isSolid && startX !== null) {
                        const count = x - startX;
                        const w = count * tileSize;
                        const h = tileSize;
                        const cx = startX * tileSize + w / 2;
                        const cy = y * tileSize + h / 2;
                        
                        const rect = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
                        this.physics.add.existing(rect, true);
                        this.solidColliders.add(rect);
                        
                        startX = null;
                    }
                }
            }
        }
    }

    spawnBuildings() {
        this.buildings = this.add.group();
        this.buildingDoors = [];
        this.interactables = [];

        const tileSize = 16;
        
        const addBuilding = (key, tx, ty, width, height, doorTx, doorTy, buildingId, frame = 0) => {
            if (!this.textures.exists(key)) return;
            const px = tx * tileSize + (width * tileSize) / 2;
            const py = ty * tileSize + (height * tileSize) / 2;
            const bldg = this.add.sprite(px, py, key, frame);
            
            // Depth must be the base of the building footprint so objects behind sort behind
            const baseDepth = (ty + height) * tileSize;
            bldg.setDepth(baseDepth);
            bldg.setDisplaySize(width * tileSize, height * tileSize);
            this.buildings.add(bldg);
            
            if (doorTx && doorTy && buildingId) {
                const doorX = doorTx * tileSize + 8;
                const doorY = doorTy * tileSize + 8;
                this.buildingDoors.push({
                    x: doorX,
                    y: doorY,
                    buildingId
                });
            }
            
            return bldg;
        };

        const structures = villageLayout.structures || [];

        structures.forEach(s => {
            if (s.key === 'hall') {
                addBuilding('spr_bldg_villagehall', s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, 'VILLAGE_HALL', 0);
            } else if (s.key === 'clinic') {
                addBuilding('spr_bldg_clinic', s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, 'CLINIC', 0);
            } else if (s.key === 'library' || s.key === 'archives') {
                addBuilding('spr_bldg_library', s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, 'LIBRARY', 0);
            } else if (s.key === 'school') {
                addBuilding('spr_bldg_school', s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, 'SCHOOL', 0);
            } else if (s.key.startsWith('h') && s.key !== 'hall') {
                const numStr = s.key.substring(1).toUpperCase();
                const cottageNum = parseInt(s.key.substring(1), 10);
                const numPadded = cottageNum < 10 ? `0${cottageNum}` : `${cottageNum}`;
                const textureKey = `spr_bldg_house_${numPadded}`;
                const bldgSprite = addBuilding(textureKey, s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, `HOUSE_H${numStr}`, 0);
                if (bldgSprite) {
                    bldgSprite.isCottage = true;
                    bldgSprite.cottageNumber = cottageNum;
                }
            } else if (s.key === 'local_house' || s.key === 'local-house') {
                const bldgSprite = addBuilding('spr_bldg_local_house', s.x, s.y, s.w, s.h, s.x + (s.w - 1) / 2, s.y + s.h, 'LOCAL_HOUSE', 0);
                if (bldgSprite) {
                    bldgSprite.isLocalHouse = true;
                }
            } else if (s.key === 'statue') {
                if (this.textures.exists('spr_statue_angel')) {
                    const px = (s.x + s.w / 2) * tileSize;
                    const py = (s.y + s.h / 2) * tileSize;
                    const statue = this.add.sprite(px, py, 'spr_statue_angel', 0);
                    const baseDepth = (s.y + s.h) * tileSize;
                    statue.setDepth(baseDepth);
                    statue.setDisplaySize(s.w * tileSize, s.h * tileSize);
                    this.buildings.add(statue);
                    this.interactables.push({
                        id: 'statue_angel',
                        x: px,
                        y: py,
                        action: 'VIEW_MYSTERY'
                    });
                }
            } else if (s.key === 'fountain') {
                if (this.textures.exists('spr_bldg_fountain')) {
                    const px = (s.x + s.w / 2) * tileSize;
                    const py = (s.y + s.h / 2) * tileSize;
                    const fountain = this.add.sprite(px, py, 'spr_bldg_fountain', 0);
                    const baseDepth = (s.y + s.h) * tileSize;
                    fountain.setDepth(baseDepth);
                    fountain.setDisplaySize(s.w * tileSize, s.h * tileSize);
                    this.buildings.add(fountain);
                }
            }
        });
    }

    spawnTreesAndDecorations() {
        const tileSize = 16;
        const structures = villageLayout.structures || [];
        this.treesGroup = this.add.group();

        structures.forEach(s => {
            let key = null;
            let frame = 0;

            if (s.key === 'oak') { key = 'spr_tree_autumn_oak'; frame = 0; }
            else if (s.key === 'maple') { key = 'spr_tree_autumn_oak'; frame = 1; }
            else if (s.key === 'pine') { key = 'spr_tree_pine_border'; frame = 0; }
            else if (s.key === 'bush_sm') { key = 'spr_bush_circular'; frame = 0; }
            else if (s.key === 'bush_rose') { key = 'spr_bush_rose'; frame = 0; }
            else if (s.key === 'bush_gold') { key = 'spr_bush_circular'; frame = 2; }
            else if (s.key === 'bush_lg') { key = 'spr_bush_circular'; frame = 0; }
            else if (s.key === 'leaves') { key = 'spr_foliage_bushes'; frame = 2; }
            else if (s.key === 'fence') { key = 'spr_fences_gates'; frame = 0; }
            else if (s.key === 'mailbox') { key = 'spr_mailboxes'; frame = 0; }

            if (key && this.textures.exists(key)) {
                const px = (s.x + 0.5) * tileSize;
                const py = (s.y + 1) * tileSize;
                const item = this.add.image(px, py, key, frame);
                item.setOrigin(0.5, 1.0);
                item.setDepth(py);
                if (key === 'spr_tree_pine_border') {
                    item.setDisplaySize(32, 64);
                } else if (key === 'spr_bush_rose') {
                    item.setDisplaySize(28, 22); // 40% larger (20*1.4 = 28px width, 16*1.4 = 22.4px height)
                }
                this.treesGroup.add(item);
            }

            // Market stands & outdoor decor props
            const marketProps = {
                mkt_stand_1: { w: 3, h: 3 },
                mkt_stand_2: { w: 3, h: 3 },
                mkt_stand_3: { w: 3, h: 3 },
                mkt_stand_4: { w: 3, h: 3 },
                mkt_stand_5: { w: 2, h: 2 },
                mkt_cart: { w: 2, h: 2 },
                mkt_picnic: { w: 3, h: 2 },
                mkt_sign: { w: 1, h: 2 },
                mkt_flower_bed: { w: 2, h: 2 }
            };

            if (marketProps[s.key] && this.textures.exists(s.key)) {
                const mp = marketProps[s.key];
                const px = (s.x + mp.w / 2) * tileSize;
                const py = (s.y + mp.h) * tileSize;
                const prop = this.add.image(px, py, s.key);
                prop.setOrigin(0.5, 1.0);
                prop.setDepth(py);
                prop.setDisplaySize(mp.w * tileSize, mp.h * tileSize);
                this.treesGroup.add(prop);
            }
        });
    }

    createPlayer(x, y, avatarId, playerId) {
        const spriteKey = `spr_avatar_${avatarId}`;
        let sprite;

        if (this.textures.exists(spriteKey)) {
            sprite = this.physics.add.sprite(x, y, spriteKey, 0);
        } else {
            sprite = this.physics.add.sprite(x, y, '__DEFAULT');
            sprite.setDisplaySize(16, 24);
        }
        sprite.setSize(10, 8);
        sprite.setOffset(3, 16);
        sprite.setDepth(50);

        let shadow;
        if (this.textures.exists('spr_player_shadow')) {
            shadow = this.add.image(x, y + 12, 'spr_player_shadow');
        } else {
            shadow = this.add.ellipse(x, y + 12, 12, 6, 0x000000, 0.4);
        }
        shadow.setAlpha(0.5);
        shadow.setDepth(49);

        return {
            id: playerId,
            avatarId,
            sprite,
            shadow,
            direction: 'south',
            isMoving: false,
            isAlive: true,
            heldFragment: null
        };
    }

    update() {
        if (!this.localPlayer || !this.localPlayer.isAlive) return;

        this.handleMovement();

        this.localPlayer.shadow.setPosition(
            this.localPlayer.sprite.x,
            this.localPlayer.sprite.y + 12
        );

        this.sortPlayerDepth();

        // Manual Camera Follow and Clamp (Accounts for zoom to prevent border gaps)
        const cam = this.cameras.main;
        const viewW = cam.width / cam.zoom;
        const viewH = cam.height / cam.zoom;
        
        const mapW = this.map ? this.map.widthInPixels : 1504;
        const mapH = this.map ? this.map.heightInPixels : 1120;

        const minX = viewW / 2;
        const minY = viewH / 2;
        const maxX = mapW - viewW / 2;
        const maxY = mapH - viewH / 2;

        const targetX = Phaser.Math.Clamp(this.localPlayer.sprite.x, minX, maxX);
        const targetY = Phaser.Math.Clamp(this.localPlayer.sprite.y, minY, maxY);

        cam.centerOn(targetX, targetY);

        // Dynamic Interaction Prompt Updates projected to UIScene
        let nearestTarget = null;
        let minDist = 40;
        const px = this.localPlayer.sprite.x;
        const py = this.localPlayer.sprite.y;

        (this.buildingDoors || []).forEach(d => {
            const dist = Phaser.Math.Distance.Between(px, py, d.x, d.y);
            if (dist < minDist) { minDist = dist; nearestTarget = { x: d.x, y: d.y - 20, label: '[E] ENTER' }; }
        });

        (this.interactables || []).forEach(o => {
            const dist = Phaser.Math.Distance.Between(px, py, o.x, o.y);
            if (dist < minDist) { minDist = dist; nearestTarget = { x: o.x, y: o.y - 20, label: '[E] STATUE' }; }
        });

        const ui = this.scene.get('UIScene');
        if (ui && ui.setInteractionPrompt) {
            if (nearestTarget && !this.scene.isActive('InteriorScene')) {
                const displayX = (nearestTarget.x - cam.worldView.x) * cam.zoom;
                const displayY = (nearestTarget.y - cam.worldView.y) * cam.zoom;
                ui.setInteractionPrompt(cam.x + displayX, cam.y + displayY, nearestTarget.label);
            } else {
                ui.hideInteractionPrompt();
            }
        }
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

        // Support smooth diagonal movement with normalized velocity
        if (vx !== 0 && vy !== 0) {
            vx *= 0.7071;
            vy *= 0.7071;
        }

        this.localPlayer.sprite.setVelocity(vx, vy);

        const avatarKey = `avatar_${this.localPlayerAvatar}`;
        if (vx !== 0 || vy !== 0) {
            const animKey = `${avatarKey}_walk_${this.localPlayer.direction}`;
            if (this.anims.exists(animKey)) {
                this.localPlayer.sprite.anims.play(animKey, true);
            }
            this.localPlayer.isMoving = true;

            // Broadcast movement to server
            if (window.socketClient) {
                window.socketClient.send({
                    type: 'PLAYER_MOVE',
                    x: this.localPlayer.sprite.x,
                    y: this.localPlayer.sprite.y,
                    direction: this.localPlayer.direction,
                    animation: animKey
                });
            }
        } else {
            const animKey = `${avatarKey}_idle_${this.localPlayer.direction}`;
            if (this.anims.exists(animKey)) {
                this.localPlayer.sprite.anims.play(animKey, true);
            }
            this.localPlayer.isMoving = false;
        }
    }

    sortPlayerDepth() {
        const allPlayers = [this.localPlayer];
        this.remotePlayers.forEach(rp => allPlayers.push(rp));

        // Sort players by feet Y position for correct render order
        allPlayers.sort((a, b) => a.sprite.y - b.sprite.y);
        allPlayers.forEach((player, index) => {
            // Depth based on player's feet position (+12px from sprite center)
            const playerFootY = player.sprite.y + 12;
            const d = playerFootY + index * 0.01;
            player.sprite.setDepth(d);
            if (player.shadow) player.shadow.setDepth(d - 0.5);
        });
    }

    setupEventListeners() {
        // === SERVER NETWORK EVENTS ===
        gameEvents.on('role:assigned', (data) => {
            this.localPlayerRole = data.role;
            this.instigatorTeammates = data.teammates || [];
            this.scene.get('UIScene').showRoleAssignmentModal({ role: data.role });
        });

        gameEvents.on('phase:serverChanged', (data) => {
            this.onPhaseChanged(data);
        });

        gameEvents.on('player:remoteUpdate', (data) => {
            const remote = this.remotePlayers.get(data.playerId);
            if (remote && remote.sprite) {
                remote.sprite.setPosition(data.x, data.y);
                remote.shadow.setPosition(data.x, data.y + 12);
                if (data.animation && this.anims.exists(data.animation)) {
                    remote.sprite.anims.play(data.animation, true);
                }
            }
        });

        gameEvents.on('fragment:attemptPickup', (data) => {
            if (window.socketClient) {
                window.socketClient.send({ type: 'FRAGMENT_PICKUP', fragmentId: data.fragmentId });
            }
        });

        gameEvents.on('fragment:attemptDrop', (data) => {
            if (window.socketClient) {
                window.socketClient.send({ type: 'FRAGMENT_DROP', position: data.position });
            }
        });

        gameEvents.on('vote:nominationReceived', (data) => {
            this.scene.get('UIScene').showVotingModal(data.nominatedPlayerName);
        });

        gameEvents.on('vote:cast', (data) => {
            if (window.socketClient) {
                window.socketClient.send({ type: 'VOTE_CAST', choice: data.choice });
            }
        });

        gameEvents.on('player:evicted', (data) => {
            const victim = data.playerId === this.localPlayerId
                ? this.localPlayer
                : this.remotePlayers.get(data.playerId);
            
            if (victim) {
                victim.isAlive = false;
                if (this.sound.get('sfx_ban_sever')) this.sound.play('sfx_ban_sever', { volume: 0.7 });
                
                const dissolveSprite = this.add.sprite(victim.sprite.x, victim.sprite.y, 'vfx_ban_sever').setDepth(300);
                if (this.anims.exists('vfx_ban_sever_play')) {
                    dissolveSprite.play('vfx_ban_sever_play');
                    dissolveSprite.on('animationcomplete', () => dissolveSprite.destroy());
                }
                victim.sprite.setAlpha(0.3);
            }
        });

        gameEvents.on('building:locked', () => {
            if (this.sound.get('sfx_solve_fail')) this.sound.play('sfx_solve_fail', { volume: 0.5 });
        });

        gameEvents.on('game:overReceived', (data) => {
            this.scene.start('GameOverScene', {
                winner: data.winner,
                reason: data.reason,
                roleReveal: data.roleReveal,
                mysteryResult: data.mysteryResult,
                localPlayerRole: this.localPlayerRole
            });
        });

        gameEvents.on('mystery:solveFailed', () => {
            if (this.sound.get('sfx_solve_fail')) this.sound.play('sfx_solve_fail', { volume: 0.7 });
            // Camera shake removed
        });

        // Key Controls (E & Q)
        this.interactKey.on('down', () => {
            if (this.playerController) {
                const worldFrags = this.fragmentManager
                    ? Array.from(this.fragmentManager.worldFragments.values()).map(f => ({ id: f.id, x: f.worldSprite.x, y: f.worldSprite.y }))
                    : [];
                this.playerController.checkInteraction(worldFrags, this.buildingDoors || [], this.interactables || []);
            }
        });

        this.dropKey.on('down', () => {
            if (this.playerController) {
                this.playerController.dropFragment();
            }
        });

        gameEvents.on('interaction:trigger', (data) => {
            if (data.action === 'SOLVE_MYSTERY') {
                this.scene.get('UIScene').showSolveMysteryModal(this.currentMystery || { title: 'Dusk Mystery' });
            } else if (data.action === 'VIEW_MYSTERY') {
                this.scene.get('UIScene').showMysteryAnnouncementModal(this.currentMystery || { title: 'Dusk Mystery' });
            }
        });

        gameEvents.on('building:attemptEntry', (data) => {
            if (data.playerId === this.localPlayerId) {
                let bType = data.buildingId.toLowerCase();
                if (bType.startsWith('house_')) bType = 'house';
                
                const ui = this.scene.get('UIScene');
                if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();
                
                this.scene.setVisible(false, 'GameScene');
                this.scene.pause('GameScene');
                this.scene.launch('InteriorScene', {
                    buildingId: data.buildingId,
                    buildingType: bType,
                    localPlayer: this.localPlayer,
                    playerId: this.localPlayerId,
                    avatarId: this.localPlayerAvatar,
                    role: this.localPlayerRole
                });
            }
        });

        gameEvents.on('building:exit', () => {
            this.scene.setVisible(true, 'GameScene');
            this.scene.resume('GameScene');
            if (this.localPlayer && this.localPlayer.sprite) {
                this.localPlayer.sprite.y += 18;
                if (this.localPlayer.shadow) this.localPlayer.shadow.y += 18;
            }
        });
    }

    onPhaseChanged(data) {
        const phaseName = data.phase || data.to;
        this.phaseManager.startPhase(phaseName);

        // Smooth camera blackout transition
        if (this.cameras && this.cameras.main) {
            this.cameras.main.fadeOut(350, 0, 0, 0, (cam, progress) => {
                if (progress === 1) {
                    this.cameras.main.fadeIn(350, 0, 0, 0);
                }
            });
        }

        if (phaseName === PHASES.DAY_PHASE || phaseName === PHASES.JUDGEMENT_PHASE) {
            if (this.scene.isActive('InteriorScene')) {
                this.scene.stop('InteriorScene');
                this.scene.setVisible(true, 'GameScene');
                this.scene.resume('GameScene');
            }
        }

        // Apply Server Teleportation (e.g. Village Square on Day/Judgement Phase)
        if (data.spawnPositions) {
            const myPos = data.spawnPositions[this.localPlayerId];
            if (myPos && this.localPlayer && this.localPlayer.sprite) {
                this.localPlayer.sprite.setPosition(myPos.x, myPos.y);
                if (this.localPlayer.shadow) this.localPlayer.shadow.setPosition(myPos.x, myPos.y + 12);
            }
            this.remotePlayers.forEach((rp, id) => {
                const rPos = data.spawnPositions[id];
                if (rPos && rp.sprite) {
                    rp.sprite.setPosition(rPos.x, rPos.y);
                    if (rp.shadow) rp.shadow.setPosition(rPos.x, rPos.y + 12);
                }
            });
        }
        
        // Update Building frames for Day/Night cycle
        const isNight = phaseName === PHASES.NIGHT_PHASE;
        if (this.buildings) {
            this.buildings.getChildren().forEach(bldg => {
                if (bldg.texture.key === 'spr_statue_angel') return;
                if (bldg.texture.frameTotal > 1) {
                    bldg.setFrame(isNight ? 1 : 0);
                }
            });
        }

        if (phaseName === PHASES.NIGHT_PHASE) {
            if (this.localPlayerRole === 'SURVIVOR') {
                if (!this.scene.isActive('InteriorScene')) {
                    const ui = this.scene.get('UIScene');
                    if (ui && ui.hideInteractionPrompt) ui.hideInteractionPrompt();
                    
                    this.scene.setVisible(false, 'GameScene');
                    this.scene.pause('GameScene');
                    this.scene.launch('InteriorScene', {
                        buildingId: this.myCottage ? this.myCottage.id : 'HOUSE_H01',
                        buildingType: 'house',
                        localPlayer: this.localPlayer,
                        playerId: this.localPlayerId,
                        avatarId: this.localPlayerAvatar,
                        role: this.localPlayerRole,
                        isNightPhase: true
                    });
                } else {
                    gameEvents.emit('interior:lockForNight');
                }
            }
        }

        const overlay = this.phaseManager.getPhaseOverlayColor(phaseName);

        // Animate overlay transition
        if (this.phaseOverlay) {
            this.tweens.add({
                targets: this.phaseOverlay,
                fillColor: overlay.color,
                fillAlpha: overlay.alpha,
                duration: CONFIG.PHASE_TRANSITION_FADE,
                ease: 'Linear'
            });
        }

        // Play phase audio chimes
        if (phaseName === PHASES.DAY_PHASE && this.sound.get('sfx_bell_day')) {
            this.sound.play('sfx_bell_day', { volume: 0.6 });
        } else if (phaseName === PHASES.NIGHT_PHASE && this.sound.get('sfx_bell_night')) {
            this.sound.play('sfx_bell_night', { volume: 0.6 });
        }

        // Announce Day 1 Mystery start
        if (phaseName === PHASES.DAY_PHASE && data.dayNumber === 1 && data.mystery) {
            gameEvents.emit('hud:announcement', {
                text: `☀️ DAY 1: ${data.mystery.title.toUpperCase()}`,
                color: '#F59E0B'
            });
        }
    }
}
