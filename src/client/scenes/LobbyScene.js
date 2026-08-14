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

        // 3. Header Title Banner
        this.add.text(width / 2, 38, 'MULTIPLAYER LOBBY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '22px',
            color: '#FFF8EE',
            letterSpacing: 2,
            shadow: { offsetX: 0, offsetY: 3, color: '#D97706', blur: 16, fill: true }
        }).setOrigin(0.5).setDepth(10);

        // 4. Interactive Room Code Banner Card
        this.roomCard = this.add.container(width / 2, 78).setDepth(10);
        const roomBg = this.add.rectangle(0, 0, 360, 38, 0x140F14, 0.95);
        roomBg.setStrokeStyle(1.8, 0xF59E0B, 0.9);
        roomBg.setInteractive({ useHandCursor: true });

        this.roomCodeText = this.add.text(-20, 0, 'ROOM CODE: FETCHING...', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '10px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.copyBadge = this.add.text(140, 0, '[COPY]', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
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

        // 5. Central Roster Glass Board (2 Columns, Centered, No Gap)
        const rosterBoardW = 760;
        const rosterBoardH = 300;
        const rosterCenterY = height * 0.48;

        const rosterBoardBg = this.add.rectangle(width / 2, rosterCenterY, rosterBoardW, rosterBoardH, 0x120E16, 0.88).setDepth(5);
        rosterBoardBg.setStrokeStyle(1.5, 0x785338, 0.85);

        // Center vertical divider
        const divider = this.add.rectangle(width / 2, rosterCenterY, 1.5, rosterBoardH - 24, 0x3D322A, 0.8).setDepth(6);

        // Player slots layout (2 columns of 5, centered)
        this.playerSlots = [];
        const slotW = 345;
        const slotH = 46;
        const gapY = 52;
        const startY = rosterCenterY - 104;

        for (let i = 0; i < CONFIG.TOTAL_PLAYERS; i++) {
            const col = i < 5 ? 0 : 1;
            const row = i % 5;
            const slotX = width / 2 + (col === 0 ? -188 : 188);
            const slotY = startY + row * gapY;

            const slot = this.createPlayerSlot(slotX, slotY, i + 1, slotW, slotH);
            this.playerSlots.push(slot);
        }

        // 6. Bottom Info & Status Bar
        this.playerCountText = this.add.text(width / 2, height - 76, '0 / 10 PLAYERS JOINED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#E2D5C3',
            letterSpacing: 1
        }).setOrigin(0.5).setDepth(10);

        // 7. Host Start Game & Leave Action Buttons
        if (this.isHost) {
            this.startButton = this.createActionButton(width / 2 + 70, height - 36, '▶ START GAME', 0x15803D, () => {
                this.startGame();
            }, 240);
            this.startButton.container.setAlpha(0.5);
            this.leaveButton = this.createActionButton(width / 2 - 130, height - 36, '← LEAVE', 0x374151, () => {
                this.scene.start('MenuScene');
            }, 120);
        } else {
            this.leaveButton = this.createActionButton(width / 2, height - 36, '← LEAVE LOBBY', 0x374151, () => {
                this.scene.start('MenuScene');
            }, 180);
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
        const bg = this.add.rectangle(0, 0, w, h, 0x1A141A, 0.92);
        bg.setStrokeStyle(1.5, 0x3D322A, 0.85);

        // Slot Number Badge (e.g. "01")
        const numBadgeBg = this.add.rectangle(-w / 2 + 18, 0, 24, 24, 0x231E1B);
        numBadgeBg.setStrokeStyle(1, 0x785338);
        const formattedNum = String(slotNumber).padStart(2, '0');
        const numText = this.add.text(-w / 2 + 18, 0, formattedNum, {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#E5B869'
        }).setOrigin(0.5);

        // Avatar Frame & Thumbnail Icon
        const avatarFrame = this.add.rectangle(-w / 2 + 48, 0, 26, 26, 0x140F14, 1);
        avatarFrame.setStrokeStyle(1, 0x785338, 0.8);

        const avatarSprite = this.add.sprite(-w / 2 + 48, 0, 'spr_avatar_01', 0).setScale(0.9);

        // Player Name Text
        const nameText = this.add.text(-w / 2 + 70, 0, 'Waiting for player...', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8.5px',
            color: '#78716C'
        }).setOrigin(0, 0.5);

        // Status Badge Pill (Ready / Host / Bot / Empty)
        const statusPillBg = this.add.rectangle(w / 2 - 42, 0, 72, 22, 0x231E1B, 0.9);
        statusPillBg.setStrokeStyle(1, 0x3D322A, 0.8);

        const readyBadge = this.add.text(w / 2 - 42, 0, 'EMPTY', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
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

    connectToServer() {
        import('../utils/EventBus.js').then(({ gameEvents }) => {
            gameEvents.on('lobby:roomCreated', (data) => this.handleRoomCreated(data));
            gameEvents.on('lobby:roomJoined', (data) => this.handleRoomJoined(data));

            gameEvents.on('lobby:playerJoined', (data) => {
                const idx = this.players.length;
                this.updatePlayerSlot(idx, { displayName: data.playerName, isReady: true, avatarId: data.avatarId });
                this.players.push(data.playerId);
                this.updatePlayerCount();
            });

            gameEvents.on('game:starting', () => {
                this.scene.start('CharacterSelectScene');
            });
        });
    }

    updatePlayerCount() {
        const total = this.players.length;
        this.playerCountText.setText(`${total} / 10 VILLAGERS ASSEMBLED`);
        this.playerCountText.setColor(total >= 10 ? '#4ADE80' : '#E2D5C3');

        if (this.isHost && this.startButton) {
            this.startButton.container.setAlpha(1);
            if (!this.pulseTween) {
                this.pulseTween = this.tweens.add({
                    targets: this.startButton.bg,
                    scaleX: 1.03,
                    scaleY: 1.04,
                    yoyo: true,
                    repeat: -1,
                    duration: 700
                });
            }
        }
    }

    updatePlayerSlot(slotIndex, playerData) {
        if (slotIndex >= this.playerSlots.length) return;
        const slot = this.playerSlots[slotIndex];

        let displayName = playerData.displayName || `Villager ${slotIndex + 1}`;
        if (displayName.length > 14) displayName = displayName.substring(0, 13) + '…';

        slot.nameText.setText(displayName);

        if (playerData.avatarId && this.textures.exists(`spr_avatar_${playerData.avatarId}`)) {
            slot.avatarSprite.setTexture(`spr_avatar_${playerData.avatarId}`, 0);
        }

        if (playerData.isHost) {
            slot.nameText.setColor('#F59E0B');
            slot.statusPillBg.setFillStyle(0x451A03, 0.95);
            slot.statusPillBg.setStrokeStyle(1.2, 0xF59E0B, 1);
            slot.readyBadge.setText('👑 HOST').setColor('#F59E0B');
            slot.bg.setStrokeStyle(1.8, 0xF59E0B, 0.9);
            slot.numBadgeBg.setFillStyle(0x451A03);
            slot.numBadgeBg.setStrokeStyle(1, 0xF59E0B);
        } else if (playerData.isBot) {
            slot.nameText.setColor('#E2D5C3');
            slot.statusPillBg.setFillStyle(0x1E293B, 0.95);
            slot.statusPillBg.setStrokeStyle(1, 0x64748B, 0.8);
            slot.readyBadge.setText('🤖 BOT').setColor('#94A3B8');
            slot.bg.setStrokeStyle(1.2, 0x3D322A, 0.8);
            slot.numBadgeBg.setFillStyle(0x181311);
        } else {
            slot.nameText.setColor('#FFFFFF');
            slot.statusPillBg.setFillStyle(0x064E3B, 0.95);
            slot.statusPillBg.setStrokeStyle(1.2, 0x10B981, 1);
            slot.readyBadge.setText('✓ READY').setColor('#4ADE80');
            slot.bg.setStrokeStyle(1.2, 0x10B981, 0.8);
            slot.numBadgeBg.setFillStyle(0x064E3B);
        }

        slot.avatarSprite.setAlpha(1);
        slot.occupied = true;
    }

    startGame() {
        if (this.players.length < 1 && !this.isCustom) return;
        window.socketClient.send({ type: 'START_GAME' });
    }

    createActionButton(x, y, text, colorHex, callback, widthOverride = 220) {
        const container = this.add.container(x, y).setDepth(20);

        const bg = this.add.rectangle(0, 0, widthOverride, 44, colorHex, 0.92);
        bg.setStrokeStyle(1.8, 0xF59E0B, 0.85);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9.5px',
            color: '#FFFFFF',
            letterSpacing: 1
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(Phaser.Display.Color.ValueToColor(colorHex).lighten(15).color);
            bg.setStrokeStyle(2, 0xFBBF24, 1);
            this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(colorHex);
            bg.setStrokeStyle(1.8, 0xF59E0B, 0.85);
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

    update(time) {
        if (this.embers) {
            const height = this.cameras.main.height;
            const width = this.cameras.main.width;

            this.embers.forEach(p => {
                p.shape.y += p.speedY;
                p.shape.x = p.baseX + Math.sin(time * p.swaySpeed + p.offset) * 10;

                if (p.shape.y < -15) {
                    p.shape.y = height + 15;
                    p.baseX = Phaser.Math.Between(10, width - 10);
                    p.shape.x = p.baseX;
                }
            });
        }
    }
}
