import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class MysteryStatusPanel {
    constructor(scene) {
        this.scene = scene;
        const width = scene.cameras.main.width;

        this.panelW = 210;
        this.panelH = 150;

        this.container = scene.add.container(width - 16 - this.panelW, 56);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Warm Espresso Walnut Glass Panel (Interactive)
        this.bg = scene.add.rectangle(0, 0, this.panelW, this.panelH, 0x140F14, 0.95).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        this.bg.setStrokeStyle(1.8, 0x785338, 0.9);

        // Header Title Bar
        this.header = scene.add.rectangle(0, 0, this.panelW, 26, 0x231E1B, 0.95).setOrigin(0, 0);
        this.headerBorder = scene.add.rectangle(0, 26, this.panelW, 1, 0xD97706, 0.7).setOrigin(0, 0);
        this.titleText = scene.add.text(10, 13, 'VILLAGE ARCHIVE', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        this.progressBadge = scene.add.text(this.panelW - 10, 13, '0/3', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#E5B869'
        }).setOrigin(1, 0.5);

        this.container.add([this.bg, this.header, this.headerBorder, this.titleText, this.progressBadge]);

        // 3 Clue Types: CLAIM, CONTEXT, SOURCE
        const fragmentTypes = [
            { key: 'CLAIM', label: '1. CLAIM' },
            { key: 'CONTEXT', label: '2. CONTEXT' },
            { key: 'SOURCE', label: '3. SOURCE' }
        ];

        this.fragmentRows = {};
        this.currentStage = 1;
        this.deliveredCount = 0;

        fragmentTypes.forEach((item, index) => {
            const y = 32 + index * 38;
            const rowBg = scene.add.rectangle(6, y, this.panelW - 12, 34, 0x1A141A, 0.92).setOrigin(0, 0);
            rowBg.setStrokeStyle(1, 0x3D322A, 0.85);

            const labelText = scene.add.text(12, y + 17, item.label, {
                fontFamily: 'DogicaBold, Dogica, monospace',
                fontSize: '7px',
                color: '#FFF8EE',
                letterSpacing: 0.5
            }).setOrigin(0, 0.5);

            const statusBg = scene.add.rectangle(this.panelW - 48, y + 17, 72, 20, 0x231E1B, 0.95);
            statusBg.setStrokeStyle(1, 0x574438, 0.8);

            const defaultStatus = index === 0 ? 'ACTIVE 🔍' : 'LOCKED 🔒';
            const defaultColor = index === 0 ? '#F59E0B' : '#78716C';

            const statusText = scene.add.text(this.panelW - 48, y + 17, defaultStatus, {
                fontFamily: 'Dogica, monospace',
                fontSize: '6.5px',
                color: defaultColor,
                letterSpacing: 0.5
            }).setOrigin(0.5, 0.5);

            this.container.add([rowBg, labelText, statusBg, statusText]);
            this.fragmentRows[item.key] = { rowBg, statusBg, statusText, labelText };
        });

        // Click on panel opens mystery modal
        this.bg.on('pointerdown', () => {
            gameEvents.emit('interaction:trigger', { action: 'SOLVE_MYSTERY' });
        });

        this.bg.on('pointerover', () => this.bg.setStrokeStyle(1.8, 0xF59E0B, 1));
        this.bg.on('pointerout', () => this.bg.setStrokeStyle(1.8, 0x785338, 0.9));

        this.setupEventListeners();
    }

    onResize(width, height) {
        this.container.setPosition(width - 16 - this.panelW, 56);
    }

    setupEventListeners() {
        gameEvents.on('mystery:stageUpdated', (data) => {
            this.currentStage = data.stage || 1;
            this.updateStageRows(data.delivered || {});
        });

        gameEvents.on('fragment:deliveredSuccess', (data) => {
            if (data.delivered) {
                this.updateStageRows(data.delivered);
            }
        });
    }

    updateStageRows(delivered) {
        let count = 0;
        const stages = ['CLAIM', 'CONTEXT', 'SOURCE'];

        stages.forEach((stageKey, idx) => {
            const row = this.fragmentRows[stageKey];
            if (!row) return;

            const isDelivered = !!delivered[stageKey];
            if (isDelivered) {
                count++;
                row.statusBg.setFillStyle(0x064E3B, 0.95);
                row.statusBg.setStrokeStyle(1.2, 0x10B981, 1);
                row.statusText.setText('FILED ✓');
                row.statusText.setColor('#4ADE80');
                row.rowBg.setStrokeStyle(1.2, 0x10B981, 0.8);
            } else if (idx + 1 === this.currentStage) {
                row.statusBg.setFillStyle(0x451A03, 0.95);
                row.statusBg.setStrokeStyle(1.2, 0xF59E0B, 1);
                row.statusText.setText('ACTIVE 🔍');
                row.statusText.setColor('#F59E0B');
                row.rowBg.setStrokeStyle(1.2, 0xF59E0B, 0.8);
            } else {
                row.statusBg.setFillStyle(0x181311, 0.9);
                row.statusBg.setStrokeStyle(1, 0x3D322A, 0.6);
                row.statusText.setText('LOCKED 🔒');
                row.statusText.setColor('#78716C');
                row.rowBg.setStrokeStyle(1, 0x3D322A, 0.6);
            }
        });

        this.deliveredCount = count;
        this.progressBadge.setText(`${count}/3`);
        this.progressBadge.setColor(count >= 3 ? '#4ADE80' : '#E5B869');
    }

    destroy() {
        this.container.destroy();
    }
}
