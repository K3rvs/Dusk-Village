import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class ChatBox {
    constructor(scene) {
        this.scene = scene;
        const height = scene.cameras.main.height;
        this.filter = 'ALL';
        this.isCollapsed = false;

        this.boxW = 380;
        this.boxH = 126;

        this.container = scene.add.container(16, height - this.boxH - 16);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Warm Espresso Walnut Glass Backdrop
        this.bg = scene.add.rectangle(0, 0, this.boxW, this.boxH, 0x181311, 0.94).setOrigin(0, 0);
        this.bg.setStrokeStyle(1.5, 0x785338, 0.85);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, this.boxW, 24, 0x231E1B, 0.95).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        this.headerBorder = scene.add.rectangle(0, 24, this.boxW, 1, 0x785338, 0.6).setOrigin(0, 0);
        
        this.headerText = scene.add.text(10, 12, 'VILLAGE DISPATCH', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7.5px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        // Filter Tabs
        this.tabAll = scene.add.text(140, 12, 'ALL', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#F59E0B'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tabSys = scene.add.text(180, 12, 'SYS', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#A89F91'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tabChat = scene.add.text(220, 12, 'CHAT', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#A89F91'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.liveTag = scene.add.text(this.boxW - 32, 12, '[LIVE]', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#4ADE80'
        }).setOrigin(1, 0.5);

        this.toggleBtn = scene.add.text(this.boxW - 10, 12, '[-]', {
            fontFamily: 'Dogica, monospace',
            fontSize: '8px',
            color: '#A89F91'
        }).setOrigin(1, 0.5);

        this.messages = [];
        this.messagesContainer = scene.add.container(10, 30);

        this.container.add([
            this.bg,
            this.header,
            this.headerBorder,
            this.headerText,
            this.tabAll,
            this.tabSys,
            this.tabChat,
            this.liveTag,
            this.toggleBtn,
            this.messagesContainer
        ]);

        this.tabAll.on('pointerdown', () => this.setFilter('ALL'));
        this.tabSys.on('pointerdown', () => this.setFilter('SYSTEM'));
        this.tabChat.on('pointerdown', () => this.setFilter('CHAT'));
        this.header.on('pointerdown', () => this.toggleCollapse());

        this.addMessage('SYSTEM', 'Welcome to Dusk Village. Seek authentic fragments.', '#E5B869');
        this.setupEventListeners();
    }

    setFilter(filterName) {
        this.filter = filterName;
        this.tabAll.setColor(filterName === 'ALL' ? '#F59E0B' : '#A89F91');
        this.tabSys.setColor(filterName === 'SYSTEM' ? '#F59E0B' : '#A89F91');
        this.tabChat.setColor(filterName === 'CHAT' ? '#F59E0B' : '#A89F91');
        this.renderMessages();
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.messagesContainer.setVisible(!this.isCollapsed);
        this.toggleBtn.setText(this.isCollapsed ? '[+]' : '[-]');
        this.bg.setSize(this.boxW, this.isCollapsed ? 24 : this.boxH);
    }

    onResize(width, height) {
        this.container.setPosition(16, height - this.boxH - 16);
    }

    addMessage(category, text, accentColor = '#FDFBF7') {
        const entry = {
            category,
            text,
            accentColor
        };

        this.messages.push(entry);
        if (this.messages.length > 8) this.messages.shift();

        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.removeAll(true);

        const filtered = this.messages.filter(msg => {
            if (this.filter === 'ALL') return true;
            if (this.filter === 'SYSTEM') return msg.category === 'SYSTEM' || msg.category === 'ALERT';
            if (this.filter === 'CHAT') return msg.category !== 'SYSTEM' && msg.category !== 'ALERT';
            return true;
        }).slice(-4);

        filtered.forEach((msg, idx) => {
            const y = idx * 22;
            const isAlert = msg.category === 'ALERT';
            const isSystem = msg.category === 'SYSTEM';

            let badgeColor = isAlert ? '#F87171' : isSystem ? '#F59E0B' : '#E5B869';
            let badgeBgColor = isAlert ? 0x7F1D1D : isSystem ? 0x451A03 : 0x29221D;
            let badgeStroke = isAlert ? 0xDC2626 : isSystem ? 0xD97706 : 0x785338;

            const badgeBg = this.scene.add.rectangle(0, y + 9, 56, 15, badgeBgColor, 0.9).setOrigin(0, 0.5);
            badgeBg.setStrokeStyle(1, badgeStroke, 0.8);

            const badgeText = this.scene.add.text(28, y + 9, msg.category.substring(0, 7), {
                fontFamily: 'Dogica, monospace',
                fontSize: '6.5px',
                color: badgeColor,
                letterSpacing: 0.5
            }).setOrigin(0.5, 0.5);

            let cleanText = msg.text;
            if (cleanText.length > 40) cleanText = cleanText.substring(0, 38) + '…';

            const bodyText = this.scene.add.text(64, y + 9, cleanText, {
                fontFamily: 'Dogica, monospace',
                fontSize: '7px',
                color: msg.accentColor || '#FDFBF7'
            }).setOrigin(0, 0.5);

            this.messagesContainer.add([badgeBg, badgeText, bodyText]);
        });
    }

    setupEventListeners() {
        gameEvents.on('ui:chatMessageReceived', (msg) => {
            const cat = msg.mode ? msg.mode.toUpperCase() : 'CHAT';
            this.addMessage(cat, `${msg.senderName}: ${msg.content}`, '#FDFBF7');
        });

        gameEvents.on('chat:systemMessage', (msg) => {
            const content = typeof msg === 'string' ? msg : msg.content || '';
            const isAlert = content.toLowerCase().includes('lock') || content.toLowerCase().includes('sabotage') || content.toLowerCase().includes('evict');
            this.addMessage(isAlert ? 'ALERT' : 'SYSTEM', content, isAlert ? '#F87171' : '#E5B869');
        });
    }

    destroy() {
        this.container.destroy();
    }
}
