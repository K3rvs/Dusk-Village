import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VotingModal {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.selectedChoice = null;
        this.isMinimized = false;
        this.rawLivingPlayers = options.livingPlayers || [];

        const camW = scene.cameras.main.width;
        const camH = scene.cameras.main.height;
        const centerX = camW / 2;
        const centerY = camH / 2;

        // Container for full modal
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(2600);

        // 1. Dim Overlay
        this.dimOverlay = scene.add.rectangle(centerX, centerY, camW * 2, camH * 2, 0x000000, 0.72);
        this.dimOverlay.setInteractive(); // Blocks click-through to game while open

        // 2. Modal Card Frame (540px x 380px)
        const modalW = 540;
        const modalH = 380;
        this.box = scene.add.rectangle(centerX, centerY, modalW, modalH, 0x140F14, 0.98);
        this.box.setStrokeStyle(2.2, 0xEF4444, 0.95);

        // Header Title Banner
        this.headerBg = scene.add.rectangle(centerX, centerY - modalH / 2 + 26, modalW - 24, 34, 0x2A1010, 0.95);
        this.headerBg.setStrokeStyle(1.2, 0xEF4444, 0.8);

        this.title = scene.add.text(centerX, centerY - modalH / 2 + 26, '⚖️ VILLAGE COUNCIL JUDGEMENT', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '10px',
            color: '#F87171',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.subtitle = scene.add.text(centerX, centerY - modalH / 2 + 52, 'Discuss in Town Chat and cast your vote to banish a suspect', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: '#CBD5E1',
            align: 'center'
        }).setOrigin(0.5);

        // Top-Right Minimize Button
        this.minimizeBtn = scene.add.text(centerX + modalW / 2 - 36, centerY - modalH / 2 + 26, '─', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '12px',
            color: '#F59E0B'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.minimizeBtn.on('pointerover', () => this.minimizeBtn.setColor('#FDE68A'));
        this.minimizeBtn.on('pointerout', () => this.minimizeBtn.setColor('#F59E0B'));
        this.minimizeBtn.on('pointerdown', () => this.minimize());

        this.container.add([this.dimOverlay, this.box, this.headerBg, this.title, this.subtitle, this.minimizeBtn]);

        // 3. Candidate Cards (2 Columns x 5 Rows)
        const livingList = this.getLivingCandidates(this.rawLivingPlayers);
        this.candidateCards = [];

        const startX = centerX - 130;
        const startY = centerY - 88;
        const cardW = 246;
        const cardH = 34;
        const colGap = 260;
        const rowGap = 40;

        livingList.forEach((p, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const cx = (centerX - colGap / 2) + col * colGap;
            const cy = startY + row * rowGap;

            const isLocal = p.id === scene.localPlayerId || (p.name && p.name.includes('(YOU)'));

            const cardBg = scene.add.rectangle(cx, cy, cardW, cardH, 0x201717, 0.92);
            cardBg.setStrokeStyle(1, 0x4A2A2A, 0.85);

            // Avatar Icon
            const avatarTex = p.avatarId && scene.textures.exists(`spr_avatar_${p.avatarId}`)
                ? `spr_avatar_${p.avatarId}`
                : 'spr_avatar_01';
            const avatarIcon = scene.add.sprite(cx - cardW / 2 + 18, cy, avatarTex, 0).setScale(0.75);

            // Name
            let nameStr = p.name || `Player ${idx + 1}`;
            if (isLocal && !nameStr.includes('(YOU)')) nameStr += ' (YOU)';
            if (nameStr.length > 15) nameStr = nameStr.substring(0, 13) + '..';

            const nameText = scene.add.text(cx - cardW / 2 + 36, cy, nameStr, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7.5px',
                color: isLocal ? '#F59E0B' : '#FDFBF7'
            }).setOrigin(0, 0.5);

            let btnBg = null;
            let btnText = null;

            if (isLocal) {
                // Cannot vote to banish yourself! Show badge
                const youBadge = scene.add.rectangle(cx + cardW / 2 - 40, cy, 64, 20, 0x29221D, 0.95);
                youBadge.setStrokeStyle(1, 0x785338, 0.8);
                const youText = scene.add.text(cx + cardW / 2 - 40, cy, 'YOU', {
                    fontFamily: 'DogicaBold, monospace',
                    fontSize: '7px',
                    color: '#F59E0B'
                }).setOrigin(0.5);
                this.container.add([cardBg, avatarIcon, nameText, youBadge, youText]);
            } else {
                // Interactive Banish button
                const btnW = 74;
                const btnH = 22;
                btnBg = scene.add.rectangle(cx + cardW / 2 - btnW / 2 - 6, cy, btnW, btnH, 0x7F1D1D, 0.95);
                btnBg.setStrokeStyle(1, 0xDC2626, 0.8);
                btnBg.setInteractive({ useHandCursor: true });

                btnText = scene.add.text(cx + cardW / 2 - btnW / 2 - 6, cy, 'BANISH', {
                    fontFamily: 'Dogica, monospace',
                    fontSize: '7px',
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
            }

            this.candidateCards.push({ id: p.id, name: nameStr, isLocal, cardBg, btnBg, btnText });
        });

        // 4. Bottom Status Bar & Vote Confirmation
        const footerY = centerY + modalH / 2 - 30;

        this.statusText = scene.add.text(centerX, footerY, 'YOUR VOTE: [ SELECT A SUSPECT ABOVE ]', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#F59E0B'
        }).setOrigin(0.5);

        this.container.add([this.statusText]);

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

        // 5. Minimized Pill Badge (Top-Center)
        this.minimizedPill = scene.add.container(centerX, 28).setDepth(2700);
        this.minimizedPill.setScrollFactor(0);
        this.minimizedPill.setVisible(false);

        const pillBg = scene.add.rectangle(0, 0, 320, 26, 0x1A1111, 0.96);
        pillBg.setStrokeStyle(1.5, 0xEF4444, 0.95);
        pillBg.setInteractive({ useHandCursor: true });

        const pillText = scene.add.text(0, 0, '⚖️ COUNCIL VOTING [ CLICK TO EXPAND ⤢ ]', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7.5px',
            color: '#F87171'
        }).setOrigin(0.5);

        pillBg.on('pointerover', () => pillBg.setFillStyle(0x2A1515));
        pillBg.on('pointerout', () => pillBg.setFillStyle(0x1A1111));
        pillBg.on('pointerdown', () => this.restore());

        this.minimizedPill.add([pillBg, pillText]);

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
            if (c.isLocal || !c.btnBg) return;

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

        this.statusText.setText(`YOUR VOTE: [ BANISH ${displayName.toUpperCase()} ]`);
        this.statusText.setColor('#34D399');

        gameEvents.emit('hud:announcement', {
            text: `Voted to Banish ${displayName}`,
            color: '#EF4444'
        });
    }

    minimize() {
        this.isMinimized = true;
        this.container.setVisible(false);
        this.minimizedPill.setVisible(true);
    }

    restore() {
        this.isMinimized = false;
        this.minimizedPill.setVisible(false);
        this.container.setVisible(true);
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
        if (this.minimizedPill && this.minimizedPill.active) {
            this.minimizedPill.destroy();
        }
    }
}
