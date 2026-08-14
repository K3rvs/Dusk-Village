import { COLORS } from '../utils/Constants.js';

export class SolveMysteryModal {
    constructor(scene, mysteryData) {
        this.scene = scene;
        const camW = scene.cameras.main.width;
        const camH = scene.cameras.main.height;
        const centerX = camW / 2;
        const centerY = camH / 2;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        // 1. Dark Backdrop Dimmer
        this.dimOverlay = scene.add.rectangle(centerX, centerY, camW * 2, camH * 2, 0x000000, 0.75);

        // 2. Modal Box Card (Warm Espresso Walnut)
        const modalW = 340;
        const modalH = 220;
        this.box = scene.add.rectangle(centerX, centerY, modalW, modalH, 0x181311, 0.98);
        this.box.setStrokeStyle(2, 0xF59E0B, 1);

        // Header Title
        this.title = scene.add.text(centerX, centerY - 84, 'SOLVE THE MYSTERY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.mysteryTitle = scene.add.text(centerX, centerY - 62, `"${mysteryData.title || 'Village Mystery'}"`, {
            fontFamily: 'Dogica, monospace',
            fontSize: '8.5px',
            color: '#E5B869'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.box, this.title, this.mysteryTitle]);

        // 3. 3 Clue Slots: CLAIM, CONTEXT, SOURCE
        const slots = ['CLAIM', 'CONTEXT', 'SOURCE'];
        this.slots = {};
        this.selectedFragments = { CLAIM: null, CONTEXT: null, SOURCE: null };

        slots.forEach((type, index) => {
            const x = centerX - 96 + index * 96;
            const y = centerY - 2;

            const slotBg = scene.add.rectangle(x, y, 84, 80, 0x231E1B, 0.95);
            slotBg.setStrokeStyle(1.5, 0x785338, 0.9);

            const slotLabel = scene.add.text(x, y - 26, type, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7.5px',
                color: '#F59E0B',
                letterSpacing: 0.5
            }).setOrigin(0.5);

            const slotContent = scene.add.text(x, y + 4, '[ EMPTY ]', {
                fontFamily: 'Dogica, monospace',
                fontSize: '6.5px',
                color: '#A89F91',
                align: 'center',
                wordWrap: { width: 76 }
            }).setOrigin(0.5);

            this.container.add([slotBg, slotLabel, slotContent]);
            this.slots[type] = { slotBg, slotContent };
        });

        // Populate slots if local player has verified fragments
        this.populateFragments();

        // 4. Buttons
        this.submitBtn = scene.add.text(centerX - 60, centerY + 78, 'SUBMIT SOLVE', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: '#FFFFFF',
            backgroundColor: '#15803D',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.cancelBtn = scene.add.text(centerX + 60, centerY + 78, 'CANCEL', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: '#FDFBF7',
            backgroundColor: '#374151',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.submitBtn.on('pointerdown', () => this.submitSolve());
        this.cancelBtn.on('pointerdown', () => this.destroy());

        this.container.add([this.submitBtn, this.cancelBtn]);
    }

    populateFragments() {
        if (!this.scene.fragmentManager) return;
        
        const localFrag = this.scene.fragmentManager.heldFragments.get(this.scene.localPlayerId);
        if (localFrag && this.slots[localFrag.type]) {
            const slot = this.slots[localFrag.type];
            slot.slotContent.setText(localFrag.title || 'Verified Clue');
            slot.slotContent.setColor('#4ADE80');
            slot.slotBg.setStrokeStyle(1.5, 0x15803D, 1);
            this.selectedFragments[localFrag.type] = localFrag.id;
        }
    }

    submitSolve() {
        if (window.socketClient) {
            window.socketClient.send({
                type: 'SOLVE_ATTEMPT',
                fragments: this.selectedFragments
            });
        }
        this.destroy();
    }

    destroy() {
        this.container.destroy();
    }
}
