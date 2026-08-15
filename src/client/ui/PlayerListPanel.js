import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class PlayerListPanel {
    constructor(scene) {
        this.scene = scene;
        this.isCollapsed = false;

        this.container = scene.add.container(16, 56);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        this.panelW = 216;
        this.panelH = 316;

        // Warm Espresso Walnut Glass Panel
        this.bg = scene.add.rectangle(0, 0, this.panelW, this.panelH, 0x181311, 0.95).setOrigin(0, 0);
        this.bg.setStrokeStyle(1.6, 0x785338, 0.9);

        // Header Title Bar (Clickable to collapse/expand)
        this.header = scene.add.rectangle(0, 0, this.panelW, 26, 0x231E1B, 0.95).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        this.headerBorder = scene.add.rectangle(0, 26, this.panelW, 1, 0xD97706, 0.7).setOrigin(0, 0);
        
        this.headerText = scene.add.text(10, 13, 'VILLAGERS', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        this.aliveCountText = scene.add.text(this.panelW - 42, 13, '10/10', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7.5px',
            color: '#4ADE80'
        }).setOrigin(1, 0.5);

        this.toggleBtn = scene.add.text(this.panelW - 14, 13, '[-]', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#A89F91'
        }).setOrigin(0.5, 0.5);

        this.slotsContainer = scene.add.container(0, 0);

        this.container.add([
            this.bg,
            this.header,
            this.headerBorder,
            this.headerText,
            this.aliveCountText,
            this.toggleBtn,
            this.slotsContainer
        ]);

        this.slots = [];
        for (let i = 0; i < 10; i++) {
            const y = 32 + i * 28;
            const slotBg = scene.add.rectangle(6, y, this.panelW - 12, 25, 0x231E1B, 0.9).setOrigin(0, 0);
            slotBg.setStrokeStyle(1, 0x3D322A, 0.8);

            // Avatar Frame & Sprite
            const avatarFrame = scene.add.rectangle(18, y + 12.5, 18, 18, 0x181311, 1);
            avatarFrame.setStrokeStyle(1, 0x785338);

            const avatarIcon = scene.add.sprite(18, y + 12.5, 'spr_avatar_01', 0).setScale(0.75);

            // Player Name Text
            const nameText = scene.add.text(32, y + 12.5, `Player ${i + 1}`, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7px',
                color: '#FDFBF7'
            }).setOrigin(0, 0.5);

            // Status Pill (ALIVE / DEAD)
            const statusBg = scene.add.rectangle(this.panelW - 30, y + 12.5, 42, 16, 0x14532D, 0.9);
            statusBg.setStrokeStyle(1, 0x15803D, 0.9);

            const statusText = scene.add.text(this.panelW - 30, y + 12.5, 'ALIVE', {
                fontFamily: 'DogicaBold, Dogica, monospace',
                fontSize: '6.5px',
                color: '#4ADE80',
                letterSpacing: 0.5
            }).setOrigin(0.5, 0.5);

            this.slotsContainer.add([slotBg, avatarFrame, avatarIcon, nameText, statusBg, statusText]);
            this.slots.push({ slotBg, avatarFrame, avatarIcon, nameText, statusBg, statusText, playerId: null });
        }

        this.header.on('pointerdown', () => this.toggleCollapse());

        this.updatePlayerList();
        this.setupEventListeners();
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.slotsContainer.setVisible(!this.isCollapsed);
        this.toggleBtn.setText(this.isCollapsed ? '[+]' : '[-]');
        this.bg.setSize(this.panelW, this.isCollapsed ? 28 : this.panelH);
    }

    onResize(width, height) {
        this.container.setPosition(16, 56);
    }

    updatePlayerList() {
        if (!this.scene.allPlayers) return;
        let aliveCount = 0;
        const localId = this.scene.localPlayerId;

        this.scene.allPlayers.forEach((p, idx) => {
            if (idx < this.slots.length) {
                const s = this.slots[idx];
                s.playerId = p.id || p.playerId;
                const isLocal = p.id === localId || p.playerId === localId;
                const isEvicted = p.isEvicted || p.isDead;

                if (!isEvicted) aliveCount++;

                let displayName = p.name || (p.isBot ? `Bot ${p.botId || idx + 1}` : `Player ${idx + 1}`);
                if (isLocal) {
                    if (displayName.length > 9) displayName = displayName.substring(0, 7) + '..';
                    displayName += ' (YOU)';
                } else {
                    if (displayName.length > 13) displayName = displayName.substring(0, 11) + '..';
                }

                s.nameText.setText(displayName);
                s.nameText.setColor(isLocal ? '#F59E0B' : '#FDFBF7');

                if (p.avatarId && this.scene.textures.exists(`spr_avatar_${p.avatarId}`)) {
                    s.avatarIcon.setTexture(`spr_avatar_${p.avatarId}`, 0);
                }

                if (isEvicted) {
                    s.statusBg.setFillStyle(0x7F1D1D, 0.9);
                    s.statusBg.setStrokeStyle(1, 0xDC2626, 0.9);
                    s.statusText.setText('DEAD');
                    s.statusText.setColor('#F87171');
                    s.nameText.setColor('#78716C');
                    s.avatarIcon.setAlpha(0.35);
                    s.slotBg.setAlpha(0.5);
                } else {
                    s.statusBg.setFillStyle(0x14532D, 0.9);
                    s.statusBg.setStrokeStyle(1, 0x15803D, 0.9);
                    s.statusText.setText('ALIVE');
                    s.statusText.setColor('#4ADE80');
                    s.avatarIcon.setAlpha(1);
                    s.slotBg.setAlpha(1);
                }
            }
        });

        const totalPlayers = this.scene.allPlayers.length || 10;
        this.aliveCountText.setText(`${aliveCount}/${totalPlayers}`);
    }

    setupEventListeners() {
        gameEvents.on('player:evicted', () => {
            this.updatePlayerList();
        });
        gameEvents.on('player:statusUpdated', () => {
            this.updatePlayerList();
        });
    }

    destroy() {
        this.container.destroy();
    }
}
