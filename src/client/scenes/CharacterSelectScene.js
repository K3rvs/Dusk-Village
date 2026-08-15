import Phaser from 'phaser';
import { CONFIG } from '../utils/Constants.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    init() {
        this.selectedAvatar = null;
        this.isConfirmed = false;
        this.timeRemaining = CONFIG.CHARACTER_SELECT_DURATION;
        this.setupNetwork();
    }

    setupNetwork() {
        import('../utils/EventBus.js').then(({ gameEvents }) => {
            gameEvents.off('phase:serverChanged');
            gameEvents.on('phase:serverChanged', (data) => {
                if (data.phase === 'ROLE_ASSIGNMENT') {
                    const roomData = window.socketClient ? window.socketClient.currentRoom : null;
                    this.scene.start('GameScene', {
                        mystery: data.mystery,
                        avatarId: this.selectedAvatar || '01',
                        playerId: roomData ? roomData.playerId : 'local_player',
                        players: roomData ? roomData.players : []
                    });
                }
            });
        });
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Cinematic Dusk Twilight Backdrop with Vignette
        if (this.textures.exists('bg_menu_dusk')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_menu_dusk');
            bg.setDisplaySize(width, height);
            bg.setDepth(0);

            // Dark vignette overlay
            this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1);
        } else {
            this.createFallbackGradient(width, height);
        }

        // 2. Dynamic Floating Amber Embers
        this.createAmbientEmbers(width, height);

        // 3. Header Title & Subtitle (Larger & Prominent)
        this.add.text(width / 2, 40, 'CHOOSE  YOUR  AVATAR', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '30px',
            color: '#FFF8EE',
            letterSpacing: 3,
            shadow: { offsetX: 0, offsetY: 3, color: '#D97706', blur: 20, fill: true }
        }).setOrigin(0.5).setDepth(10);

        this.add.text(width / 2, 70, 'SELECT YOUR VILLAGE IDENTITY FOR THE MYSTERY', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '10.5px',
            color: '#E2D5C3',
            letterSpacing: 1
        }).setOrigin(0.5).setDepth(10);

        // 4. Timer Chronometer Pill Card
        this.timerCard = this.add.container(width / 2, 108).setDepth(10);
        this.timerBg = this.add.rectangle(0, 0, 280, 36, 0x140F14, 0.95);
        this.timerBg.setStrokeStyle(1.8, 0xF59E0B, 0.9);

        this.timerText = this.add.text(0, 0, `TIME: 0:${String(this.timeRemaining).padStart(2, '0')}`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '12px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.timerCard.add([this.timerBg, this.timerText]);

        // 5. Host Start Early Button (Top-Right)
        this.hostStartBtn = this.add.container(width - 24, 40).setDepth(15);
        const hostBtnBg = this.add.rectangle(0, 0, 180, 42, 0x15803D, 0.95).setOrigin(1, 0.5);
        hostBtnBg.setStrokeStyle(1.5, 0x4ADE80, 0.85);
        hostBtnBg.setInteractive({ useHandCursor: true });

        const hostBtnText = this.add.text(-90, 0, '▶ START EARLY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '10px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        this.hostStartBtn.add([hostBtnBg, hostBtnText]);

        hostBtnBg.on('pointerdown', () => {
            if (this.timeRemaining > 2) {
                this.timeRemaining = 2;
                if (window.socketClient) {
                    window.socketClient.send({ type: 'START_EARLY' });
                }
                if (this.sound.get('sfx_button_click')) {
                    this.sound.play('sfx_button_click', { volume: 0.5 });
                }
            }
        });

        // 6. Avatar Definitions
        const avatars = [
            { id: '01', name: 'CHEF', title: 'KITCHEN EXPERT', icon: '👨‍🍳', accent: 0xF59E0B },
            { id: '02', name: 'BUILDER', title: 'SITE FOREMAN', icon: '👷', accent: 0xEA580C },
            { id: '03', name: 'MECHANIC', title: 'TOOL MASTER', icon: '🔧', accent: 0x38BDF8 },
            { id: '04', name: 'NURSE', title: 'FIRST AID', icon: '👩‍⚕️', accent: 0xEC4899 },
            { id: '05', name: 'SCHOLAR', title: 'TOWN CLERK', icon: '💼', accent: 0xA855F7 },
            { id: '06', name: 'OFFICER', title: 'VILLAGE GUARD', icon: '👮', accent: 0x10B981 }
        ];

        // 7. Render 6 Centered Avatar Cards (Larger & Prominent)
        this.avatarCards = [];
        const cardW = 160;
        const cardH = 246;
        const gapX = 22;
        const totalW = cardW * 6 + gapX * 5;
        const startX = (width - totalW) / 2 + cardW / 2;
        const cardY = height * 0.52;

        avatars.forEach((av, i) => {
            const x = startX + i * (cardW + gapX);
            const card = this.createAvatarCard(x, cardY, av, cardW, cardH);
            this.avatarCards.push(card);
        });

        // 8. Bottom Action Button
        this.confirmButtonContainer = this.add.container(width / 2, height - 48).setDepth(20);
        this.confirmButtonBg = this.add.rectangle(0, 0, 440, 48, 0x241A22, 0.95);
        this.confirmButtonBg.setStrokeStyle(1.8, 0x785338, 0.85);

        this.confirmButtonText = this.add.text(0, 0, 'SELECT AN AVATAR TO PROCEED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11px',
            color: '#A89F91',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        this.confirmButtonContainer.add([this.confirmButtonBg, this.confirmButtonText]);

        // 9. Countdown Timer Event
        this.time.addEvent({
            delay: 1000,
            repeat: this.timeRemaining - 1,
            callback: () => {
                this.timeRemaining--;
                const sec = String(this.timeRemaining).padStart(2, '0');
                this.timerText.setText(`TIME: 0:${sec}`);

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#EF4444');
                    this.timerBg.setStrokeStyle(2, 0xEF4444, 1);
                } else if (this.timeRemaining <= 20) {
                    this.timerText.setColor('#F59E0B');
                    this.timerBg.setStrokeStyle(2, 0xF59E0B, 1);
                }

                if (this.timeRemaining <= 0 && !this.isConfirmed) {
                    const randomId = String(Math.floor(Math.random() * 6) + 1).padStart(2, '0');
                    this.selectAvatar(randomId);
                    this.confirmSelection();
                }
            }
        });
    }

    createFallbackGradient(width, height) {
        const canvas = this.textures.createCanvas('char_select_fallback', width, height);
        const ctx = canvas.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0.00, '#090E1F');
        grad.addColorStop(0.35, '#131C38');
        grad.addColorStop(0.65, '#2D344B');
        grad.addColorStop(0.85, '#684554');
        grad.addColorStop(1.00, '#A85854');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        canvas.refresh();
        this.add.image(width / 2, height / 2, 'char_select_fallback').setDepth(0);
    }

    createAmbientEmbers(width, height) {
        this.embers = [];
        const emberColors = [0xF59E0B, 0xFCD34D, 0xFB923C, 0xFBBF24, 0xFEF3C7];

        for (let i = 0; i < 35; i++) {
            const size = Phaser.Math.FloatBetween(1.2, 3.2);
            const color = Phaser.Utils.Array.GetRandom(emberColors);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.85);

            const p = this.add.circle(
                Phaser.Math.Between(10, width - 10),
                Phaser.Math.Between(20, height + 30),
                size,
                color,
                alpha
            ).setDepth(2);

            this.embers.push({
                shape: p,
                speedY: Phaser.Math.FloatBetween(-0.25, -0.65),
                swaySpeed: Phaser.Math.FloatBetween(0.002, 0.005),
                baseX: p.x,
                offset: Phaser.Math.FloatBetween(0, 100)
            });
        }
    }

    createAvatarCard(x, y, avData, w, h) {
        const container = this.add.container(x, y).setDepth(10);

        // 1. Frosted Glass Card Frame
        const bg = this.add.rectangle(0, 0, w, h, 0x140F14, 0.95);
        bg.setStrokeStyle(1.8, 0x785338, 0.85);
        bg.setInteractive({ useHandCursor: true });

        // 2. Top Role Emoji Badge
        const iconBadgeBg = this.add.circle(0, -h / 2 + 24, 18, 0x231E1B);
        iconBadgeBg.setStrokeStyle(1, 0x785338);

        const iconBadge = this.add.text(0, -h / 2 + 24, avData.icon, {
            fontSize: '18px'
        }).setOrigin(0.5);

        // 3. Avatar Stage Platform Box
        const stageBg = this.add.rectangle(0, -10, w - 24, 88, 0x1A141A, 1);
        stageBg.setStrokeStyle(1, 0x3D322A);

        const shadowPedestal = this.add.ellipse(0, 18, 50, 14, 0x000000, 0.6);

        // 4. Pixel Art Character Walk/Idle Sprite (Prominent & Clean)
        const spriteKey = `spr_avatar_${avData.id}`;
        let avatarSprite;
        if (this.textures.exists(spriteKey)) {
            avatarSprite = this.add.sprite(0, -10, spriteKey, 0);
            avatarSprite.setScale(3.2);
            const idleAnim = `avatar_${avData.id}_idle_south`;
            if (this.anims.exists(idleAnim)) {
                avatarSprite.play(idleAnim);
            }
        } else {
            avatarSprite = this.add.rectangle(0, -10, 32, 44, avData.accent);
        }

        // 5. Role Title & Archetype Subtitle (Larger Fonts)
        const roleText = this.add.text(0, 56, avData.name, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '11.5px',
            color: '#FFF8EE',
            letterSpacing: 1
        }).setOrigin(0.5);

        const titleText = this.add.text(0, 78, avData.title, {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '8px',
            color: '#E5D5C5',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        // 6. Selected Status Tag Badge
        const selectTagBg = this.add.rectangle(0, 104, w - 28, 22, 0x064E3B, 0.95).setVisible(false);
        selectTagBg.setStrokeStyle(1.2, 0x10B981);

        const selectTagText = this.add.text(0, 104, '✓ SELECTED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8px',
            color: '#4ADE80'
        }).setOrigin(0.5).setVisible(false);

        container.add([
            bg,
            iconBadgeBg,
            iconBadge,
            stageBg,
            shadowPedestal,
            avatarSprite,
            roleText,
            titleText,
            selectTagBg,
            selectTagText
        ]);

        // Pointer Events
        bg.on('pointerdown', () => {
            if (!this.isConfirmed) {
                this.selectAvatar(avData.id);
            }
        });

        bg.on('pointerover', () => {
            if (!this.isConfirmed && this.selectedAvatar !== avData.id) {
                bg.setStrokeStyle(2, 0xF59E0B, 1);
                bg.setFillStyle(0x231822, 0.98);
                this.tweens.add({ targets: container, y: y - 8, duration: 120, ease: 'Power1' });
            }
        });

        bg.on('pointerout', () => {
            if (this.selectedAvatar !== avData.id) {
                bg.setStrokeStyle(1.8, 0x785338, 0.85);
                bg.setFillStyle(0x140F14, 0.94);
                this.tweens.add({ targets: container, y: y, duration: 120, ease: 'Power1' });
            }
        });

        return {
            container,
            bg,
            roleText,
            titleText,
            selectTagBg,
            selectTagText,
            id: avData.id,
            accent: avData.accent,
            name: avData.name,
            y
        };
    }

    selectAvatar(id) {
        this.selectedAvatar = id;

        this.avatarCards.forEach(card => {
            if (card.id === id) {
                card.bg.setStrokeStyle(2.5, 0xF59E0B, 1);
                card.bg.setFillStyle(0x2A1C16, 0.98);
                card.roleText.setColor('#F59E0B');
                card.selectTagBg.setVisible(true);
                card.selectTagText.setVisible(true);

                this.tweens.add({
                    targets: card.container,
                    y: card.y - 12,
                    duration: 150,
                    ease: 'Back.easeOut'
                });
            } else {
                card.bg.setStrokeStyle(1.8, 0x785338, 0.85);
                card.bg.setFillStyle(0x140F14, 0.94);
                card.roleText.setColor('#FFF8EE');
                card.selectTagBg.setVisible(false);
                card.selectTagText.setVisible(false);

                this.tweens.add({
                    targets: card.container,
                    y: card.y,
                    duration: 150,
                    ease: 'Power1'
                });
            }
        });

        const chosen = this.avatarCards.find(c => c.id === id);
        if (chosen) {
            this.confirmButtonBg.setFillStyle(0x15803D, 0.95);
            this.confirmButtonBg.setStrokeStyle(1.8, 0x4ADE80, 0.9);
            this.confirmButtonBg.setInteractive({ useHandCursor: true });
            this.confirmButtonText.setText(`CONFIRM ${chosen.name} IDENTITY`);
            this.confirmButtonText.setColor('#FFFFFF');

            this.confirmButtonBg.removeAllListeners('pointerdown');
            this.confirmButtonBg.on('pointerdown', () => this.confirmSelection());
        }

        if (this.sound.get('sfx_button_click')) {
            this.sound.play('sfx_button_click', { volume: 0.4 });
        }
    }

    confirmSelection() {
        if (this.isConfirmed || !this.selectedAvatar) return;
        this.isConfirmed = true;

        this.confirmButtonBg.setFillStyle(0x064E3B, 0.95);
        this.confirmButtonBg.setStrokeStyle(1.8, 0x10B981, 0.9);
        this.confirmButtonBg.disableInteractive();
        this.confirmButtonText.setText('✓ IDENTITY CONFIRMED - WAITING...');
        this.confirmButtonText.setColor('#4ADE80');

        if (window.socketClient) {
            window.socketClient.send({
                type: 'SELECT_CHARACTER',
                avatarId: this.selectedAvatar
            });
        }
    }

    update(time, delta) {
        if (this.embers) {
            this.embers.forEach(e => {
                e.shape.y += e.speedY;
                e.shape.x = e.baseX + Math.sin(time * e.swaySpeed + e.offset) * 16;
                if (e.shape.y < -10) {
                    e.shape.y = this.cameras.main.height + 15;
                    e.baseX = Phaser.Math.Between(10, this.cameras.main.width - 10);
                }
            });
        }
    }
}
