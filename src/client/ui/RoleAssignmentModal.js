import { COLORS, ROLES } from '../utils/Constants.js';

export class RoleAssignmentModal {
    constructor(scene, roleData) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(500);

        // Dim overlay
        this.dimOverlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

        const isSurvivor = roleData.role === ROLES.SURVIVOR;
        const roleColorNum = isSurvivor ? 0x15803D : 0xDC2626;
        const roleColorHex = isSurvivor ? '#4ADE80' : '#F87171';

        // Modal Box Card (Warm Espresso Walnut)
        this.box = scene.add.rectangle(width / 2, height / 2, 400, 230, 0x181311, 0.98);
        this.box.setStrokeStyle(2, roleColorNum, 1);

        // Header
        this.title = scene.add.text(width / 2, height / 2 - 82, 'ROLE ASSIGNMENT', {
            fontFamily: 'Dogica, monospace',
            fontSize: '9px',
            color: '#F59E0B',
            letterSpacing: 1.5
        }).setOrigin(0.5);

        // Role Name
        this.roleName = scene.add.text(width / 2, height / 2 - 40, roleData.role, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '18px',
            color: roleColorHex,
            letterSpacing: 1.5
        }).setOrigin(0.5);

        // Description
        const descText = isSurvivor
            ? 'Find authentic MIL fragments in the village,\nverify them in the Library, and solve the mystery.'
            : 'Plant fabricated fragments, sabotage buildings,\nand deceive the survivors to take over Dusk Village.';

        this.description = scene.add.text(width / 2, height / 2 + 15, descText, {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: '#FDFBF7',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Understood Button (2-second delay)
        this.btn = scene.add.text(width / 2, height / 2 + 75, 'READING (2s)', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#A89F91',
            backgroundColor: '#231E1B',
            padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5);

        this.contentGroup = scene.add.container(0, 0, [this.box, this.title, this.roleName, this.description, this.btn]);
        
        // Initial state for animation
        this.dimOverlay.alpha = 0;
        this.contentGroup.alpha = 0;
        this.contentGroup.setScale(0.9);

        this.container.add([this.dimOverlay, this.contentGroup]);

        // Intro Animation
        scene.tweens.add({
            targets: this.dimOverlay,
            alpha: 0.8,
            duration: 300
        });
        scene.tweens.add({
            targets: this.contentGroup,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });

        // 2-second countdown before click enabled
        scene.time.delayedCall(2000, () => {
            this.btn.setText('PROCEED');
            this.btn.setColor('#FFFFFF');
            this.btn.setBackgroundColor(isSurvivor ? '#15803D' : '#DC2626');
            this.btn.setInteractive({ useHandCursor: true });
            
            this.btn.on('pointerdown', () => this.destroy());
        });
    }

    destroy() {
        this.container.destroy();
    }
}
