import Phaser from 'phaser';
import { CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    init() {
        this.selectedAvatar = null;
        this.isConfirmed = false;
        this.timeRemaining = CONFIG.CHARACTER_SELECT_DURATION || 30;
        this.setupNetwork();
    }

    setupNetwork() {
        gameEvents.off('phase:serverChanged', this.onPhaseChange, this);
        gameEvents.off('role:assigned', this.onRoleAssigned, this);

        this.onPhaseChange = (data) => {
            if (data && (data.phase === 'ROLE_ASSIGNMENT' || data.phase === 'DAY_PHASE')) {
                const roomData = window.socketClient ? window.socketClient.currentRoom : null;
                this.scene.start('GameScene', {
                    mystery: data.mystery,
                    avatarId: this.selectedAvatar || '01',
                    playerId: roomData ? roomData.playerId : 'local_player',
                    players: roomData ? roomData.players : []
                });
            }
        };

        this.onRoleAssigned = (data) => {
            const roomData = window.socketClient ? window.socketClient.currentRoom : null;
            this.scene.start('GameScene', {
                mystery: data ? data.mystery : null,
                avatarId: this.selectedAvatar || '01',
                playerId: roomData ? roomData.playerId : 'local_player',
                players: roomData ? roomData.players : [],
                role: data ? data.role : 'SURVIVOR'
            });
        };

        gameEvents.on('phase:serverChanged', this.onPhaseChange, this);
        gameEvents.on('role:assigned', this.onRoleAssigned, this);
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

        // 3. Header Title & Subtitle
        this.add.text(width / 2, 36, 'CHOOSE YOUR AVATAR', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '22px',
            color: '#FFF8EE',
            letterSpacing: 2,
            shadow: { offsetX: 0, offsetY: 3, color: '#D97706', blur: 16, fill: true }
        }).setOrigin(0.5).setDepth(10);

        this.add.text(width / 2, 60, 'SELECT YOUR VILLAGE IDENTITY FOR THE MYSTERY', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8.5px',
            color: '#E2D5C3',
            letterSpacing: 0.5
        }).setOrigin(0.5).setDepth(10);

        // 4. Timer Chronometer Pill Card
        this.timerCard = this.add.container(width / 2, 92).setDepth(10);
        this.timerBg = this.add.rectangle(0, 0, 260, 32, 0x140F14, 0.95);
        this.timerBg.setStrokeStyle(1.8, 0xF59E0B, 0.9);

        this.timerText = this.add.text(0, 0, `TIME: 0:${String(this.timeRemaining).padStart(2, '0')}`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '10px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.timerCard.add([this.timerBg, this.timerText]);

        // 5. Host Start Early Button (Top-Right)
        this.hostStartBtn = this.add.container(width - 24, 38).setDepth(15);
        const hostBtnBg = this.add.rectangle(0, 0, 160, 36, 0x15803D, 0.92).setOrigin(1, 0.5);
        hostBtnBg.setStrokeStyle(1.5, 0x4ADE80, 0.8);
        hostBtnBg.setInteractive({ useHandCursor: true });

        const hostBtnText = this.add.text(-80, 0, '▶ START EARLY', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '8.5px',
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

        // 7. Render 6 Centered Avatar Cards
        this.avatarCards = [];
        const cardW = 150;
        const cardH = 226;
        const gapX = 20;
        const totalW = cardW * 6 + gapX * 5;
        const startX = (width - totalW) / 2 + cardW / 2;
        const cardY = height * 0.51;

        avatars.forEach((av, i) => {
            const x = startX + i * (cardW + gapX);
            const card = this.createAvatarCard(x, cardY, av, cardW, cardH);
            this.avatarCards.push(card);
        });

        // 8. Bottom Action Button
        this.confirmButtonContainer = this.add.container(width / 2, height - 48).setDepth(20);
        this.confirmButtonBg = this.add.rectangle(0, 0, 360, 48, 0x241A22, 0.9);
        this.confirmButtonBg.setStrokeStyle(1.8, 0x785338, 0.8);

        this.confirmButtonText = this.add.text(0, 0, 'SELECT AN AVATAR TO PROCEED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9.5px',
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
        const bg = this.add.rectangle(0, 0, w, h, 0x140F14, 0.94);
        bg.setStrokeStyle(1.8, 0x785338, 0.85);
        bg.setInteractive({ useHandCursor: true });

        // 2. Top Role Emoji Badge
        const iconBadgeBg = this.add.circle(0, -h / 2 + 22, 16, 0x231E1B);
        iconBadgeBg.setStrokeStyle(1, 0x785338);

        const iconBadge = this.add.text(0, -h / 2 + 22, avData.icon, {
            fontSize: '15px'
        }).setOrigin(0.5);

        // 3. Avatar Stage Platform Box
        const stageBg = this.add.rectangle(0, -12, w - 24, 76, 0x1A141A, 1);
        stageBg.setStrokeStyle(1, 0x3D322A);

        const shadowPedestal = this.add.ellipse(0, 12, 44, 12, 0x000000, 0.6);

        // 4. Pixel Art Character Walk/Idle Sprite (Prominent & Clean)
        const spriteKey = `spr_avatar_${avData.id}`;
        let avatarSprite;
        if (this.textures.exists(spriteKey)) {
            avatarSprite = this.add.sprite(0, -10, spriteKey, 0);
            avatarSprite.setScale(2.8);
            const idleAnim = `avatar_${avData.id}_idle_south`;
            if (this.anims.exists(idleAnim)) {
                avatarSprite.play(idleAnim);
            }
        } else {
            avatarSprite = this.add.rectangle(0, -10, 28, 38, avData.accent);
        }

        // 5. Role Title & Archetype Subtitle
        const roleText = this.add.text(0, 48, avData.name, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9.5px',
            color: '#FFF8EE',
            letterSpacing: 1
        }).setOrigin(0.5);

        const titleText = this.add.text(0, 66, avData.title, {
            fontFamily: 'Dogica, monospace',
            fontSize: '6.5px',
            color: '#E5D5C5',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        // 6. Selected Status Tag Badge
        const selectTagBg = this.add.rectangle(0, 92, w - 30, 20, 0x064E3B, 0.95).setVisible(false);
        selectTagBg.setStrokeStyle(1, 0x10B981);

        const selectTagText = this.add.text(0, 92, '✓ SELECTED', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7px',
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
            baseY: y
        };
    }

    selectAvatar(avatarId) {
        this.selectedAvatar = avatarId;

        this.avatarCards.forEach(card => {
            if (card.id === avatarId) {
                card.bg.setStrokeStyle(2.5, 0xF59E0B, 1);
                card.bg.setFillStyle(0x2A1B24, 0.98);
                card.selectTagBg.setVisible(true);
                card.selectTagText.setVisible(true);
                this.tweens.add({ targets: card.container, y: card.baseY - 12, duration: 150 });
            } else {
                card.bg.setStrokeStyle(1.8, 0x785338, 0.85);
                card.bg.setFillStyle(0x140F14, 0.94);
                card.selectTagBg.setVisible(false);
                card.selectTagText.setVisible(false);
                this.tweens.add({ targets: card.container, y: card.baseY, duration: 150 });
            }
        });

        // Enable confirm button with emerald glow
        const selectedCard = this.avatarCards.find(c => c.id === avatarId);
        const name = selectedCard ? selectedCard.name : 'AVATAR';
        
        this.confirmButtonBg.setFillStyle(0x15803D, 0.95);
        this.confirmButtonBg.setStrokeStyle(2, 0x4ADE80, 0.9);
        this.confirmButtonBg.setInteractive({ useHandCursor: true });
        this.confirmButtonText.setText(`CONFIRM: ${name} ▶`);
        this.confirmButtonText.setColor('#FFFFFF');

        this.confirmButtonBg.off('pointerdown');
        this.confirmButtonBg.on('pointerdown', () => this.confirmSelection());
    }

    confirmSelection() {
        if (this.isConfirmed || !this.selectedAvatar) return;
        this.isConfirmed = true;

        if (this.sound.get('sfx_button_click')) {
            this.sound.play('sfx_button_click', { volume: 0.5 });
        }

        if (window.socketClient) {
            window.socketClient.send({ type: 'CHARACTER_SELECTED', avatarId: this.selectedAvatar });
            window.socketClient.send({ type: 'START_EARLY' });
        }

        this.confirmButtonBg.setFillStyle(0x064E3B, 1);
        this.confirmButtonBg.setStrokeStyle(2, 0x10B981, 1);
        this.confirmButtonText.setText('✓ ENTERING GAME...');
        this.confirmButtonBg.removeInteractive();

        // Guaranteed transition fallback: Transition into GameScene after 800ms if server message has not already triggered it
        this.time.delayedCall(800, () => {
            if (this.scene.isActive('CharacterSelectScene')) {
                const roomData = window.socketClient ? window.socketClient.currentRoom : null;
                this.scene.start('GameScene', {
                    avatarId: this.selectedAvatar || '01',
                    playerId: roomData ? roomData.playerId : 'local_player',
                    players: roomData ? roomData.players : []
                });
            }
        });
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
