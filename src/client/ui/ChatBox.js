import { COLORS } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';

export class ChatBox {
    constructor(scene) {
        this.scene = scene;
        const height = scene.cameras.main.height;
        this.filter = 'ALL';
        this.isCollapsed = false;

        this.boxW = 420;
        this.boxH = 154;

        this.container = scene.add.container(16, height - this.boxH - 16);
        this.container.setScrollFactor(0);
        this.container.setDepth(300);

        // Warm Espresso Walnut Glass Backdrop
        this.bg = scene.add.rectangle(0, 0, this.boxW, this.boxH, 0x181311, 0.95).setOrigin(0, 0);
        this.bg.setStrokeStyle(1.5, 0x785338, 0.85);

        // Header Bar
        this.header = scene.add.rectangle(0, 0, this.boxW, 24, 0x231E1B, 0.95).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        this.headerBorder = scene.add.rectangle(0, 24, this.boxW, 1, 0x785338, 0.6).setOrigin(0, 0);
        
        this.headerText = scene.add.text(10, 12, '💬 TOWN DISCUSSION', {
            fontFamily: 'DogicaBold, Dogica, monospace',
            fontSize: '7.5px',
            color: '#F59E0B',
            letterSpacing: 1
        }).setOrigin(0, 0.5);

        // Filter Tabs
        this.tabAll = scene.add.text(175, 12, 'ALL', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#F59E0B'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tabSys = scene.add.text(215, 12, 'SYS', {
            fontFamily: 'Dogica, monospace',
            fontSize: '7px',
            color: '#A89F91'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tabChat = scene.add.text(260, 12, 'TOWN', {
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

        this.setupInteractiveInput();

        this.addMessage('SYSTEM', 'Town discussion active. Press Enter or use input below to chat.', '#E5B869');
        this.setupEventListeners();
    }

    setupInteractiveInput() {
        const inputHtml = `
        <div style="display:flex; width: 400px; height: 24px; align-items: center; gap: 4px; box-sizing: border-box;">
            <input type="text" id="dusk-chat-input" placeholder="Type in Town Chat... (Press Enter to send)" maxlength="120"
                style="flex: 1; height: 22px; background: #201717; border: 1px solid #785338; color: #FDFBF7; font-family: monospace, sans-serif; font-size: 11px; padding: 0 8px; outline: none; border-radius: 2px;" />
            <button id="dusk-chat-send"
                style="height: 22px; padding: 0 12px; background: #92400E; border: 1px solid #D97706; color: #FFF8EE; font-family: monospace, sans-serif; font-size: 10px; font-weight: bold; cursor: pointer; border-radius: 2px;">SEND</button>
        </div>
        `;

        this.inputDom = this.scene.add.dom(210, this.boxH - 16).createFromHTML(inputHtml);
        this.container.add(this.inputDom);

        // Bind DOM events
        const inputElem = document.getElementById('dusk-chat-input');
        const sendBtn = document.getElementById('dusk-chat-send');

        if (inputElem) {
            inputElem.addEventListener('focus', () => {
                if (this.scene.input && this.scene.input.keyboard) {
                    this.scene.input.keyboard.disableGlobalCapture();
                }
            });

            inputElem.addEventListener('blur', () => {
                if (this.scene.input && this.scene.input.keyboard) {
                    this.scene.input.keyboard.enableGlobalCapture();
                }
            });

            inputElem.addEventListener('keydown', (e) => {
                e.stopPropagation(); // Prevents WASD / E from moving character while typing
                if (e.key === 'Enter') {
                    this.sendCurrentMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendCurrentMessage();
            });
        }
    }

    sendCurrentMessage() {
        const inputElem = document.getElementById('dusk-chat-input');
        if (!inputElem) return;

        const text = (inputElem.value || '').trim();
        if (text.length > 0) {
            gameEvents.emit('ui:chatMessageSend', {
                content: text,
                mode: 'TOWN'
            });
            inputElem.value = '';
        }
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
        if (this.inputDom) this.inputDom.setVisible(!this.isCollapsed);
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
        if (this.messages.length > 10) this.messages.shift();

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
            const y = idx * 21;
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
            if (cleanText.length > 46) cleanText = cleanText.substring(0, 44) + '…';

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
            const isAlert = content.toLowerCase().includes('lock') || content.toLowerCase().includes('sabotage') || content.toLowerCase().includes('evict') || content.toLowerCase().includes('banished');
            this.addMessage(isAlert ? 'ALERT' : 'SYSTEM', content, isAlert ? '#F87171' : '#E5B869');
        });
    }

    destroy() {
        if (this.scene.input && this.scene.input.keyboard) {
            this.scene.input.keyboard.enableGlobalCapture();
        }
        this.container.destroy();
    }
}
