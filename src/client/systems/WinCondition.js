import { gameEvents } from '../utils/EventBus.js';

export class WinCondition {
    constructor(scene) {
        this.scene = scene;

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('game:overReceived', (data) => {
            this.handleGameOver(data);
        });
    }

    handleGameOver(data) {
        this.scene.scene.start('GameOverScene', {
            winner: data.winner,
            reason: data.reason,
            roleReveal: data.roleReveal,
            mysteryResult: data.mysteryResult,
            localPlayerRole: this.scene.localPlayerRole
        });
    }

    destroy() {
        // Cleanup
    }
}
