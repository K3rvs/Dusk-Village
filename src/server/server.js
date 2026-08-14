const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { RoomManager } = require('./RoomManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Serve static files (production)
app.use(express.static(path.join(__dirname, '../../dist')));
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json({ limit: '10mb' }));

// Save map layout endpoint (for map editor "Save to Server" button)
const fs = require('fs');
app.post('/save-layout', (req, res) => {
    try {
        const layoutData = req.body;
        const targetMap = layoutData.targetMap || 'village_exterior';
        const json = JSON.stringify(layoutData, null, 2);
        
        if (targetMap === 'village_exterior') {
            const targets = [
                path.join(__dirname, '../../village_layout.json'),
                path.join(__dirname, '../../public/village_layout.json'),
                path.join(__dirname, '../../village_exterior.json')
            ];
            targets.forEach(p => fs.writeFileSync(p, json));
            console.log('[map-editor] Saved village_layout.json (' + layoutData.width + 'x' + layoutData.height + ')');
        } else {
            const fileName = `${targetMap}.json`;
            const targets = [
                path.join(__dirname, '../../assets/tilemaps', fileName),
                path.join(__dirname, '../../public', fileName)
            ];
            targets.forEach(p => fs.writeFileSync(p, json));
            console.log('[map-editor] Saved interior layout ' + fileName);
        }
        res.json({ ok: true });
    } catch (err) {
        console.error('[map-editor] Save failed:', err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Room Manager
const roomManager = new RoomManager();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
    let playerId = null;
    let roomCode = null;

    ws.on('message', (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage);
            handleMessage(ws, message);
        } catch (err) {
            console.error('Invalid message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected:', playerId);
        if (roomCode && playerId) {
            roomManager.handleDisconnect(roomCode, playerId);
        }
    });

    function handleMessage(ws, message) {
        switch (message.type) {
            case 'CREATE_ROOM':
            case 'CREATE_CUSTOM_ROOM': {
                const isCustom = message.type === 'CREATE_CUSTOM_ROOM';
                const room = roomManager.createRoom(ws, message.playerName, isCustom);
                playerId = room.hostId;
                roomCode = room.code;
                const session = roomManager.rooms.get(roomCode);
                ws.send(JSON.stringify({
                    type: 'ROOM_CREATED',
                    roomCode: room.code,
                    playerId: playerId,
                    slot: 1,
                    isCustom: isCustom,
                    players: session ? session.getPlayerList() : []
                }));
                break;
            }

            case 'JOIN_ROOM': {
                const joinResult = roomManager.joinRoom(message.roomCode, ws, message.playerName);
                if (joinResult.success) {
                    playerId = joinResult.playerId;
                    roomCode = message.roomCode;
                    ws.send(JSON.stringify({
                        type: 'ROOM_JOINED',
                        playerId: playerId,
                        slot: joinResult.slot,
                        players: joinResult.currentPlayers
                    }));
                    roomManager.broadcast(roomCode, {
                        type: 'PLAYER_JOINED',
                        playerId: playerId,
                        playerName: message.playerName,
                        slot: joinResult.slot
                    }, playerId);
                } else {
                    ws.send(JSON.stringify({
                        type: 'JOIN_ERROR',
                        reason: joinResult.reason
                    }));
                }
                break;
            }

            case 'PLAYER_READY':
                roomManager.setPlayerReady(roomCode, playerId, message.isReady);
                break;

            case 'START_GAME':
                roomManager.startGame(roomCode, playerId);
                break;

            case 'START_EARLY':
                roomManager.handleStartEarly(roomCode, playerId);
                break;

            case 'CHARACTER_SELECTED':
                roomManager.setCharacter(roomCode, playerId, message.avatarId);
                break;

            case 'PLAYER_MOVE':
                roomManager.handlePlayerMove(roomCode, playerId, message);
                break;

            case 'FRAGMENT_PICKUP':
                roomManager.handleFragmentPickup(roomCode, playerId, message.fragmentId);
                break;

            case 'FRAGMENT_DROP':
                roomManager.handleFragmentDrop(roomCode, playerId, message.position);
                break;

            case 'VERIFICATION_COMPLETE':
                roomManager.handleVerification(roomCode, message.playerAId, message.playerBId);
                break;

            case 'FRAGMENT_DELIVER':
                roomManager.handleFragmentDelivery(roomCode, playerId);
                break;

            case 'VOTE_NOMINATE':
                roomManager.handleNomination(roomCode, playerId, message.targetId);
                break;

            case 'VOTE_CAST':
                roomManager.handleVote(roomCode, playerId, message.choice);
                break;

            case 'CHAT_SEND':
                roomManager.handleChat(roomCode, playerId, message);
                break;

            case 'SOLVE_ATTEMPT':
                roomManager.handleSolveAttempt(roomCode, playerId, message);
                break;

            case 'SABOTAGE_LOCK_BUILDING':
                roomManager.handleSabotageLock(roomCode, playerId, message.buildingId);
                break;

            case 'SABOTAGE_PLANT_FRAGMENT':
                roomManager.handleSabotagePlant(roomCode, playerId, message);
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Dusk Village server running on port ${PORT}`);
});
