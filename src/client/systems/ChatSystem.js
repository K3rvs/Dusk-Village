import { gameEvents } from '../utils/EventBus.js';

export class ChatSystem {
    constructor(scene) {
        this.scene = scene;
        this.chatHistory = [];

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('chat:received', (message) => {
            this.chatHistory.push(message);
            // Limit history
            if (this.chatHistory.length > 50) this.chatHistory.shift();

            gameEvents.emit('ui:chatMessageReceived', message);
        });

        gameEvents.on('ui:chatMessageSend', (data) => {
            gameEvents.emit('network:send', {
                type: 'CHAT_SEND',
                content: data.content,
                mode: data.mode || 'PROXIMITY',
                position: { x: this.scene.player?.x || 0, y: this.scene.player?.y || 0 }
            });
        });
    }

    destroy() {
        // Cleanup if needed
    }
}
