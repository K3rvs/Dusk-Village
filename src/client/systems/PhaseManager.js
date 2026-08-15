import { PHASES, CONFIG, COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { formatTime } from '../utils/Helpers.js';

export class PhaseManager {
    constructor(scene) {
        this.scene = scene;
        this.currentPhase = PHASES.DAY_PHASE;
        this.timeRemaining = 0;
        this.totalDuration = 0;
        this.isRunning = false;
        this.timerEvent = null;

        gameEvents.on('phase:timeSync', (data) => {
            if (data && data.remaining !== undefined) {
                if (data.total) this.totalDuration = data.total;
                // Only snap to server value if we've drifted by more than 2 seconds
                // This prevents the local Phaser timer and server sync fighting each other
                const serverRemaining = Math.round(data.remaining);
                const drift = Math.abs(this.timeRemaining - serverRemaining);
                if (drift > 2) {
                    this.timeRemaining = serverRemaining;
                    gameEvents.emit('phase:timerTick', {
                        remaining: this.timeRemaining,
                        total: this.totalDuration,
                        displayString: formatTime(this.timeRemaining)
                    });
                }
            }
        });
    }

    startPhase(phase, durationOverride = null) {
        this.currentPhase = phase;
        this.totalDuration = durationOverride || this.getPhaseDuration(phase);
        this.timeRemaining = this.totalDuration;
        this.isRunning = true;

        gameEvents.emit('phase:changed', {
            from: this.currentPhase,
            to: phase,
            duration: this.totalDuration
        });

        // Immediately emit first timer tick so TopBar updates with 0 latency
        gameEvents.emit('phase:timerTick', {
            remaining: this.timeRemaining,
            total: this.totalDuration,
            displayString: formatTime(this.timeRemaining)
        });

        // Visual Polish: Smooth Phase Overlay Transition
        if (this.scene && this.scene.phaseOverlay) {
            const overlayInfo = this.getPhaseOverlayColor(phase);
            this.scene.phaseOverlay.setFillStyle(overlayInfo.color, overlayInfo.alpha);
        }

        // Show Banner Toast Announcement on Scene
        this.showPhaseBanner(phase);

        // Start countdown on UIScene (which is never paused during interiors)
        if (this.timerEvent) this.timerEvent.remove();
        const uiScene = (this.scene && this.scene.scene) ? this.scene.scene.get('UIScene') : null;
        const timerScene = (uiScene && uiScene.time) ? uiScene : this.scene;
        
        this.timerEvent = timerScene.time.addEvent({
            delay: 1000,
            repeat: Math.max(1, this.totalDuration - 1),
            callback: () => this.tick()
        });
    }

    showPhaseBanner(phase) {
        if (!this.scene || !this.scene.add) return;
        
        let targetScene = this.scene;
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && this.scene.scene.isActive('UIScene')) {
            targetScene = uiScene;
        }

        const width = targetScene.cameras.main.width;
        const height = targetScene.cameras.main.height;

        let titleStr = 'DAY PHASE';
        let subStr = 'Gather fragments and verify claims in the Library!';
        let bannerColor = 0xF59E0B;
        let phaseIcon = '☀️';

        if (phase === PHASES.JUDGEMENT_PHASE) {
            phaseIcon = '⚖️';
            titleStr = 'JUDGEMENT PHASE';
            subStr = 'Gather at the Town Square to debate and vote!';
            bannerColor = 0xEF4444;
        } else if (phase === PHASES.NIGHT_PHASE) {
            phaseIcon = '🌙';
            titleStr = 'NIGHT PHASE';
            subStr = 'Survivors stay in houses. Instigators execute sabotages!';
            bannerColor = 0x8B5CF6;
        } else if (phase === PHASES.ROLE_ASSIGNMENT) {
            phaseIcon = '📜';
            titleStr = 'INITIATION PHASE';
            subStr = 'Check your role inside your house!';
            bannerColor = 0x38BDF8;
        }

        // Clean up any existing active banner
        if (this.activeBannerTween) {
            this.activeBannerTween.stop();
            this.activeBannerTween = null;
        }
        if (this.activeBannerElements) {
            this.activeBannerElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
            this.activeBannerElements = null;
        }

        // 30% Bigger: 600px x 56px
        const bannerW = 600;
        const bannerH = 56;
        const bannerY = height * 0.25;

        const bannerBg = targetScene.add.rectangle(width / 2, bannerY, bannerW, bannerH, 0x140F14, 0.98);
        bannerBg.setStrokeStyle(2, bannerColor, 0.95);
        bannerBg.setScrollFactor(0).setDepth(400);

        const innerBorder = targetScene.add.rectangle(width / 2, bannerY, bannerW - 10, bannerH - 10, 0x000000, 0);
        innerBorder.setStrokeStyle(1, 0x3D322A, 0.7);
        innerBorder.setScrollFactor(0).setDepth(400);

        const titleText = targetScene.add.text(width / 2, bannerY - 11, `${phaseIcon} ${titleStr}`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '13px',
            color: '#FFF8EE',
            letterSpacing: 1.5,
            shadow: { offsetX: 0, offsetY: 2, color: '#D97706', blur: 10, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        const subText = targetScene.add.text(width / 2, bannerY + 11, subStr, {
            fontFamily: 'Dogica, monospace',
            fontSize: '8.5px',
            color: '#E2D5C3',
            letterSpacing: 0.5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(401);

        this.activeBannerElements = [bannerBg, innerBorder, titleText, subText];

        bannerBg.setAlpha(0);
        innerBorder.setAlpha(0);
        titleText.setAlpha(0);
        subText.setAlpha(0);

        targetScene.tweens.add({
            targets: [bannerBg, innerBorder, titleText, subText],
            alpha: 1,
            duration: 200,
            ease: 'Power2.out'
        });

        this.activeBannerTween = targetScene.tweens.add({
            targets: [bannerBg, innerBorder, titleText, subText],
            alpha: 0,
            delay: 2500,
            duration: 500,
            ease: 'Power2.in',
            onComplete: () => {
                bannerBg.destroy();
                innerBorder.destroy();
                titleText.destroy();
                subText.destroy();
                this.activeBannerElements = null;
                this.activeBannerTween = null;
            }
        });
    }

    tick() {
        this.timeRemaining--;

        gameEvents.emit('phase:timerTick', {
            remaining: this.timeRemaining,
            total: this.totalDuration,
            displayString: formatTime(this.timeRemaining)
        });

        // Warning threshold
        if (this.timeRemaining === CONFIG.TIMER_WARNING_THRESHOLD) {
            gameEvents.emit('phase:timerWarning', { remaining: this.timeRemaining });
        }

        // Critical threshold
        if (this.timeRemaining === CONFIG.TIMER_CRITICAL_THRESHOLD) {
            gameEvents.emit('phase:timerCritical', { remaining: this.timeRemaining });
        }

        // Expired
        if (this.timeRemaining <= 0) {
            this.isRunning = false;
            gameEvents.emit('phase:timerExpired', { phase: this.currentPhase });
        }
    }

    getPhaseDuration(phase) {
        switch (phase) {
            case PHASES.ROLE_ASSIGNMENT: return CONFIG.ROLE_ASSIGNMENT_DURATION || 10;
            case PHASES.DAY_PHASE: return CONFIG.DAY_PHASE_DURATION || 120;
            case PHASES.JUDGEMENT_PHASE: return CONFIG.JUDGEMENT_PHASE_DURATION || 60;
            case PHASES.NIGHT_PHASE: return CONFIG.NIGHT_PHASE_DURATION || 45;
            default: return 60;
        }
    }

    getPhaseOverlayColor(phase) {
        switch (phase) {
            case PHASES.DAY_PHASE: return { color: COLORS.DAY_OVERLAY, alpha: 0.08 };
            case PHASES.JUDGEMENT_PHASE: return { color: COLORS.JUDGEMENT_OVERLAY, alpha: 0.25 };
            case PHASES.NIGHT_PHASE: return { color: COLORS.NIGHT_OVERLAY, alpha: 0.65 };
            default: return { color: 0x000000, alpha: 0 };
        }
    }

    isMovementAllowed(playerRole) {
        switch (this.currentPhase) {
            case PHASES.DAY_PHASE: return true;
            case PHASES.JUDGEMENT_PHASE: return true;
            case PHASES.NIGHT_PHASE: return playerRole === 'INSTIGATOR';
            default: return true;
        }
    }

    isChatAllowed(chatMode, playerRole) {
        switch (this.currentPhase) {
            case PHASES.DAY_PHASE: return chatMode === 'PROXIMITY';
            case PHASES.JUDGEMENT_PHASE: return chatMode === 'TOWN';
            case PHASES.NIGHT_PHASE: return chatMode === 'INSTIGATOR' && playerRole === 'INSTIGATOR';
            case PHASES.GAME_OVER: return chatMode === 'TOWN';
            default: return false;
        }
    }

    reduceTime(seconds) {
        this.timeRemaining = Math.max(0, this.timeRemaining - seconds);
        gameEvents.emit('phase:timeReduced', { amount: seconds, remaining: this.timeRemaining });
    }

    destroy() {
        if (this.timerEvent) this.timerEvent.remove();
    }
}
