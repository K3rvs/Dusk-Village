import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VotingModal {
    constructor(scene, options = {}) {
        this.scene = scene;
        const camW = scene.cameras.main.width;
        const camH = scene.cameras.main.height;
        const centerX = camW / 2;
        const centerY = camH / 2;

        this.selectedChoice = null;
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(2600);

        // 1. Dim Overlay
        this.dimOverlay = scene.add.rectangle(centerX, centerY, camW * 2, camH * 2, 0x000000, 0.75);

        // 2. Modal Card Frame
        const modalW = 460;
        const modalH = 340;
        this.box = scene.add.rectangle(centerX, centerY, modalW, modalH, 0x140F14, 0.98);
        this.box.setStrokeStyle(2, 0xEF4444, 0.95);

        // Header Title Banner
        this.headerBg = scene.add.rectangle(centerX, centerY - modalH / 2 + 24, modalW - 20, 30, 0x2A1010, 0.95);
        this.headerBg.setStrokeStyle(1.2, 0xEF4444, 0.8);

        this.title = scene.add.text(centerX, centerY - modalH / 2 + 24, '⚖️ VILLAGE COUNCIL JUDGEMENT', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9px',
            color: '#F87171',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.subtitle = scene.add.text(centerX, centerY - modalH / 2 + 48, 'Cast your vote to banish a suspect from the village', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#CBD5E1',
            align: 'center'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.box, this.headerBg, this.title, this.subtitle]);

        // 3. Candidate Cards Container (2 columns x 5 rows)
        const livingList = this.getLivingCandidates(options.livingPlayers);
        this.candidateCards = [];

        const startX = centerX - 110;
        const startY = centerY - 80;
        const cardW = 205;
        const cardH = 30;
        const colGap = 220;
        const rowGap = 35;

        livingList.forEach((p, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const cx = (centerX - colGap / 2) + col * colGap;
            const cy = startY + row * rowGap;

            const cardBg = scene.add.rectangle(cx, cy, cardW, cardH, 0x201717, 0.92);
            cardBg.setStrokeStyle(1, 0x4A2A2A, 0.85);

            // Avatar Icon
            const avatarTex = p.avatarId && scene.textures.exists(`spr_avatar_${p.avatarId}`)
                ? `spr_avatar_${p.avatarId}`
                : 'spr_avatar_01';
            const avatarIcon = scene.add.sprite(cx - cardW / 2 + 16, cy, avatarTex, 0).setScale(0.7);

            // Name
            const isLocal = p.id === scene.localPlayerId;
            let nameStr = p.name || `Player ${idx + 1}`;
            if (isLocal) nameStr += ' (YOU)';
            if (nameStr.length > 13) nameStr = nameStr.substring(0, 11) + '..';

            const nameText = scene.add.text(cx - cardW / 2 + 32, cy, nameStr, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7px',
                color: isLocal ? '#F59E0B' : '#FDFBF7'
            }).setOrigin(0, 0.5);

            // Banish Button
            const btnW = 68;
            const btnH = 20;
            const btnBg = scene.add.rectangle(cx + cardW / 2 - btnW / 2 - 6, cy, btnW, btnH, 0x7F1D1D, 0.95);
            btnBg.setStrokeStyle(1, 0xDC2626, 0.8);
            btnBg.setInteractive({ useHandCursor: true });

            const btnText = scene.add.text(cx + cardW / 2 - btnW / 2 - 6, cy, 'BANISH', {
                fontFamily: 'Dogica, monospace',
                fontSize: '6.5px',
                color: '#FFFFFF'
            }).setOrigin(0.5);

            btnBg.on('pointerover', () => {
                if (this.selectedChoice !== p.id) btnBg.setFillStyle(0x991B1B);
            });
            btnBg.on('pointerout', () => {
                if (this.selectedChoice !== p.id) btnBg.setFillStyle(0x7F1D1D);
            });
            btnBg.on('pointerdown', () => {
                this.castVote(p.id, nameStr);
            });

            this.container.add([cardBg, avatarIcon, nameText, btnBg, btnText]);
            this.candidateCards.push({ id: p.id, name: nameStr, cardBg, btnBg, btnText });
        });

        // 4. Bottom Controls & Status Bar
        const footerY = centerY + modalH / 2 - 32;

        // Skip / Forgive Button
        this.skipBtnBg = scene.add.rectangle(centerX - 120, footerY, 140, 24, 0x1E293B, 0.95);
        this.skipBtnBg.setStrokeStyle(1.2, 0x64748B, 0.8);
        this.skipBtnBg.setInteractive({ useHandCursor: true });

        this.skipBtnText = scene.add.text(centerX - 120, footerY, '🟢 SKIP EVICTION', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#CBD5E1'
        }).setOrigin(0.5);

        this.skipBtnBg.on('pointerover', () => {
            if (this.selectedChoice !== 'SKIP') this.skipBtnBg.setFillStyle(0x334155);
        });
        this.skipBtnBg.on('pointerout', () => {
            if (this.selectedChoice !== 'SKIP') this.skipBtnBg.setFillStyle(0x1E293B);
        });
        this.skipBtnBg.on('pointerdown', () => {
            this.castVote('SKIP', 'SKIP EVICTION');
        });

        // Current Vote Status Display
        this.statusText = scene.add.text(centerX + 60, footerY, 'YOUR VOTE: [ NONE ]', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7px',
            color: '#F59E0B'
        }).setOrigin(0.5);

        // Minimize / Close Button
        this.closeBtn = scene.add.text(centerX + modalW / 2 - 20, centerY - modalH / 2 + 18, '✕', {
            fontFamily: 'Dogica, monospace',
            fontSize: '10px',
            color: '#94A3B8'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.closeBtn.on('pointerdown', () => this.destroy());

        this.container.add([this.skipBtnBg, this.skipBtnText, this.statusText, this.closeBtn]);

        // Entrance Animation
        this.container.setAlpha(0);
        this.container.setScale(0.92);
        scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.out'
        });

        this.setupEventListeners();
    }

    getLivingCandidates(rawList) {
        if (Array.isArray(rawList) && rawList.length > 0) {
            return rawList;
        }

        const gameScene = this.scene.gameScene || this.scene.scene.get('GameScene');
        if (gameScene && gameScene.allPlayers) {
            return gameScene.allPlayers.filter(p => !p.isDead && !p.isEvicted);
        }

        if (this.scene.allPlayers) {
            return this.scene.allPlayers.filter(p => !p.isDead && !p.isEvicted);
        }

        return [];
    }

    castVote(choice, displayName) {
        this.selectedChoice = choice;

        if (window.socketClient) {
            window.socketClient.send({ type: 'VOTE_CAST', choice: choice });
        }

        gameEvents.emit('vote:cast', { choice: choice });

        // Update card styles
        this.candidateCards.forEach(c => {
            if (c.id === choice) {
                c.btnBg.setFillStyle(0x065F46);
                c.btnBg.setStrokeStyle(1.2, 0x10B981, 1);
                c.btnText.setText('VOTED ✓');
                c.btnText.setColor('#4ADE80');
                c.cardBg.setStrokeStyle(1.2, 0x10B981, 0.9);
            } else {
                c.btnBg.setFillStyle(0x7F1D1D);
                c.btnBg.setStrokeStyle(1, 0xDC2626, 0.8);
                c.btnText.setText('BANISH');
                c.btnText.setColor('#FFFFFF');
                c.cardBg.setStrokeStyle(1, 0x4A2A2A, 0.85);
            }
        });

        if (choice === 'SKIP') {
            this.skipBtnBg.setFillStyle(0x065F46);
            this.skipBtnBg.setStrokeStyle(1.2, 0x10B981, 1);
            this.skipBtnText.setText('VOTED SKIP ✓');
            this.skipBtnText.setColor('#4ADE80');
            this.statusText.setText('YOUR VOTE: [ SKIP EVICTION ]');
            this.statusText.setColor('#34D399');
        } else {
            this.skipBtnBg.setFillStyle(0x1E293B);
            this.skipBtnBg.setStrokeStyle(1.2, 0x64748B, 0.8);
            this.skipBtnText.setText('🟢 SKIP EVICTION');
            this.skipBtnText.setColor('#CBD5E1');
            this.statusText.setText(`YOUR VOTE: [ ${displayName.toUpperCase()} ]`);
            this.statusText.setColor('#F87171');
        }

        gameEvents.emit('hud:announcement', {
            text: choice === 'SKIP' ? 'Voted to Skip Eviction' : `Voted to Banish ${displayName}`,
            color: choice === 'SKIP' ? '#34D399' : '#EF4444'
        });
    }

    setupEventListeners() {
        this.phaseListener = (data) => {
            const p = (data.phase || data.to || '').toUpperCase();
            if (p !== 'JUDGEMENT_PHASE' && p !== 'JUDGEMENT') {
                this.destroy();
            }
        };

        gameEvents.on('phase:changed', this.phaseListener);
        gameEvents.on('phase:serverChanged', this.phaseListener);
    }

    destroy() {
        if (this.phaseListener) {
            gameEvents.off('phase:changed', this.phaseListener);
            gameEvents.off('phase:serverChanged', this.phaseListener);
        }
        if (this.container && this.container.active) {
            this.container.destroy();
        }
    }
}
