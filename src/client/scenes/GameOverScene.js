import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.winner = data.winner || 'SURVIVORS';
        this.reason = data.reason || 'MYSTERY_SOLVED';
        this.roleReveal = data.roleReveal || [];
        this.mysteryResult = data.mysteryResult || {};
        this.localPlayerRole = data.localPlayerRole || 'SURVIVOR';
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0F172A');

        const localWon = (this.winner === 'SURVIVORS' && this.localPlayerRole === 'SURVIVOR') ||
                          (this.winner === 'INSTIGATORS' && this.localPlayerRole === 'INSTIGATOR');

        // Sound stings
        if (localWon && this.sound.get('mus_victory_fanfare')) {
            this.sound.play('mus_victory_fanfare', { volume: 0.7 });
        } else if (!localWon && this.sound.get('mus_defeat_sting')) {
            this.sound.play('mus_defeat_sting', { volume: 0.7 });
        }

        // Header Title Banner
        const titleText = localWon ? '★ VICTORY ★' : 'GAME OVER';
        const titleColor = localWon ? '#10B981' : '#EF4444';
        const bannerColor = localWon ? 0x10B981 : 0xEF4444;

        this.add.text(width / 2, 40, titleText, {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '22px',
            color: titleColor,
            letterSpacing: 2
        }).setOrigin(0.5);

        // Faction Result Subtitle
        this.add.text(width / 2, 78, `${this.winner} TRIUMPH`, {
            fontFamily: 'Dogica, monospace',
            fontSize: '12px',
            color: '#F8FAFC',
            letterSpacing: 1.5
        }).setOrigin(0.5);

        // Narrative Summary Card
        const summaryCard = this.add.container(width / 2, 120);
        const cardBg = this.add.rectangle(0, 0, 560, 42, 0x1E293B, 0.95);
        cardBg.setStrokeStyle(1.5, bannerColor, 0.7);

        const reasonText = this.add.text(0, 0, this.getReasonText(), {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#94A3B8'
        }).setOrigin(0.5);

        summaryCard.add([cardBg, reasonText]);

        // Role Reveal Table Header
        this.add.text(width / 2, 168, 'POST-GAME ROLE REVEAL', {
            fontFamily: 'Dogica, monospace',
            fontSize: '9.5px',
            color: '#94A3B8',
            letterSpacing: 1
        }).setOrigin(0.5);

        // Table Rows Container
        const rowStartY = 202;
        const rowH = 34;

        this.roleReveal.forEach((player, index) => {
            const y = rowStartY + index * rowH;
            const isSurvivor = player.role === 'SURVIVOR';
            const roleColor = isSurvivor ? '#10B981' : '#EF4444';
            const statusText = player.isAlive ? '✓ ALIVE' : `EVICTED (Day ${player.eliminationDay || 1})`;
            const statusColor = player.isAlive ? '#10B981' : '#64748B';

            const rowBg = this.add.rectangle(width / 2, y, 560, 28, 0x1E293B, 0.8);
            rowBg.setStrokeStyle(1, 0x334155, 0.6);

            // Avatar Portrait
            const avatarId = player.avatarId || '01';
            const portKey = `port_avatar_${avatarId}_select`;
            if (this.textures.exists(portKey)) {
                const portImg = this.add.image(width / 2 - 250, y, portKey);
                portImg.setDisplaySize(24, 24);
            }

            // Player Name
            this.add.text(width / 2 - 230, y, player.displayName || `Player ${index + 1}`, {
                fontFamily: 'Dogica, monospace',
                fontSize: '8px',
                color: '#F8FAFC'
            }).setOrigin(0, 0.5);

            // Role Badge Tag
            this.add.text(width / 2, y, player.role, {
                fontFamily: 'Dogica, monospace',
                fontSize: '8px',
                color: roleColor
            }).setOrigin(0.5, 0.5);

            // Status Badge
            this.add.text(width / 2 + 250, y, statusText, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7.5px',
                color: statusColor
            }).setOrigin(1, 0.5);
        });

        // Bottom Action Buttons
        const btnY = height - 45;
        this.createActionButton(width * 0.36, btnY, 'PLAY AGAIN', 0x10B981, () => {
            this.scene.start('LobbyScene', { isHost: false });
        });

        this.createActionButton(width * 0.64, btnY, 'MAIN MENU', 0x475569, () => {
            this.scene.start('MenuScene');
        });
    }

    getReasonText() {
        switch (this.reason) {
            case 'MYSTERY_SOLVED': return '"The mystery has been solved at the Library. Misinformation contained."';
            case 'ALL_INSTIGATORS_EVICTED': return '"All instigators were identified and evicted by majority vote."';
            case 'VOTING_PARITY': return '"Instigators reached voting parity and took control of the village."';
            default: return '"The match has concluded."';
        }
    }

    createActionButton(x, y, text, colorHex, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 180, 44, colorHex, 0.95);
        bg.setStrokeStyle(1.5, 0xFFFFFF, 0.3);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Dogica, monospace',
            fontSize: '9.5px',
            color: '#FFFFFF',
            letterSpacing: 1
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
}
