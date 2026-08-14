import { gameEvents } from '../utils/EventBus.js';

export class SocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(url = `ws://${window.location.hostname}:3000/ws`) {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            gameEvents.emit('network:connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (err) {
                console.error('Parse error:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            gameEvents.emit('network:disconnected');
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Listen for outgoing messages
        gameEvents.on('network:send', (data) => this.send(data));
    }

    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'ROOM_CREATED':
                this.currentRoom = message;
                gameEvents.emit('lobby:roomCreated', message);
                break;
            case 'ROOM_JOINED':
                this.currentRoom = message;
                gameEvents.emit('lobby:roomJoined', message);
                break;
            case 'PLAYER_JOINED': gameEvents.emit('lobby:playerJoined', message); break;
            case 'PLAYER_LEFT': gameEvents.emit('lobby:playerLeft', message); break;
            case 'PLAYER_READY': gameEvents.emit('lobby:playerReady', message); break;
            case 'GAME_STARTING': gameEvents.emit('game:starting', message); break;
            case 'ROLE_ASSIGNED': gameEvents.emit('role:assigned', message); break;
            case 'PHASE_CHANGE': gameEvents.emit('phase:serverChanged', message); break;
            case 'PLAYER_STATE_UPDATE': gameEvents.emit('player:remoteUpdate', message); break;
            case 'FRAGMENT_SPAWNED': gameEvents.emit('fragment:spawned', message); break;
            case 'FRAGMENT_REMOVED': gameEvents.emit('fragment:removed', message); break;
            case 'FRAGMENT_PICKED_UP': gameEvents.emit('fragment:pickedUpConfirmed', message); break;
            case 'FRAGMENT_DROPPED': gameEvents.emit('fragment:droppedConfirmed', message); break;
            case 'VERIFICATION_RESULT': gameEvents.emit('fragment:verifiedResult', message); break;
            case 'FRAGMENT_DELIVERED_SUCCESS': gameEvents.emit('fragment:deliveredSuccess', message); break;
            case 'MYSTERY_STAGE_UPDATED': gameEvents.emit('mystery:stageUpdated', message); break;
            case 'DELIVERY_ERROR': gameEvents.emit('hud:announcement', { text: message.message, color: '#EF4444' }); break;
            case 'TIME_SYNC': gameEvents.emit('phase:timeSync', message); break;
            case 'VOTE_NOMINATION': gameEvents.emit('vote:nominationReceived', message); break;
            case 'VOTE_CAST_UPDATE': gameEvents.emit('vote:castUpdate', message); break;
            case 'VOTE_RESULT': gameEvents.emit('vote:resultReceived', message); break;
            case 'PLAYER_EVICTED': gameEvents.emit('player:evicted', message); break;
            case 'CHAT_MESSAGE': gameEvents.emit('chat:received', message); break;
            case 'BUILDING_LOCKED': gameEvents.emit('building:locked', message); break;
            case 'GAME_OVER': gameEvents.emit('game:overReceived', message); break;
            case 'SOLVE_FAILED': gameEvents.emit('mystery:solveFailed', message); break;
            default: console.warn('Unknown server message:', message.type);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
