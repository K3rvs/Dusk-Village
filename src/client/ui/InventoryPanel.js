import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class InventoryPanel {
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.cameras.main;

        this.panelW = 230;
        this.panelH = 98;
        this.hasFragment = false;
        this.heldFragmentData = null;

        this.container = scene.add.container(width - 16 - this.panelW, height - this.panelH - 16);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Warm Espresso Walnut Glass Panel
        this.bg = scene.add.rectangle(0, 0, this.panelW, this.panelH, 0x140F14, 0.95).setOrigin(0, 0);
        this.bg.setStrokeStyle(1.8, 0x785338, 0.9);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, this.panelW, 22, 0x231E1B, 0.95).setOrigin(0, 0);
        this.headerBorder = scene.add.rectangle(0, 22, this.panelW, 1, 0xD97706, 0.7).setOrigin(0, 0);
        
        this.headerText = scene.add.text(10, 11, 'HELD DOCUMENT', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7.5px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        // Item Slot Card Box (Interactive)
        this.slotCard = scene.add.rectangle(8, 28, this.panelW - 16, 62, 0x1A141A, 0.92).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        this.slotCard.setStrokeStyle(1.2, 0x3D322A, 0.85);

        // Empty Slot Elements
        this.emptyText = scene.add.text(this.panelW / 2, 58, '[ EMPTY HANDS ]\nSearch for village clues', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#78716C',
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5, 0.5);

        // Active Item Elements
        this.itemIconBg = scene.add.rectangle(26, 58, 26, 26, 0x140F14, 1).setVisible(false);
        this.itemIconBg.setStrokeStyle(1, 0xF59E0B, 0.8);

        this.fragIcon = scene.add.sprite(26, 58, 'memory_fragments', 0).setScale(1.4).setVisible(false);

        this.statusBadge = scene.add.text(46, 40, '[ UNVERIFIED 🔍 ]', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '6.5px',
            color: '#F59E0B',
            backgroundColor: '#451A03',
            padding: { left: 4, right: 4, top: 2, bottom: 2 }
        }).setOrigin(0, 0.5).setVisible(false);

        this.titleText = scene.add.text(46, 56, 'A mysterious document', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7.5px',
            color: '#FFF8EE'
        }).setOrigin(0, 0.5).setVisible(false);

        this.actionHint = scene.add.text(46, 72, 'Click to Inspect / [Q] Drop', {
            fontFamily: 'Dogica, monospace',
            fontSize: '6px',
            color: '#D4C3B3'
        }).setOrigin(0, 0.5).setVisible(false);

        this.container.add([
            this.bg,
            this.header,
            this.headerBorder,
            this.headerText,
            this.slotCard,
            this.emptyText,
            this.itemIconBg,
            this.fragIcon,
            this.statusBadge,
            this.titleText,
            this.actionHint
        ]);

        this.slotCard.on('pointerover', () => {
            if (this.hasFragment) this.slotCard.setFillStyle(0x281F28, 0.98);
        });

        this.slotCard.on('pointerout', () => {
            this.slotCard.setFillStyle(0x1A141A, 0.92);
        });

        this.slotCard.on('pointerdown', () => {
            if (this.hasFragment && this.heldFragmentData) {
                if (this.scene.showDocumentInspectionModal) {
                    this.scene.showDocumentInspectionModal(this.heldFragmentData);
                }
            }
        });

        this.setupEventListeners();
    }

    onResize(width, height) {
        this.container.setPosition(width - 16 - this.panelW, height - this.panelH - 16);
    }

    setupEventListeners() {
        gameEvents.on('inventory:updated', (data) => {
            if (data.fragment) {
                this.hasFragment = true;
                this.heldFragmentData = data.fragment;
                const frag = data.fragment;

                this.emptyText.setVisible(false);
                this.itemIconBg.setVisible(true);
                this.fragIcon.setVisible(true);
                this.statusBadge.setVisible(true);
                this.titleText.setVisible(true);
                this.actionHint.setVisible(true);

                let displayName = frag.isVerified ? frag.title : (frag.objectName || frag.title);
                if (displayName.length > 18) displayName = displayName.substring(0, 17) + '…';
                this.titleText.setText(displayName);

                if (!frag.isVerified) {
                    this.statusBadge.setText('[ UNVERIFIED 🔍 ]');
                    this.statusBadge.setColor('#F59E0B');
                    this.statusBadge.setBackgroundColor('#451A03');
                    this.actionHint.setText('Click to Inspect / Drop [Q]');
                    this.actionHint.setColor('#F59E0B');
                    this.bg.setStrokeStyle(1.8, 0xF59E0B, 0.9);
                } else if (frag.isAuthentic) {
                    this.statusBadge.setText(`[ ${frag.type} AUTHENTIC ✓ ]`);
                    this.statusBadge.setColor('#4ADE80');
                    this.statusBadge.setBackgroundColor('#064E3B');
                    this.actionHint.setText('Click to Inspect / File [E]');
                    this.actionHint.setColor('#4ADE80');
                    this.bg.setStrokeStyle(1.8, 0x10B981, 0.95);
                } else {
                    this.statusBadge.setText('[ IRRELEVANT ✗ ]');
                    this.statusBadge.setColor('#F87171');
                    this.statusBadge.setBackgroundColor('#450A0A');
                    this.actionHint.setText('Click to Inspect / Drop [Q]');
                    this.actionHint.setColor('#EF4444');
                    this.bg.setStrokeStyle(1.8, 0xEF4444, 0.9);
                }
            } else {
                this.hasFragment = false;
                this.heldFragmentData = null;
                this.emptyText.setVisible(true);
                this.itemIconBg.setVisible(false);
                this.fragIcon.setVisible(false);
                this.statusBadge.setVisible(false);
                this.titleText.setVisible(false);
                this.actionHint.setVisible(false);
                this.bg.setStrokeStyle(1.8, 0x785338, 0.9);
            }
        });
    }

    destroy() {
        this.container.destroy();
    }
}
