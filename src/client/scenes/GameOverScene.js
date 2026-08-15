import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.winner = (data.winner || 'SURVIVOR').toUpperCase();
        this.reason = data.reason || 'MYSTERY_SOLVED';
        this.roleReveal = data.roleReveal || [];
        this.mysteryResult = data.mysteryResult || {};
        this.localPlayerRole = (data.localPlayerRole || 'SURVIVOR').toUpperCase();
    }

    create() {
        const { width, height } = this.cameras.main;

        // 1. Cinematic Dusk Twilight Sunset Backdrop
        if (this.textures.exists('bg_menu_dusk')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_menu_dusk');
            bg.setDisplaySize(width, height);
            bg.setDepth(0);

            // Dark vignette overlay
            this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.52).setDepth(1);
        } else {
            this.cameras.main.setBackgroundColor('#0F172A');
        }

        // Ambient Floating Embers
        this.createAmbientEmbers(width, height);

        const localWon = (this.winner.startsWith('SURVIVOR') && this.localPlayerRole === 'SURVIVOR') ||
                          (this.winner.startsWith('INSTIGATOR') && this.localPlayerRole === 'INSTIGATOR');

        // Sound stings
        if (localWon && this.sound.get('mus_victory_fanfare')) {
            this.sound.play('mus_victory_fanfare', { volume: 0.7 });
        } else if (!localWon && this.sound.get('mus_defeat_sting')) {
            this.sound.play('mus_defeat_sting', { volume: 0.7 });
        }

        // 2. Header Result Banner (Prominent & Large)
        const titleText = localWon ? '★  VICTORY  ★' : '💀  DEFEAT  💀';
        const titleColor = localWon ? '#34D399' : '#F87171';
        const titleGlow = localWon ? '#059669' : '#DC2626';

        this.add.text(width / 2, 42, titleText, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '32px',
            color: titleColor,
            letterSpacing: 3,
            shadow: { offsetX: 0, offsetY: 3, color: titleGlow, blur: 24, fill: true }
        }).setOrigin(0.5).setDepth(10);

        // 3. Faction Result & Subtitle Badge
        const factionStr = this.winner.startsWith('SURVIVOR') ? 'SURVIVORS TRIUMPH' : 'INSTIGATORS TRIUMPH';
        const roleStr = `YOU WERE: ${this.localPlayerRole === 'INSTIGATOR' ? '🗡️ INSTIGATOR' : '🛡️ SURVIVOR'}`;
        
        const subtitleBadge = this.add.container(width / 2, 88).setDepth(10);
        const subBg = this.add.rectangle(0, 0, 520, 28, localWon ? 0x064E3B : 0x450A0A, 0.95);
        subBg.setStrokeStyle(1.5, localWon ? 0x10B981 : 0xEF4444, 0.9);

        const subText = this.add.text(0, 0, `${factionStr}   •   ${roleStr}`, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9.5px',
            color: localWon ? '#A7F3D0' : '#FECACA',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        subtitleBadge.add([subBg, subText]);

        // 4. Narrative Outcome Summary Box
        const summaryBox = this.add.container(width / 2, 134).setDepth(10);
        const sumBg = this.add.rectangle(0, 0, 840, 46, 0x181311, 0.96);
        sumBg.setStrokeStyle(1.8, 0x785338, 0.9);

        const reasonText = this.add.text(0, 0, this.getReasonText(), {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '9px',
            color: '#E2D5C3',
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        summaryBox.add([sumBg, reasonText]);

        // 5. Post-Game Council Roster Board (2 Columns x 5 Rows - Spacious & Large)
        const rosterBoardW = 880;
        const rosterBoardH = 340;
        const rosterCenterY = height * 0.57;

        const rosterBoardBg = this.add.rectangle(width / 2, rosterCenterY, rosterBoardW, rosterBoardH, 0x120E16, 0.94).setDepth(5);
        rosterBoardBg.setStrokeStyle(1.8, 0x785338, 0.9);

        // Center vertical divider
        this.add.rectangle(width / 2, rosterCenterY, 2, rosterBoardH - 24, 0x3D322A, 0.9).setDepth(6);

        // Board Header
        this.add.text(width / 2, rosterCenterY - rosterBoardH / 2 + 18, 'FINAL COUNCIL ROSTER & IDENTITY REVEAL', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '10.5px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0.5).setDepth(7);

        // Render 10 Player Slots (2 columns of 5)
        const slotW = 416;
        const slotH = 48;
        const gapY = 56;
        const startY = rosterCenterY - 100;

        const playersList = this.roleReveal.length > 0
            ? this.roleReveal
            : Array.from({ length: 10 }, (_, i) => ({ id: `p${i+1}`, name: `Player ${i+1}`, role: i < 3 ? 'INSTIGATOR' : 'SURVIVOR', isAlive: true }));

        playersList.slice(0, 10).forEach((player, i) => {
            const col = i < 5 ? 0 : 1;
            const row = i % 5;
            const slotX = width / 2 + (col === 0 ? -224 : 224);
            const slotY = startY + row * gapY;

            this.createPlayerSlot(slotX, slotY, player, slotW, slotH);
        });

        // 6. Bottom Action Navigation Buttons
        const btnY = height - 42;
        this.createActionButton(width * 0.36, btnY, '↻ PLAY AGAIN', 0x15803D, () => {
            this.cleanupAndNavigate('LobbyScene', { isHost: false });
        });

        this.createActionButton(width * 0.64, btnY, '⌂ MAIN MENU', 0x374151, () => {
            this.cleanupAndNavigate('MenuScene');
        });
    }

    createPlayerSlot(x, y, player, w, h) {
        const isSurvivor = (player.role || '').toUpperCase() === 'SURVIVOR';
        const roleColor = isSurvivor ? '#34D399' : '#F87171';
        const roleBgColor = isSurvivor ? 0x064E3B : 0x450A0A;
        const roleStroke = isSurvivor ? 0x10B981 : 0xEF4444;

        const isAlive = player.isAlive !== false;

        const container = this.add.container(x, y).setDepth(8);

        // Slot Background Card
        const slotBg = this.add.rectangle(0, 0, w, h, 0x201717, 0.95);
        slotBg.setStrokeStyle(1.2, 0x4A2A2A, 0.9);

        // Avatar Icon
        const avatarId = player.avatarId || '01';
        const portKey = `spr_avatar_${avatarId}`;
        const avatarIcon = this.textures.exists(portKey)
            ? this.add.sprite(-w / 2 + 24, 0, portKey, 0).setScale(1.1)
            : this.add.circle(-w / 2 + 24, 0, 12, 0x785338);

        // Name Text
        let nameStr = player.name || player.displayName || 'Player';
        if (nameStr.length > 13) nameStr = nameStr.substring(0, 11) + '..';

        const nameText = this.add.text(-w / 2 + 50, 0, nameStr, {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '9.5px',
            color: '#FDFBF7'
        }).setOrigin(0, 0.5);

        // Role Badge Tag
        const roleBadgeBg = this.add.rectangle(w / 2 - 124, 0, 110, 24, roleBgColor, 0.95);
        roleBadgeBg.setStrokeStyle(1.2, roleStroke, 0.9);

        const roleText = this.add.text(w / 2 - 124, 0, isSurvivor ? '🛡️ SURVIVOR' : '🗡️ INSTIGATOR', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '8px',
            color: roleColor
        }).setOrigin(0.5);

        // Status Tag (Alive / Evicted)
        const statusBadgeBg = this.add.rectangle(w / 2 - 34, 0, 58, 24, isAlive ? 0x14532D : 0x7F1D1D, 0.95);
        statusBadgeBg.setStrokeStyle(1.2, isAlive ? 0x15803D : 0xDC2626, 0.9);

        const statusText = this.add.text(w / 2 - 34, 0, isAlive ? 'ALIVE' : 'EVICTED', {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '7.5px',
            color: isAlive ? '#4ADE80' : '#FCA5A5'
        }).setOrigin(0.5);

        container.add([slotBg, avatarIcon, nameText, roleBadgeBg, roleText, statusBadgeBg, statusText]);
        return container;
    }

    createAmbientEmbers(width, height) {
        for (let i = 0; i < 24; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(1.2, 3);
            const color = Phaser.Math.RND.pick([0xF59E0B, 0xD97706, 0xEF4444, 0xFBBF24]);

            const ember = this.add.circle(x, y, size, color, Phaser.Math.FloatBetween(0.3, 0.75)).setDepth(2);

            this.tweens.add({
                targets: ember,
                y: y - Phaser.Math.Between(80, 220),
                x: x + Phaser.Math.Between(-40, 40),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 7000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    ember.setPosition(Phaser.Math.Between(0, width), height + 10);
                    ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.75));
                }
            });
        }
    }

    getReasonText() {
        const r = (this.reason || '').toUpperCase();
        if (r.includes('SOLVE') || r.includes('MYSTERY')) {
            return '📜 All 3 verified evidence fragments were delivered to the Village Hall Archive. Truth restored to Dusk Village!';
        }
        if (r.includes('ALL_INSTIGATORS') || r.includes('EVICT')) {
            return '⚖️ All hidden Instigators were successfully identified and banished by majority vote of the town council.';
        }
        if (r.includes('PARITY') || r.includes('INSTIGATOR')) {
            return '🗡️ The Instigators successfully derailed the investigation and overwhelmed the village council.';
        }
        return `The match has concluded: ${this.reason}`;
    }

    createActionButton(x, y, text, colorHex, callback) {
        const container = this.add.container(x, y).setDepth(15);

        const bg = this.add.rectangle(0, 0, 210, 42, colorHex, 0.95);
        bg.setStrokeStyle(1.8, 0xFFFFFF, 0.35);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'DogicaBold, monospace',
            fontSize: '10px',
            color: '#FFFFFF',
            letterSpacing: 0.5
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(Phaser.Display.Color.ValueToColor(colorHex).lighten(15).color);
            this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(colorHex);
            this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100 });
        });

        bg.on('pointerdown', () => {
            if (this.sound.get('sfx_button_click')) {
                this.sound.play('sfx_button_click', { volume: 0.5 });
            }
            callback();
        });
    }

    cleanupAndNavigate(targetScene, data = {}) {
        ['GameOverScene', 'InteriorScene', 'UIScene', 'GameScene', 'CharacterSelectScene', 'LobbyScene'].forEach(key => {
            if (this.scene.manager.getScene(key)) {
                this.scene.stop(key);
            }
        });
        if (targetScene === 'MenuScene' && window.socketClient) {
            window.socketClient.disconnect();
        }
        this.scene.start(targetScene, data);
    }
}
