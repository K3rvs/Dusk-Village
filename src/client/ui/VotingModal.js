import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class VotingModal {
    constructor(scene, voteData) {
        this.scene = scene;
        const camW = scene.cameras.main.width;
        const camH = scene.cameras.main.height;
        const centerX = camW / 2;
        const centerY = camH / 2;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        // Dim overlay
        this.dimOverlay = scene.add.rectangle(centerX, centerY, camW * 2, camH * 2, 0x000000, 0.75);

        // Modal Box (Warm Espresso Walnut)
        const modalW = 320;
        const modalH = 190;
        this.box = scene.add.rectangle(centerX, centerY, modalW, modalH, 0x181311, 0.98);
        this.box.setStrokeStyle(2, 0xF59E0B, 1);

        // Header Title
        this.title = scene.add.text(centerX, centerY - 65, `COUNCIL VOTE: BANISH ${voteData.nominatedPlayerName || 'VILLAGER'}?`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#F59E0B',
            align: 'center',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        // BAN Button (Danger Red)
        this.banBtn = scene.add.text(centerX - 65, centerY + 30, 'BAN (GUILTY)', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#FFFFFF',
            backgroundColor: '#DC2626',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // FORGIVE Button (Ghost Neutral)
        this.forgiveBtn = scene.add.text(centerX + 65, centerY + 30, 'FORGIVE (SKIP)', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#FDFBF7',
            backgroundColor: '#374151',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.banBtn.on('pointerdown', () => {
            gameEvents.emit('vote:cast', { choice: 'BAN' });
            this.onVoteCast('BAN');
        });

        this.forgiveBtn.on('pointerdown', () => {
            gameEvents.emit('vote:cast', { choice: 'FORGIVE' });
            this.onVoteCast('FORGIVE');
        });

        // Status Text
        this.statusText = scene.add.text(centerX, centerY + 65, 'Cast your council vote...', {
            fontFamily: 'Dogica, monospace',
            fontSize: '6.5px',
            color: '#A89F91'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.box, this.title, this.banBtn, this.forgiveBtn, this.statusText]);
    }

    onVoteCast(choice) {
        this.banBtn.removeInteractive();
        this.forgiveBtn.removeInteractive();
        this.banBtn.setAlpha(0.4);
        this.forgiveBtn.setAlpha(0.4);
        this.statusText.setText(`You voted: ${choice}`);
        this.statusText.setColor('#4ADE80');
    }

    destroy() {
        this.container.destroy();
    }
}
