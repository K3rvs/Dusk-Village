import { CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VerificationSystem {
    constructor(scene) {
        this.scene = scene;
        this.isVerifying = false;
        this.verificationTimer = 0;
        this.verificationPartner = null;
        this.progressBar = null;
    }

    startVerification(playerAId, playerBId) {
        this.isVerifying = true;
        this.verificationTimer = CONFIG.VERIFICATION_DURATION * 1000;
        this.verificationPartner = playerBId;

        this.createProgressBar();

        gameEvents.emit('vfx:play', {
            key: 'vfx_sparkle_play',
            x: this.scene.localPlayer.sprite.x,
            y: this.scene.localPlayer.sprite.y - 20,
            loop: true
        });

        this.timerEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: CONFIG.VERIFICATION_DURATION * 10 - 1,
            callback: () => this.tickVerification()
        });
    }

    tickVerification() {
        this.verificationTimer -= 100;

        const progress = 1 - (this.verificationTimer / (CONFIG.VERIFICATION_DURATION * 1000));
        this.updateProgressBar(progress);

        if (this.verificationTimer <= 0) {
            this.completeVerification();
        }
    }

    interruptVerification() {
        if (!this.isVerifying) return;

        this.isVerifying = false;
        this.verificationTimer = 0;

        if (this.timerEvent) this.timerEvent.remove();
        this.destroyProgressBar();

        gameEvents.emit('vfx:stop', { key: 'vfx_sparkle_play' });
        gameEvents.emit('chat:systemMessage', {
            content: 'Verification interrupted! Stay at the podium.'
        });
    }

    completeVerification() {
        this.isVerifying = false;
        this.destroyProgressBar();

        gameEvents.emit('vfx:stop', { key: 'vfx_sparkle_play' });

        gameEvents.emit('network:send', {
            type: 'VERIFICATION_COMPLETE',
            playerAId: this.scene.localPlayerId,
            playerBId: this.verificationPartner
        });
    }

    createProgressBar() {
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.height - 100;

        this.progressBg = this.scene.add.rectangle(x, y, 200, 16, 0x0F3460);
        this.progressBg.setScrollFactor(0).setDepth(300);

        this.progressFill = this.scene.add.rectangle(x - 98, y, 0, 12, 0x27AE60);
        this.progressFill.setOrigin(0, 0.5).setScrollFactor(0).setDepth(301);

        this.progressText = this.scene.add.text(x, y - 16, 'VERIFYING...', {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            color: '#E8D5A3'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    }

    updateProgressBar(progress) {
        if (this.progressFill) {
            this.progressFill.width = 196 * progress;
        }
    }

    destroyProgressBar() {
        if (this.progressBg) this.progressBg.destroy();
        if (this.progressFill) this.progressFill.destroy();
        if (this.progressText) this.progressText.destroy();
    }

    destroy() {
        if (this.timerEvent) this.timerEvent.remove();
        this.destroyProgressBar();
    }
}
