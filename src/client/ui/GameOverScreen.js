export class GameOverScreen {
    constructor(scene, resultData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        const titleText = resultData.winner === 'SURVIVORS' ? '★ VICTORY ★' : 'DEFEAT';
        const titleColor = resultData.winner === 'SURVIVORS' ? '#27AE60' : '#C0392B';

        this.title = scene.add.text(width / 2, height / 2 - 120, titleText, {
            fontFamily: 'Silkscreen',
            fontSize: '36px',
            color: titleColor
        }).setOrigin(0.5);

        this.subtitle = scene.add.text(width / 2, height / 2 - 70, `${resultData.winner} WIN`, {
            fontFamily: 'Silkscreen',
            fontSize: '20px',
            color: '#F5F0E1'
        }).setOrigin(0.5);

        this.reason = scene.add.text(width / 2, height / 2 - 40, resultData.reason, {
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            color: '#E8D5A3'
        }).setOrigin(0.5);

        this.container.add([this.dimOverlay, this.title, this.subtitle, this.reason]);
    }

    destroy() {
        this.container.destroy();
    }
}
