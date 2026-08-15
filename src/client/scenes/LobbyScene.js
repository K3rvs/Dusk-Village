import Phaser from 'phaser';
import { CONFIG } from '../utils/Constants.js';

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
    }

    init(data) {
        this.isHost = data.isHost || false;
        this.isCustom = data.isCustom || false;
        this.players = [];
        this.roomCode = '';
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Cinematic Dusk Twilight Sunset Backdrop
        if (this.textures.exists('bg_menu_dusk')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_menu_dusk');
            bg.setDisplaySize(width, height);
            bg.setDepth(0);

            // Soft dark vignette overlay
            this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1);
        } else {
            this.createFallbackGradient(width, height);
        }

        // 2. Dynamic Floating Amber Embers
        this.createAmbientEmbers(width, height);

        // 3. Header Title Banner (Larger & Prominent)
        this.add.text(width / 2, 40, 'MULTIPLAYER  LOBBY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '30px',
            color: '#FFF8EE',
            letterSpacing: 3,
            shadow: { offsetX: 0, offsetY: 3, color: '#D97706', blur: 20, fill: true }
        }).setOrigin(0.5).setDepth(10);

        // 4. Interactive Room Code Banner Card
        this.roomCard = this.add.container(width / 2, 88).setDepth(10);
        const roomBg = this.add.rectangle(0, 0, 480, 44, 0x140F14, 0.95);
        roomBg.setStrokeStyle(1.8, 0xF59E0B, 0.9);
        roomBg.setInteractive({ useHandCursor: true });

        this.roomCodeText = this.add.text(-25, 0, 'ROOM CODE: FETCHING...', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11.5px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.copyBadge = this.add.text(180, 0, '[COPY]', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '9px',
            color: '#E5D5C5'
        }).setOrigin(0.5);

        this.roomCard.add([roomBg, this.roomCodeText, this.copyBadge]);

        roomBg.on('pointerdown', () => {
            if (this.roomCode) {
                navigator.clipboard.writeText(this.roomCode).then(() => {
                    this.copyBadge.setText('[COPIED!]').setColor('#4ADE80');
                    this.time.delayedCall(2000, () => {
                        if (this.copyBadge && this.copyBadge.active) {
                            this.copyBadge.setText('[COPY]').setColor('#E5D5C5');
                        }
                    });
                }).catch(() => {});
            }
        });

        // 5. Central Roster Glass Board (2 Columns, Spacious & Large)
        const rosterBoardW = 880;
        const rosterBoardH = 350;
        const rosterCenterY = height * 0.52;

        const rosterBoardBg = this.add.rectangle(width / 2, rosterCenterY, rosterBoardW, rosterBoardH, 0x120E16, 0.9).setDepth(5);
        rosterBoardBg.setStrokeStyle(1.8, 0x785338, 0.9);

        // Center vertical divider
        const divider = this.add.rectangle(width / 2, rosterCenterY, 2, rosterBoardH - 24, 0x3D322A, 0.9).setDepth(6);

        // Player slots layout (2 columns of 5, centered)
        this.playerSlots = [];
        const slotW = 416;
        const slotH = 50;
        const gapY = 58;
        const startY = rosterCenterY - 116;

        for (let i = 0; i < CONFIG.TOTAL_PLAYERS; i++) {
            const col = i < 5 ? 0 : 1;
            const row = i % 5;
            const slotX = width / 2 + (col === 0 ? -224 : 224);
            const slotY = startY + row * gapY;

            const slot = this.createPlayerSlot(slotX, slotY, i + 1, slotW, slotH);
            this.playerSlots.push(slot);
        }

        // 6. Bottom Info & Status Bar
        this.playerCountText = this.add.text(width / 2, height - 80, '0 / 10 VILLAGERS ASSEMBLED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '12.5px',
            color: '#E2D5C3',
            letterSpacing: 1
        }).setOrigin(0.5).setDepth(10);

        // 7. Host Start Game & Leave Action Buttons
        if (this.isHost) {
            this.startButton = this.createActionButton(width / 2 + 80, height - 36, '▶ START GAME', 0x15803D, () => {
                this.startGame();
            }, 260);
            this.startButton.container.setAlpha(0.5);
            this.leaveButton = this.createActionButton(width / 2 - 150, height - 36, '← LEAVE', 0x374151, () => {
                this.scene.start('MenuScene');
            }, 140);
        } else {
            this.leaveButton = this.createActionButton(width / 2, height - 36, '← LEAVE LOBBY', 0x374151, () => {
                this.scene.start('MenuScene');
            }, 200);
        }

        // Connect to server event bus
        this.connectToServer();

        // Check if room data was already cached on socketClient
        if (window.socketClient && window.socketClient.currentRoom) {
            const cached = window.socketClient.currentRoom;
            if (cached.type === 'ROOM_CREATED') this.handleRoomCreated(cached);
            else if (cached.type === 'ROOM_JOINED') this.handleRoomJoined(cached);
        }
    }

    createFallbackGradient(width, height) {
        const canvas = this.textures.createCanvas('lobby_sunset_bg', width, height);
        const ctx = canvas.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0.00, '#090E1F');
        grad.addColorStop(0.35, '#131C38');
        grad.addColorStop(0.65, '#2D344B');
        grad.addColorStop(0.85, '#684554');
        grad.addColorStop(1.00, '#A85854');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        canvas.refresh();
        this.add.image(width / 2, height / 2, 'lobby_sunset_bg').setDepth(0);
    }

    createAmbientEmbers(width, height) {
        this.embers = [];
        const emberColors = [0xF59E0B, 0xFCD34D, 0xFB923C, 0xFBBF24, 0xFEF3C7];

        for (let i = 0; i < 35; i++) {
            const size = Phaser.Math.FloatBetween(1.2, 3.2);
            const color = Phaser.Utils.Array.GetRandom(emberColors);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.85);

            const p = this.add.circle(
                Phaser.Math.Between(10, width - 10),
                Phaser.Math.Between(20, height + 30),
                size,
                color,
                alpha
            ).setDepth(2);

            this.embers.push({
                shape: p,
                speedY: Phaser.Math.FloatBetween(-0.25, -0.65),
                swaySpeed: Phaser.Math.FloatBetween(0.002, 0.005),
                baseX: p.x,
                offset: Phaser.Math.FloatBetween(0, 100)
            });
        }
    }

    createPlayerSlot(x, y, slotNumber, w, h) {
        const container = this.add.container(x, y).setDepth(10);

        // Slot Background Card
        const bg = this.add.rectangle(0, 0, w, h, 0x1A141A, 0.95);
        bg.setStrokeStyle(1.5, 0x3D322A, 0.85);

        // Slot Number Badge (e.g. "01")
        const numBadgeBg = this.add.rectangle(-w / 2 + 22, 0, 28, 28, 0x231E1B);
        numBadgeBg.setStrokeStyle(1, 0x785338);
        const formattedNum = String(slotNumber).padStart(2, '0');
        const numText = this.add.text(-w / 2 + 22, 0, formattedNum, {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '9.5px',
            color: '#E5B869'
        }).setOrigin(0.5);

        // Avatar Frame & Thumbnail Icon
        const avatarFrame = this.add.rectangle(-w / 2 + 56, 0, 30, 30, 0x140F14, 1);
        avatarFrame.setStrokeStyle(1, 0x785338, 0.85);

        const avatarSprite = this.add.sprite(-w / 2 + 56, 0, 'spr_avatar_01', 0).setScale(1.1);

        // Player Name Text
        const nameText = this.add.text(-w / 2 + 82, 0, 'Waiting for player...', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '9.5px',
            color: '#78716C'
        }).setOrigin(0, 0.5);

        // Status Badge Pill (Ready / Host / Bot / Empty)
        const statusPillBg = this.add.rectangle(w / 2 - 48, 0, 84, 26, 0x231E1B, 0.9);
        statusPillBg.setStrokeStyle(1, 0x3D322A, 0.8);

        const readyBadge = this.add.text(w / 2 - 48, 0, 'EMPTY', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '8px',
            color: '#78716C'
        }).setOrigin(0.5);

        container.add([bg, numBadgeBg, numText, avatarFrame, avatarSprite, nameText, statusPillBg, readyBadge]);

        return { container, bg, numBadgeBg, numText, avatarFrame, avatarSprite, nameText, statusPillBg, readyBadge, occupied: false };
    }

    handleRoomCreated(data) {
        this.roomCode = data.roomCode;
        this.roomCodeText.setText(`ROOM CODE: ${this.roomCode}`);
        this.players = [];
        if (data.players && data.players.length > 0) {
            data.players.forEach((p, idx) => {
                this.updatePlayerSlot(idx, {
                    displayName: idx === 0 ? `${p.name} (YOU)` : p.name,
                    isHost: idx === 0,
                    isReady: p.isReady,
                    isBot: p.isBot,
                    avatarId: p.avatarId
                });
                this.players.push(p.id);
            });
        } else {
            this.updatePlayerSlot(0, { displayName: 'YOU (HOST)', isHost: true, isReady: true });
            this.players = [data.playerId];
        }
        this.updatePlayerCount();
    }

    handleRoomJoined(data) {
        this.roomCode = data.roomCode;
        this.roomCodeText.setText(`ROOM CODE: ${data.roomCode || 'JOINED'}`);
        this.players = [];
        if (data.players) {
            data.players.forEach((p, idx) => {
                this.updatePlayerSlot(idx, {
                    displayName: p.name,
                    isHost: idx === 0,
                    isReady: p.isReady,
                    isBot: p.isBot,
                    avatarId: p.avatarId
                });
                this.players.push(p.id);
            });
        }
        this.updatePlayerCount();
    }

    handlePlayerJoined(data) {
        const slotIdx = this.players.length;
        if (slotIdx < CONFIG.TOTAL_PLAYERS) {
            this.players.push(data.playerId);
            this.updatePlayerSlot(slotIdx, {
                displayName: data.name,
                isHost: slotIdx === 0,
                isReady: false,
                isBot: data.isBot,
                avatarId: data.avatarId
            });
            this.updatePlayerCount();
        }
    }

    handlePlayerLeft(data) {
        const idx = this.players.indexOf(data.playerId);
        if (idx !== -1) {
            this.players.splice(idx, 1);
            this.clearPlayerSlot(this.players.length);
            this.updatePlayerCount();
        }
    }

    updatePlayerSlot(index, info) {
        if (index >= this.playerSlots.length) return;
        const slot = this.playerSlots[index];

        slot.occupied = true;
        slot.bg.setStrokeStyle(1.5, info.isHost ? 0xF59E0B : 0x785338, 0.95);

        let dName = info.displayName || `Player ${index + 1}`;
        if (dName.length > 14) dName = dName.substring(0, 12) + '..';

        slot.nameText.setText(dName);
        slot.nameText.setColor(info.isHost ? '#F59E0B' : '#FFF8EE');

        if (info.avatarId && this.textures.exists(`spr_avatar_${info.avatarId}`)) {
            slot.avatarSprite.setTexture(`spr_avatar_${info.avatarId}`, 0);
        }

        if (info.isHost) {
            slot.statusPillBg.setFillStyle(0x451A03, 0.95);
            slot.statusPillBg.setStrokeStyle(1.2, 0xF59E0B, 0.9);
            slot.readyBadge.setText('👑 HOST');
            slot.readyBadge.setColor('#F59E0B');
        } else if (info.isBot) {
            slot.statusPillBg.setFillStyle(0x1F2937, 0.95);
            slot.statusPillBg.setStrokeStyle(1.2, 0x4B5563, 0.9);
            slot.readyBadge.setText('🤖 BOT');
            slot.readyBadge.setColor('#9CA3AF');
        } else if (info.isReady) {
            slot.statusPillBg.setFillStyle(0x064E3B, 0.95);
            slot.statusPillBg.setStrokeStyle(1.2, 0x10B981, 0.9);
            slot.readyBadge.setText('✓ READY');
            slot.readyBadge.setColor('#4ADE80');
        } else {
            slot.statusPillBg.setFillStyle(0x231E1B, 0.9);
            slot.statusPillBg.setStrokeStyle(1.2, 0x3D322A, 0.8);
            slot.readyBadge.setText('WAITING');
            slot.readyBadge.setColor('#A89F91');
        }
    }

    clearPlayerSlot(index) {
        if (index >= this.playerSlots.length) return;
        const slot = this.playerSlots[index];
        slot.occupied = false;
        slot.bg.setStrokeStyle(1.5, 0x3D322A, 0.85);
        slot.nameText.setText('Waiting for player...').setColor('#78716C');
        slot.avatarSprite.setTexture('spr_avatar_01', 0);
        slot.statusPillBg.setFillStyle(0x231E1B, 0.9);
        slot.statusPillBg.setStrokeStyle(1, 0x3D322A, 0.8);
        slot.readyBadge.setText('EMPTY').setColor('#78716C');
    }

    updatePlayerCount() {
        const count = this.players.length;
        this.playerCountText.setText(`${count} / ${CONFIG.TOTAL_PLAYERS} VILLAGERS ASSEMBLED`);

        if (this.isHost && this.startButton) {
            if (count >= 2 || this.isCustom) {
                this.startButton.container.setAlpha(1.0);
            } else {
                this.startButton.container.setAlpha(0.5);
            }
        }
    }

    createActionButton(x, y, text, colorHex, callback, btnW = 220) {
        const container = this.add.container(x, y).setDepth(20);

        const bg = this.add.rectangle(0, 0, btnW, 46, colorHex, 0.95);
        bg.setStrokeStyle(1.8, 0xFFFFFF, 0.35);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(Phaser.Display.Color.ValueToColor(colorHex).lighten(15).color);
            this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(colorHex);
            this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100 });
        });

        bg.on('pointerdown', () => {
            if (this.sound.get('sfx_button_click')) {
                this.sound.play('sfx_button_click', { volume: 0.5 });
            }
            callback();
        });

        return { container, bg, label };
    }

    startGame() {
        if (window.socketClient) {
            window.socketClient.send({ type: 'START_GAME' });
        }
    }

    connectToServer() {
        import('../utils/EventBus.js').then(({ gameEvents }) => {
            gameEvents.off('room:playerJoined');
            gameEvents.off('room:playerLeft');
            gameEvents.off('game:started');

            gameEvents.on('room:playerJoined', (data) => this.handlePlayerJoined(data));
            gameEvents.on('room:playerLeft', (data) => this.handlePlayerLeft(data));
            gameEvents.on('game:started', () => {
                this.scene.start('CharacterSelectScene', {
                    isHost: this.isHost,
                    isCustom: this.isCustom,
                    roomCode: this.roomCode
                });
            });
        });
    }

    update(time, delta) {
        if (this.embers) {
            this.embers.forEach(e => {
                e.shape.y += e.speedY;
                e.shape.x = e.baseX + Math.sin(time * e.swaySpeed + e.offset) * 16;
                if (e.shape.y < -10) {
                    e.shape.y = this.cameras.main.height + 15;
                    e.baseX = Phaser.Math.Between(10, this.cameras.main.width - 10);
                }
            });
        }
    }
}
