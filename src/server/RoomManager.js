const { v4: uuidv4 } = require('uuid');
const { GameSession } = require('./GameSession');

class RoomManager {
    constructor() {
        this.rooms = new Map();  // roomCode -> GameSession
    }

    createRoom(ws, playerName, isCustom = false) {
        const code = this.generateRoomCode();
        const playerId = uuidv4();

        const session = new GameSession(code);
        session.isCustom = isCustom;
        session.addPlayer(playerId, playerName, ws, 1, true);

        if (isCustom) {
            // Spawn 9 bot players
            const botNames = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan'];
            for (let i = 0; i < 9; i++) {
                const botId = `BOT_${uuidv4()}`;
                session.addPlayer(botId, `Bot ${botNames[i]}`, null, i + 2, false);
                const bot = session.players.get(botId);
                bot.isBot = true;
                bot.isReady = true;
            }
        }

        this.rooms.set(code, session);

        return { code, hostId: playerId };
    }

    joinRoom(roomCode, ws, playerName) {
        const session = this.rooms.get(roomCode);
        if (!session) return { success: false, reason: 'Room not found' };
        if (session.state !== 'LOBBY') return { success: false, reason: 'Game already in progress' };

        // Check if there is a bot to replace or an open slot
        let botToReplace = null;
        let humanCount = 0;
        session.players.forEach(p => {
            if (p.isBot && !botToReplace) botToReplace = p;
            if (!p.isBot) humanCount++;
        });

        if (humanCount >= 10) return { success: false, reason: 'Room is full' };

        const playerId = uuidv4();
        let slot;

        if (botToReplace) {
            slot = botToReplace.slot;
            session.players.delete(botToReplace.id);
            session.addPlayer(playerId, playerName, ws, slot, false);
        } else {
            if (session.players.size >= 10) return { success: false, reason: 'Room is full' };
            slot = session.getNextAvailableSlot();
            session.addPlayer(playerId, playerName, ws, slot, false);
        }

        return {
            success: true,
            playerId,
            slot,
            currentPlayers: session.getPlayerList()
        };
    }

    startGame(roomCode, hostId) {
        const session = this.rooms.get(roomCode);
        if (!session) return;
        if (session.hostId !== hostId) return;
        // In debug mode, allow fewer players
        if (session.players.size < 1) return;

        session.startGame();
    }

    handleStartEarly(roomCode, hostId) {
        const session = this.rooms.get(roomCode);
        if (!session) return;
        session.handleStartEarly(hostId);
    }

    broadcast(roomCode, message, excludeId = null) {
        const session = this.rooms.get(roomCode);
        if (!session) return;
        session.broadcast(message, excludeId);
    }

    setPlayerReady(roomCode, playerId, isReady) {
        const session = this.rooms.get(roomCode);
        if (session) session.setPlayerReady(roomCode, playerId, isReady);
    }

    setCharacter(roomCode, playerId, avatarId) {
        const session = this.rooms.get(roomCode);
        if (session) session.setCharacter(roomCode, playerId, avatarId);
    }

    handlePlayerMove(roomCode, playerId, moveData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handlePlayerMove(playerId, moveData);
    }

    handleFragmentPickup(roomCode, playerId, fragmentId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleFragmentPickup(playerId, fragmentId);
    }

    handleFragmentDrop(roomCode, playerId, position, location = 'EXTERIOR') {
        const session = this.rooms.get(roomCode);
        if (session) session.handleFragmentDrop(playerId, position, location);
    }

    handleVerification(roomCode, playerAId, playerBId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleVerification(playerAId, playerBId);
    }

    handleNomination(roomCode, nominatorId, targetId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleNomination(nominatorId, targetId);
    }

    handleVote(roomCode, voterId, choice) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleVote(voterId, choice);
    }

    handleChat(roomCode, senderId, chatData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleChat(senderId, chatData);
    }

    handleSolveAttempt(roomCode, playerId, solveData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSolveAttempt(playerId, solveData);
    }

    handleSabotageLock(roomCode, instigatorId, buildingId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSabotageLock(instigatorId, buildingId);
    }

    handleSabotagePlant(roomCode, instigatorId, plantData) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleSabotagePlant(instigatorId, plantData);
    }

    handleFragmentDelivery(roomCode, playerId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleFragmentDelivery(playerId);
    }

    handleDisconnect(roomCode, playerId) {
        const session = this.rooms.get(roomCode);
        if (session) session.handleDisconnect(playerId);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code;
        do {
            code = 'DV-';
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }
}

module.exports = { RoomManager };
