import { COLORS } from '../utils/Constants.js';

export class LibraryCapacityModal {
    constructor(scene, occupants) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        this.box = scene.add.rectangle(width / 2, height / 2, 300, 180, COLORS.MIDNIGHT_PANEL);
        this.box.setStrokeStyle(3, COLORS.ALERT_RED);

        this.title = scene.add.text(width / 2, height / 2 - 60, '! LIBRARY FULL (2/2)', {
            fontFamily: 'Silkscreen',
            fontSize: '14px',
            color: '#C0392B'
        }).setOrigin(0.5);

        const occupantNames = occupants.map(o => `• ${o.name}`).join('\n');
        this.body = scene.add.text(width / 2, height / 2 - 10, `Current Occupants:\n${occupantNames}\n\nWait for a slot to open.`, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '12px',
            color: '#E8D5A3',
            align: 'center'
        }).setOrigin(0.5);

        this.btn = scene.add.text(width / 2, height / 2 + 55, 'OK', {
            fontFamily: 'Silkscreen',
            fontSize: '12px',
            color: '#F5F0E1',
            backgroundColor: '#0F3460',
            padding: { left: 24, right: 24, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.btn.on('pointerdown', () => this.destroy());

        this.container.add([this.dimOverlay, this.box, this.title, this.body, this.btn]);
    }

    destroy() {
        this.container.destroy();
    }
}
