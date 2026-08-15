import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class TopBar {
    constructor(scene) {
        this.scene = scene;
        const width = scene.cameras.main.width;

        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(600);

        // Topbar Backdrop Glass Panel (44px height) - Warm Espresso Walnut Slate
        this.bg = scene.add.rectangle(width / 2, 22, width, 44, 0x181311, 0.95);
        this.border = scene.add.rectangle(width / 2, 44, width, 1.5, 0x785338, 0.85);
        this.glowLine = scene.add.rectangle(width / 2, 44, width * 0.4, 2, 0xD97706, 0.9);

        // 1. Left Phase Pill Badge
        this.phasePillW = 164;
        this.phasePillH = 28;
        this.phasePillBg = scene.add.rectangle(16 + this.phasePillW / 2, 22, this.phasePillW, this.phasePillH, 0x231E1B, 0.95);
        this.phasePillBg.setStrokeStyle(1.5, 0x10B981, 0.9);

        this.phaseText = scene.add.text(16 + this.phasePillW / 2, 22, 'DAY PHASE', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#10B981',
            letterSpacing: 0.5
        }).setOrigin(0.5, 0.5);

        // 2. Center Chronometer Box
        this.timerBoxW = 100;
        this.timerBoxH = 28;
        this.timerBoxBg = scene.add.rectangle(width / 2, 22, this.timerBoxW, this.timerBoxH, 0x231E1B, 0.95);
        this.timerBoxBg.setStrokeStyle(1.5, 0x785338, 0.9);

        this.timerText = scene.add.text(width / 2, 22, '02:30', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#FDFBF7',
            letterSpacing: 1
        }).setOrigin(0.5, 0.5);

        // 3. Right Status Pill (Day Counter)
        this.dayPillW = 96;
        this.dayPillH = 28;
        this.dayPillBg = scene.add.rectangle(width - 16 - this.dayPillW / 2, 22, this.dayPillW, this.dayPillH, 0x231E1B, 0.95);
        this.dayPillBg.setStrokeStyle(1.5, 0x10B981, 0.9);

        this.dayText = scene.add.text(width - 16 - this.dayPillW / 2, 22, 'DAY 1', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#34D399',
            letterSpacing: 0.5
        }).setOrigin(0.5, 0.5);

        this.container.add([
            this.bg,
            this.border,
            this.glowLine,
            this.phasePillBg,
            this.phaseText,
            this.timerBoxBg,
            this.timerText,
            this.dayPillBg,
            this.dayText
        ]);

        this.setupEventListeners();
    }

    onResize(width, height) {
        this.bg.setPosition(width / 2, 22).setSize(width, 44);
        this.border.setPosition(width / 2, 44).setSize(width, 1.5);
        this.glowLine.setPosition(width / 2, 44).setSize(width * 0.4, 2);

        this.phasePillBg.setPosition(16 + this.phasePillW / 2, 22);
        this.phaseText.setPosition(16 + this.phasePillW / 2, 22);

        this.timerBoxBg.setPosition(width / 2, 22);
        this.timerText.setPosition(width / 2, 22);

        this.dayPillBg.setPosition(width - 16 - this.dayPillW / 2, 22);
        this.dayText.setPosition(width - 16 - this.dayPillW / 2, 22);
    }

    updatePhaseDisplay(phaseRaw, dayNumber = null) {
        if (dayNumber !== null && dayNumber !== undefined) {
            this.currentDayNumber = dayNumber;
        } else if (this.scene.gameScene && this.scene.gameScene.phaseManager) {
            this.currentDayNumber = this.scene.gameScene.phaseManager.dayNumber || 1;
        } else {
            this.currentDayNumber = this.currentDayNumber || 1;
        }

        const raw = phaseRaw ? String(phaseRaw).toUpperCase() : 'DAY_PHASE';
        let color = '#10B981';
        let strokeColor = 0x10B981;
        let displayPhase = 'DAY PHASE';

        if (raw.includes('NIGHT')) {
            color = '#A855F7';
            strokeColor = 0xA855F7;
            displayPhase = 'NIGHT PHASE';
            this.dayText.setText(`NIGHT ${this.currentDayNumber}`);
            this.dayText.setColor('#C084FC');
            this.dayPillBg.setStrokeStyle(1.5, 0xA855F7, 0.9);
        } else if (raw.includes('JUDGEMENT') || raw.includes('JUDGMENT')) {
            color = '#EF4444';
            strokeColor = 0xEF4444;
            displayPhase = 'JUDGEMENT PHASE';
            this.dayText.setText(`DAY ${this.currentDayNumber}`);
            this.dayText.setColor('#F87171');
            this.dayPillBg.setStrokeStyle(1.5, 0xEF4444, 0.9);
        } else if (raw.includes('INITIATION') || raw.includes('ROLE_ASSIGNMENT') || raw.includes('ROLE')) {
            color = '#38BDF8';
            strokeColor = 0x38BDF8;
            displayPhase = 'INITIATION PHASE';
            this.dayText.setText('INITIATION');
            this.dayText.setColor('#38BDF8');
            this.dayPillBg.setStrokeStyle(1.5, 0x38BDF8, 0.9);
        } else if (raw.includes('DAY')) {
            color = '#10B981';
            strokeColor = 0x10B981;
            displayPhase = 'DAY PHASE';
            this.dayText.setText(`DAY ${this.currentDayNumber}`);
            this.dayText.setColor('#34D399');
            this.dayPillBg.setStrokeStyle(1.5, 0x10B981, 0.9);
        }

        this.phaseText.setText(displayPhase);
        this.phaseText.setColor(color);
        this.phasePillBg.setStrokeStyle(1.5, strokeColor, 0.9);
        this.glowLine.setFillStyle(strokeColor, 0.9);
    }

    setupEventListeners() {
        this.currentDayNumber = 1;

        if (this.scene.gameScene && this.scene.gameScene.phaseManager) {
            const pm = this.scene.gameScene.phaseManager;
            this.currentDayNumber = pm.dayNumber || 1;
            this.updatePhaseDisplay(pm.currentPhase, this.currentDayNumber);
        }

        gameEvents.on('phase:changed', (data) => {
            const day = data.dayNumber || data.day || this.currentDayNumber;
            this.updatePhaseDisplay(data.to, day);
        });

        gameEvents.on('phase:serverChanged', (data) => {
            const day = data.dayNumber || data.day || this.currentDayNumber;
            this.updatePhaseDisplay(data.phase || data.to, day);
        });

        gameEvents.on('phase:timerTick', (data) => {
            this.timerText.setText(data.displayString || '00:00');
            const rem = data.remaining || 0;

            if (rem <= 10) {
                this.timerText.setColor('#EF4444');
                this.timerBoxBg.setStrokeStyle(2, 0xEF4444, 1);
            } else if (rem <= 30) {
                this.timerText.setColor('#F59E0B');
                this.timerBoxBg.setStrokeStyle(1.5, 0xF59E0B, 0.9);
            } else {
                this.timerText.setColor('#FDFBF7');
                this.timerBoxBg.setStrokeStyle(1.5, 0x785338, 0.9);
            }
        });
    }

    destroy() {
        this.container.destroy();
    }
}
