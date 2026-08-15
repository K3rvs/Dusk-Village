import Phaser from 'phaser';
import { HUDManager } from '../ui/HUDManager.js';
import { gameEvents } from '../utils/EventBus.js';
import { SolveMysteryModal } from '../ui/SolveMysteryModal.js';
import { RoleAssignmentModal } from '../ui/RoleAssignmentModal.js';
import { VotingModal } from '../ui/VotingModal.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.localPlayerId = data.localPlayerId;
        this.localPlayerRole = data.localPlayerRole;
        this.allPlayers = data.allPlayers;
        this.fragmentManager = this.gameScene.fragmentManager;
    }

    create() {
        this.hudManager = new HUDManager(this);
        this.activeModal = null;
        
        // Floating Interaction Prompt (Crisp UI resolution)
        this.promptContainer = this.add.container(0, 0).setDepth(500).setVisible(false);
        const promptBg = this.add.rectangle(0, 0, 110, 32, 0x181311, 0.98);
        promptBg.setStrokeStyle(1.5, 0xF59E0B, 1);
        
        this.promptTextLabel = this.add.text(0, 0, '[E] INTERACT', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#F59E0B',
            letterSpacing: 0.5
        }).setOrigin(0.5);
        this.promptContainer.add([promptBg, this.promptTextLabel]);
    }
    
    setInteractionPrompt(x, y, text) {
        this.promptContainer.setPosition(x, y);
        if (this.promptTextLabel.text !== text) {
            this.promptTextLabel.setText(text);
            const bounds = this.promptTextLabel.getBounds();
            this.promptContainer.list[0].setSize(bounds.width + 20, 26);
        }
        if (!this.promptContainer.visible) {
            this.promptContainer.setVisible(true);
            this.promptContainer.setScale(0.85);
            this.tweens.add({
                targets: this.promptContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.out'
            });
        }
    }
    
    hideInteractionPrompt() {
        if (this.promptContainer.visible) {
            this.promptContainer.setVisible(false);
        }
    }

    showVerificationProgress(onComplete) {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 - 30;

        const modalW = 340;
        const modalH = 74;
        const barW = 260;
        const barH = 18;

        const container = this.add.container(centerX, centerY).setDepth(2500);

        const modalBg = this.add.rectangle(0, 0, modalW, modalH, 0x140F14, 0.98);
        modalBg.setStrokeStyle(1.8, 0xF59E0B, 0.95);

        const titleText = this.add.text(0, -18, '🔍 VERIFYING DOCUMENT METADATA...', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8.5px',
            color: '#F59E0B',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        const bgBar = this.add.rectangle(-barW / 2, 12, barW, barH, 0x0F172A, 0.95).setOrigin(0, 0.5);
        bgBar.setStrokeStyle(1.2, 0x334155, 0.9);

        const fillBar = this.add.rectangle(-barW / 2 + 2, 12, 0, barH - 4, 0x10B981).setOrigin(0, 0.5);

        const percentText = this.add.text(0, 12, '0%', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        container.add([modalBg, titleText, bgBar, fillBar, percentText]);

        container.setAlpha(0);
        container.setScale(0.92);
        this.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.out'
        });

        let progress = 0;
        this.time.addEvent({
            delay: 50,
            repeat: 39,
            callback: () => {
                progress += 0.025;
                fillBar.width = (barW - 4) * Math.min(1, progress);
                percentText.setText(`${Math.round(Math.min(100, progress * 100))}%`);

                if (progress >= 1.0) {
                    this.tweens.add({
                        targets: container,
                        alpha: 0,
                        scaleX: 0.95,
                        scaleY: 0.95,
                        duration: 150,
                        onComplete: () => {
                            container.destroy();
                            if (onComplete) onComplete();
                        }
                    });
                }
            }
        });
    }

    showSolveMysteryModal(mysteryData) {
        if (this.activeModal) this.activeModal.destroy();
        this.activeModal = new SolveMysteryModal(this, mysteryData);
    }

    showMysteryAnnouncementModal(mysteryData) {
        if (this.activeModal) this.activeModal.destroy();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const container = this.add.container(0, 0).setDepth(300);
        
        const modalW = 500;
        const modalH = 220;
        const modalBg = this.add.rectangle(centerX, centerY, modalW, modalH, 0x181311, 0.96);
        modalBg.setStrokeStyle(2, 0xF59E0B, 0.9);

        const headerText = this.add.text(centerX, centerY - 65, 'CURRENT MYSTERY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '13px',
            color: '#F8FAFC',
            letterSpacing: 1
        }).setOrigin(0.5);

        const titleText = this.add.text(centerX, centerY - 35, `"${mysteryData.title}"`, {
            fontFamily: 'Dogica, monospace',
            fontSize: '10px',
            color: '#F59E0B'
        }).setOrigin(0.5);
        
        const introText = this.add.text(centerX, centerY + 10, mysteryData.narrativeIntro || 'Find fragments to solve the mystery!', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#CBD5E1',
            align: 'center',
            wordWrap: { width: modalW - 40 }
        }).setOrigin(0.5);

        const closeBtn = this.add.text(centerX, centerY + 70, 'CLOSE', {
            fontFamily: 'Dogica, monospace',
            fontSize: '9px',
            color: '#FFFFFF',
            backgroundColor: '#334155',
            padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => container.destroy());

        container.add([modalBg, headerText, titleText, introText, closeBtn]);
        this.activeModal = container;
    }

    showRoleAssignmentModal(roleData) {
        if (this.activeModal) this.activeModal.destroy();
        this.activeModal = new RoleAssignmentModal(this, roleData);
    }

    showVotingModal(playerName) {
        if (this.activeModal) this.activeModal.destroy();
        this.activeModal = new VotingModal(this, { nominatedPlayerName: playerName });
    }

    showInitiationModal(role) {
        if (this.activeModal) this.activeModal.destroy();
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const container = this.add.container(0, 0).setDepth(400);
        
        // 1. Dimmer Backdrop
        const dimmer = this.add.rectangle(centerX, centerY, width * 2, height * 2, 0x000000, 0.7);

        // 2. Frosted Glass Modal Box (30% Bigger: 600px x 300px)
        const modalW = 600;
        const modalH = 300;
        const roleIsInstigator = role === 'INSTIGATOR';
        const roleColorHex = roleIsInstigator ? '#F87171' : '#4ADE80';
        const roleColorNum = roleIsInstigator ? 0xEF4444 : 0x10B981;
        const roleBgNum = roleIsInstigator ? 0x450A0A : 0x064E3B;

        const modalBg = this.add.rectangle(centerX, centerY, modalW, modalH, 0x140F14, 0.98);
        modalBg.setStrokeStyle(2.5, roleColorNum, 0.95);

        // Inner decorative frame
        const innerBorder = this.add.rectangle(centerX, centerY, modalW - 16, modalH - 16, 0x000000, 0);
        innerBorder.setStrokeStyle(1, 0x3D322A, 0.8);

        // Header Tag
        const tagText = this.add.text(centerX, centerY - 116, '[ PHASE BRIEFING ]', {
            fontFamily: 'Dogica, monospace',
            fontSize: '9.5px',
            color: '#F59E0B',
            letterSpacing: 1.5
        }).setOrigin(0.5);

        // Main Title
        const headerText = this.add.text(centerX, centerY - 90, 'INITIATION PHASE', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '17px',
            color: '#FFF8EE',
            letterSpacing: 1.5,
            shadow: { offsetX: 0, offsetY: 2, color: '#D97706', blur: 12, fill: true }
        }).setOrigin(0.5);

        // Role Badge Pill (Prominent 290px x 42px)
        const roleBadgeBg = this.add.rectangle(centerX, centerY - 44, 290, 42, roleBgNum, 0.95);
        roleBadgeBg.setStrokeStyle(2, roleColorNum, 1);

        const roleIcon = roleIsInstigator ? '🗡️' : '🛡️';
        const roleTitle = this.add.text(centerX, centerY - 44, `${roleIcon} ROLE: ${role}`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '15px',
            color: roleColorHex,
            letterSpacing: 1.5
        }).setOrigin(0.5);

        const descStr = roleIsInstigator
            ? 'Deceive survivors, plant fabricated fragments\n& sabotage village buildings during the night!'
            : 'Find authentic UNESCO MIL fragments in the village\n& verify claims at the Library before nightfall!';

        const descText = this.add.text(centerX, centerY + 18, descStr, {
            fontFamily: 'Dogica, monospace',
            fontSize: '10px',
            color: '#E2D5C3',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: modalW - 60 }
        }).setOrigin(0.5);

        // Countdown Timer Pill Box (340px x 38px)
        const timerPillBg = this.add.rectangle(centerX, centerY + 92, 340, 38, 0x1A141A, 0.96);
        timerPillBg.setStrokeStyle(1.6, 0xF59E0B, 0.9);

        const pm = (this.gameScene && this.gameScene.phaseManager) ? this.gameScene.phaseManager : null;
        const initialDuration = pm ? Math.min(15, Math.max(0, pm.timeRemaining)) : 15;
        this.initiationTimerText = this.add.text(centerX, centerY + 90, `⏳ STAY INSIDE: ${initialDuration}s`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        // Inner decay progress bar
        const timerDecayBar = this.add.rectangle(centerX - 164, centerY + 107, 328, 3, 0xF59E0B, 0.95).setOrigin(0, 0.5);

        // Minimize Button in top-right corner
        const minBtnBg = this.add.rectangle(centerX + modalW / 2 - 58, centerY - modalH / 2 + 20, 84, 20, 0x1A141A, 0.9);
        minBtnBg.setStrokeStyle(1, 0xF59E0B, 0.7);
        minBtnBg.setInteractive({ useHandCursor: true });

        const minBtnText = this.add.text(centerX + modalW / 2 - 58, centerY - modalH / 2 + 20, '[-] MINIMIZE', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#F59E0B'
        }).setOrigin(0.5);

        container.add([
            dimmer,
            modalBg,
            innerBorder,
            tagText,
            headerText,
            roleBadgeBg,
            roleTitle,
            descText,
            timerPillBg,
            this.initiationTimerText,
            timerDecayBar,
            minBtnBg,
            minBtnText
        ]);

        this.activeModal = container;

        // Minimized Floating Badge (Appears when minimized)
        const miniBadge = this.add.container(centerX, 68).setDepth(2100).setVisible(false);
        const miniBg = this.add.rectangle(0, 0, 360, 26, 0x140F14, 0.96);
        miniBg.setStrokeStyle(1.5, roleColorNum, 0.95);
        miniBg.setInteractive({ useHandCursor: true });

        const miniText = this.add.text(0, 0, `${roleIcon} ${role} | ⏳ STAY INSIDE: ${initialDuration}s | [↗ EXPAND]`, {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: roleColorHex
        }).setOrigin(0.5);

        miniBadge.add([miniBg, miniText]);

        // Toggle Minimize / Expand
        const minimizeModal = () => {
            container.setVisible(false);
            miniBadge.setVisible(true);
            miniBadge.setAlpha(0);
            this.tweens.add({ targets: miniBadge, alpha: 1, duration: 150 });
        };

        const expandModal = () => {
            miniBadge.setVisible(false);
            container.setVisible(true);
            container.setAlpha(0);
            this.tweens.add({ targets: container, alpha: 1, duration: 150 });
        };

        minBtnBg.on('pointerdown', minimizeModal);
        minBtnBg.on('pointerover', () => { minBtnBg.setFillStyle(0x2E1E12); minBtnText.setColor('#FDE68A'); });
        minBtnBg.on('pointerout', () => { minBtnBg.setFillStyle(0x1A141A); minBtnText.setColor('#F59E0B'); });

        miniBg.on('pointerdown', expandModal);
        miniBg.on('pointerover', () => { miniBg.setFillStyle(0x24181A); });
        miniBg.on('pointerout', () => { miniBg.setFillStyle(0x140F14); });

        // Smooth entry animation
        container.setAlpha(0);
        container.setScale(0.92);
        this.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 250,
            ease: 'Back.out'
        });

        const cleanupListeners = () => {
            gameEvents.off('phase:timerTick', onTick);
            gameEvents.off('phase:changed', onPhaseEnd);
            gameEvents.off('phase:serverChanged', onPhaseEnd);
        };

        const closeModal = () => {
            cleanupListeners();
            if (miniBadge && miniBadge.active) miniBadge.destroy();
            if (container && container.active) {
                this.tweens.add({
                    targets: container,
                    alpha: 0,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 150,
                    onComplete: () => {
                        if (container && container.active) container.destroy();
                        if (this.activeModal === container) this.activeModal = null;
                    }
                });
            }
            gameEvents.emit('interior:unlockInitiation');
        };

        const onTick = (data) => {
            const phaseName = (data.phase || (pm ? pm.currentPhase : '')).toUpperCase();
            if (phaseName && phaseName !== 'ROLE_ASSIGNMENT') {
                closeModal();
                return;
            }

            const rem = data.remaining !== undefined ? data.remaining : 0;
            const tot = data.total || 15;

            if (rem <= 0 || rem > 20) {
                closeModal();
                return;
            }

            if (this.initiationTimerText && this.initiationTimerText.active) {
                this.initiationTimerText.setText(`⏳ STAY INSIDE: ${rem}s`);
            }
            if (miniText && miniText.active) {
                miniText.setText(`${roleIcon} ${role} | ⏳ STAY INSIDE: ${rem}s | [↗ EXPAND]`);
            }
            if (timerDecayBar && timerDecayBar.active) {
                timerDecayBar.scaleX = Math.max(0, Math.min(1, rem / tot));
            }
        };

        const onPhaseEnd = (data) => {
            const p = (data.phase || data.to || '').toUpperCase();
            if (p === 'DAY_PHASE' || p === 'JUDGEMENT_PHASE' || p === 'NIGHT_PHASE') {
                closeModal();
            }
        };

        gameEvents.on('phase:timerTick', onTick);
        gameEvents.on('phase:changed', onPhaseEnd);
        gameEvents.on('phase:serverChanged', onPhaseEnd);
    }

    update() {
        if (this.hudManager) {
            this.hudManager.update();
        }
    }
}
