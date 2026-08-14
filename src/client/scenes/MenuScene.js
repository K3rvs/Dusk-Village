import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Cinematic Dusk Twilight Sunset & Village Skyline Backdrop
        if (this.textures.exists('bg_menu_dusk')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_menu_dusk');
            bg.setDisplaySize(width, height);
            bg.setDepth(0);
        } else {
            this.createFallbackGradient(width, height);
        }

        // 2. Dynamic Floating Amber Embers & Firefly Sparks
        this.createAmbientEmbers(width, height);

        // 3. Main Title Header (Larger, High-Contrast, Majestic)
        const titleContainer = this.add.container(width / 2, height * 0.20).setDepth(20);

        const tag = this.add.text(0, -42, 'UNESCO MIL MYSTERY EDITION', {
            fontFamily: 'Dogica, monospace',
            fontSize: '11px',
            color: '#F59E0B',
            letterSpacing: 2
        }).setOrigin(0.5);

        const title = this.add.text(0, 6, 'DUSK VILLAGE', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '44px',
            color: '#FFFDF7',
            letterSpacing: 3,
            shadow: { offsetX: 0, offsetY: 4, color: '#D97706', blur: 20, fill: true }
        }).setOrigin(0.5);

        const subtitle = this.add.text(0, 52, 'A 10-Player Social Deduction & Information Verification Game', {
            fontFamily: 'Dogica, monospace',
            fontSize: '10.5px',
            color: '#E2D5C3',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        titleContainer.add([tag, title, subtitle]);

        // 4. High-Contrast, Crystal-Clear Frosted Glass Action Buttons
        const buttonDefs = [
            { text: 'CUSTOM ROOM (BOTS)', icon: '🤖', action: () => this.connectAndJoin('CREATE_CUSTOM_ROOM') },
            { text: 'CREATE ROOM', icon: '👑', action: () => this.connectAndJoin('CREATE_ROOM') },
            { text: 'JOIN ROOM', icon: '🎮', action: () => {
                const code = prompt('Enter 6-Letter Room Code:');
                if (code && code.trim()) {
                    this.connectAndJoin('JOIN_ROOM', code.trim().toUpperCase());
                }
            }},
            { text: 'SETTINGS', icon: '⚙️', action: () => {} }
        ];

        const startY = height * 0.44;
        const spacingY = 58;

        buttonDefs.forEach((def, index) => {
            this.createRefinedButton(width / 2, startY + index * spacingY, def);
        });

        // 5. Version Badge (Bottom Right)
        this.add.text(width - 18, height - 16, 'v1.0.0 • UNESCO MIL', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8.5px',
            color: '#D4C3B3'
        }).setOrigin(1, 1).setDepth(20);
    }

    createFallbackGradient(width, height) {
        const canvas = this.textures.createCanvas('menu_fallback_bg', width, height);
        const ctx = canvas.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0.00, '#090E1F');
        grad.addColorStop(0.35, '#131C38');
        grad.addColorStop(0.65, '#2D344B');
        grad.addColorStop(0.85, '#684554');
        grad.addColorStop(1.00, '#EAA175');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        canvas.refresh();
        this.add.image(width / 2, height / 2, 'menu_fallback_bg').setDepth(0);
    }

    createAmbientEmbers(width, height) {
        this.embers = [];
        const emberColors = [0xF59E0B, 0xFCD34D, 0xFB923C, 0xFBBF24, 0xFEF3C7];

        for (let i = 0; i < 45; i++) {
            const size = Phaser.Math.FloatBetween(1.2, 3.2);
            const color = Phaser.Utils.Array.GetRandom(emberColors);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.85);

            const p = this.add.circle(
                Phaser.Math.Between(10, width - 10),
                Phaser.Math.Between(20, height + 30),
                size,
                color,
                alpha
            ).setDepth(5);

            this.embers.push({
                shape: p,
                speedY: Phaser.Math.FloatBetween(-0.25, -0.65),
                swaySpeed: Phaser.Math.FloatBetween(0.002, 0.005),
                baseX: p.x,
                offset: Phaser.Math.FloatBetween(0, 100)
            });
        }
    }

    createRefinedButton(x, y, def) {
        const btnContainer = this.add.container(x, y).setDepth(25);

        const btnW = 350;
        const btnH = 48;

        // High-Contrast Solid-Frosted Dark Glass Backdrop
        const cardBg = this.add.rectangle(0, 0, btnW, btnH, 0x140F14, 0.92);
        cardBg.setStrokeStyle(1.8, 0xF59E0B, 0.85);
        cardBg.setInteractive({ useHandCursor: true });

        // Left Icon
        const iconText = this.add.text(-btnW / 2 + 22, 0, def.icon, {
            fontSize: '16px'
        }).setOrigin(0, 0.5);

        // Label Text (High Contrast Pure White Dogica)
        const labelText = this.add.text(-btnW / 2 + 54, 0, def.text, {
            fontFamily: 'Dogica, monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        // Right Arrow (Vibrant Amber Gold)
        const arrow = this.add.text(btnW / 2 - 22, 0, '→', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '14px',
            color: '#F59E0B'
        }).setOrigin(1, 0.5).setAlpha(0.9);

        btnContainer.add([cardBg, iconText, labelText, arrow]);

        // Interactive hover polish
        cardBg.on('pointerover', () => {
            cardBg.setStrokeStyle(2, 0xFBBF24, 1);
            cardBg.setFillStyle(0x2A1B24, 0.98);
            labelText.setColor('#FDF0D5');
            arrow.setAlpha(1);
            arrow.setX(btnW / 2 - 18);
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 120,
                ease: 'Power1'
            });
        });

        cardBg.on('pointerout', () => {
            cardBg.setStrokeStyle(1.8, 0xF59E0B, 0.85);
            cardBg.setFillStyle(0x140F14, 0.92);
            labelText.setColor('#FFFFFF');
            arrow.setAlpha(0.9);
            arrow.setX(btnW / 2 - 22);
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 120,
                ease: 'Power1'
            });
        });

        cardBg.on('pointerdown', () => {
            if (this.sound.get('sfx_button_click')) {
                this.sound.play('sfx_button_click', { volume: 0.5 });
            }
            def.action();
        });
    }

    connectAndJoin(actionType, roomCode = null) {
        const playerName = 'Player_' + Math.floor(Math.random() * 1000);

        const doSend = () => {
            if (actionType === 'CREATE_ROOM' || actionType === 'CREATE_CUSTOM_ROOM') {
                window.socketClient.send({ type: actionType, playerName });
                this.scene.start('LobbyScene', { isHost: true, isCustom: actionType === 'CREATE_CUSTOM_ROOM' });
            } else if (actionType === 'JOIN_ROOM') {
                window.socketClient.send({ type: 'JOIN_ROOM', playerName, roomCode });
                this.scene.start('LobbyScene', { isHost: false, isCustom: false });
            }
        };

        if (window.socketClient.isConnected) {
            doSend();
        } else {
            import('../utils/EventBus.js').then(({ gameEvents }) => {
                gameEvents.once('network:connected', () => {
                    doSend();
                });
                window.socketClient.connect();
            });
        }
    }

    update(time) {
        if (this.embers) {
            const height = this.cameras.main.height;
            const width = this.cameras.main.width;

            this.embers.forEach(p => {
                p.shape.y += p.speedY;
                p.shape.x = p.baseX + Math.sin(time * p.swaySpeed + p.offset) * 10;

                if (p.shape.y < -15) {
                    p.shape.y = height + 15;
                    p.baseX = Phaser.Math.Between(10, width - 10);
                    p.shape.x = p.baseX;
                }
            });
        }
    }
}
