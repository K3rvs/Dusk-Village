import { TopBar } from './TopBar.js';
import { PlayerListPanel } from './PlayerListPanel.js';
import { MysteryStatusPanel } from './MysteryStatusPanel.js';
import { ChatBox } from './ChatBox.js';
import { InventoryPanel } from './InventoryPanel.js';
import { gameEvents } from '../utils/EventBus.js';

export class HUDManager {
    constructor(scene) {
        this.scene = scene;

        // Create all HUD components
        this.topBar = new TopBar(scene);
        this.playerList = new PlayerListPanel(scene);
        this.mysteryStatus = new MysteryStatusPanel(scene);
        this.chatBox = new ChatBox(scene);
        this.inventory = new InventoryPanel(scene);

        // Responsive resize listener
        this.scene.scale.on('resize', (gameSize) => {
            const width = gameSize.width;
            const height = gameSize.height;
            this.onResize(width, height);
        });

        // Keybind controls
        if (this.scene.input && this.scene.input.keyboard) {
            this.tabKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
            this.tabKey.on('down', (event) => {
                if (event) event.preventDefault();
                if (this.playerList) this.playerList.toggleCollapse();
            });

            this.mKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
            this.mKey.on('down', () => {
                gameEvents.emit('interaction:trigger', { action: 'SOLVE_MYSTERY' });
            });

            this.cKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
            this.cKey.on('down', () => {
                if (this.chatBox) this.chatBox.toggleCollapse();
            });
        }

        this.setupEventListeners();
    }

    onResize(width, height) {
        if (this.topBar) this.topBar.onResize(width, height);
        if (this.playerList) this.playerList.onResize(width, height);
        if (this.mysteryStatus) this.mysteryStatus.onResize(width, height);
        if (this.chatBox) this.chatBox.onResize(width, height);
        if (this.inventory) this.inventory.onResize(width, height);
    }

    setupEventListeners() {
        gameEvents.on('hud:announcement', (data) => {
            this.showAnnouncement(data.text, data.color);
        });
    }

    showAnnouncement(text, colorStr = '#F59E0B') {
        const width = this.scene.cameras.main.width;
        
        // Clean up any existing active announcement container & tweens
        if (this.activeAnnouncementContainer) {
            this.activeAnnouncementContainer.destroy();
            this.activeAnnouncementContainer = null;
        }

        let colorNum = 0xF59E0B;
        if (colorStr && colorStr.startsWith('#')) {
            colorNum = parseInt(colorStr.replace('#', ''), 16);
        }

        const isDanger = colorStr === '#EF4444' || colorStr === '#DC2626' || text.toLowerCase().includes('lock') || text.toLowerCase().includes('evict');
        const tag = isDanger ? '[ ALERT ]' : text.toLowerCase().includes('verified') ? '[ VERIFIED ]' : '[ NOTICE ]';

        // Strip any unicode emojis from text if passed
        const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}|[\u{1F300}-\u{1F5FF}|[\u{1F680}-\u{1F6FF}|[\u{1F700}-\u{1F77F}|[\u{1F780}-\u{1F7FF}|[\u{1F800}-\u{1F8FF}|[\u{1F900}-\u{1F9FF}|[\u{1FA00}-\u{1FA6F}|[\u{1FA70}-\u{1FAFF}|[\u{2600}-\u{26FF}|[\u{2700}-\u{27BF}]/gu, '').trim();

        const toastW = Math.min(500, Math.max(260, cleanText.length * 8.5 + 80));
        const toastH = 38;
        const toastY = 86;

        const container = this.scene.add.container(width / 2, toastY - 16).setDepth(800).setScrollFactor(0);
        this.activeAnnouncementContainer = container;

        const toastBg = this.scene.add.rectangle(0, 0, toastW, toastH, 0x140F14, 0.96);
        toastBg.setStrokeStyle(1.6, colorNum, 0.95);

        const tagLabel = this.scene.add.text(-toastW / 2 + 12, 0, tag, {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: isDanger ? '#F87171' : '#F59E0B'
        }).setOrigin(0, 0.5);

        const toastText = this.scene.add.text(12, 0, cleanText.toUpperCase(), {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: colorStr || '#FDFBF7',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        // Progress decay bar
        const progressBar = this.scene.add.rectangle(0, toastH / 2 - 2, toastW - 4, 2, colorNum, 0.85);

        container.add([toastBg, progressBar, tagLabel, toastText]);
        container.setAlpha(0);

        // Slide down + Fade in
        this.scene.tweens.add({
            targets: container,
            y: toastY,
            alpha: 1,
            duration: 200,
            ease: 'Power2.out'
        });

        // Decay bar tween
        this.scene.tweens.add({
            targets: progressBar,
            scaleX: 0,
            duration: 3000,
            ease: 'Linear'
        });

        // Slide up + Fade out
        this.scene.tweens.add({
            targets: container,
            y: toastY - 16,
            alpha: 0,
            delay: 3000,
            duration: 300,
            ease: 'Power2.in',
            onComplete: () => {
                if (this.activeAnnouncementContainer === container) {
                    this.activeAnnouncementContainer = null;
                }
                container.destroy();
            }
        });
    }

    update() {
        // Update components that need per-frame updates
    }

    destroy() {
        this.topBar.destroy();
        this.playerList.destroy();
        this.mysteryStatus.destroy();
        this.chatBox.destroy();
        this.inventory.destroy();
    }
}
