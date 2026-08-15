const { MYSTERIES, DECOY_FRAGMENTS_POOL } = require('./MysteryRegistry');
const { v4: uuidv4 } = require('uuid');

// Exterior walkable areas near School and Clinic only
// (excludes: player houses, village hall, village square, library)
const EXTERIOR_ACCESSIBLE_SPAWN_POINTS = [
    // -- SCHOOL EXTERIOR --
    { x: 448, y: 256, area: 'School North Gate',      location: 'EXTERIOR' },
    { x: 528, y: 256, area: 'School Front Plaza',      location: 'EXTERIOR' },
    { x: 608, y: 256, area: 'School East Entrance',   location: 'EXTERIOR' },
    { x: 464, y: 304, area: 'School West Path',        location: 'EXTERIOR' },
    { x: 640, y: 304, area: 'School East Path',        location: 'EXTERIOR' },
    { x: 496, y: 352, area: 'School South Walk W',     location: 'EXTERIOR' },
    { x: 576, y: 352, area: 'School South Walk C',     location: 'EXTERIOR' },
    { x: 624, y: 352, area: 'School South Walk E',     location: 'EXTERIOR' },

    // -- SCHOOL INTERIOR (Open Hallways & Classroom Aisles) --
    { x: null, y: null, area: 'School Hallway N',       location: 'SCHOOL', spawnTile: { x: 11, y: 9  } },
    { x: null, y: null, area: 'School Hallway S',       location: 'SCHOOL', spawnTile: { x: 11, y: 15 } },
    { x: null, y: null, area: 'School Classroom W',     location: 'SCHOOL', spawnTile: { x: 6,  y: 12 } },
    { x: null, y: null, area: 'School Classroom E',     location: 'SCHOOL', spawnTile: { x: 17, y: 12 } },
    { x: null, y: null, area: 'School South Room W',    location: 'SCHOOL', spawnTile: { x: 6,  y: 18 } },
    { x: null, y: null, area: 'School South Room E',    location: 'SCHOOL', spawnTile: { x: 17, y: 18 } },

    // -- CLINIC EXTERIOR --
    { x: 832, y: 256, area: 'Clinic North Gate',       location: 'EXTERIOR' },
    { x: 896, y: 256, area: 'Clinic Front',             location: 'EXTERIOR' },
    { x: 960, y: 256, area: 'Clinic East Entrance',    location: 'EXTERIOR' },
    { x: 816, y: 304, area: 'Clinic West Path',         location: 'EXTERIOR' },
    { x: 976, y: 304, area: 'Clinic East Path',         location: 'EXTERIOR' },
    { x: 848, y: 352, area: 'Clinic South Walk W',      location: 'EXTERIOR' },
    { x: 912, y: 352, area: 'Clinic South Walk C',      location: 'EXTERIOR' },
    { x: 944, y: 352, area: 'Clinic South Walk E',      location: 'EXTERIOR' },

    // -- CLINIC INTERIOR (Open Corridors & Walkable Floor Tiles) --
    { x: null, y: null, area: 'Clinic Corridor Center', location: 'CLINIC', spawnTile: { x: 5, y: 9  } },
    { x: null, y: null, area: 'Clinic Hallway East',    location: 'CLINIC', spawnTile: { x: 7, y: 6  } },
    { x: null, y: null, area: 'Clinic Room East',       location: 'CLINIC', spawnTile: { x: 7, y: 11 } },
    { x: null, y: null, area: 'Clinic Carpet Area',     location: 'CLINIC', spawnTile: { x: 5, y: 13 } },
    { x: null, y: null, area: 'Clinic Waiting Area',    location: 'CLINIC', spawnTile: { x: 4, y: 4  } },
];

class GameSession {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.state = 'LOBBY';
        this.players = new Map();
        this.hostId = null;
        this.currentPhase = null;
        this.currentDayNumber = 0;
        this.currentMystery = null;
        this.phaseTimer = null;
        this.timerInterval = null;
        this.phaseSecondsRemaining = 0;
        this.botInterval = null;

        // Fragment & Mystery Progression (Stage 1: CLAIM -> Stage 2: CONTEXT -> Stage 3: SOURCE -> Stage 4: SOLVED)
        this.mysteryStage = 1;
        this.deliveredFragments = { CLAIM: null, CONTEXT: null, SOURCE: null };
        this.worldFragments = new Map();
        this.pendingLockouts = [];
        this.pendingForgedFragments = [];

        // Voting & Eviction
        this.nominatedPlayerId = null;
        this.votes = new Map();
        this.pendingDaybreakReport = null;

        // History
        this.evictionHistory = [];
        this.verificationHistory = [];
    }

    addPlayer(playerId, name, ws, slot, isHost) {
        this.players.set(playerId, {
            id: playerId,
            name: name,
            ws: ws,
            slot: slot,
            isHost: isHost,
            avatarId: null,
            role: null,
            isAlive: true,
            isConnected: true,
            isReady: false,
            heldFragmentId: null,
            currentLocation: 'EXTERIOR',
            x: 0, y: 0,
            hasLockedBuildingThisNight: false,
            hasPlantedFragmentThisNight: false,
            currentVote: null
        });

        if (isHost) this.hostId = playerId;
    }

    startGame() {
        // Auto pad empty slots with AI bots up to 10 players
        const botNames = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
        const existingCount = this.players.size;
        if (existingCount < 10) {
            for (let i = existingCount; i < 10; i++) {
                const botId = `BOT_${uuidv4()}`;
                const botName = `Bot ${botNames[i - 1] || 'Player_' + (i + 1)}`;
                const slot = i + 1;
                this.addPlayer(botId, botName, null, slot, false);
                const bot = this.players.get(botId);
                bot.isBot = true;
                bot.isReady = true;
            }
        }

        this.state = 'CHARACTER_SELECT';
        this.broadcast({ type: 'GAME_STARTING', phase: 'CHARACTER_SELECT' });

        // Auto ready and character select for bots
        this.players.forEach(p => {
            if (p.isBot) {
                p.isReady = true;
                p.avatarId = String(Math.floor(Math.random() * 6) + 1).padStart(2, '0');
                this.broadcast({ type: 'CHARACTER_SELECTED', playerId: p.id, avatarId: p.avatarId });
            }
        });

        // After character select timeout, assign roles
        this.characterSelectTimer = setTimeout(() => {
            this.assignRoles();
            this.selectMystery();
            this.startRoleAssignment();

            if (Array.from(this.players.values()).some(p => p.isBot)) {
                this.startBotAI();
            }
        }, 32000);
    }

    handleStartEarly(playerId) {
        if (this.hostId !== playerId) return;
        if (this.state !== 'CHARACTER_SELECT') return;

        if (this.characterSelectTimer) {
            clearTimeout(this.characterSelectTimer);
            this.characterSelectTimer = null;
        }

        this.assignRoles();
        this.selectMystery();
        this.startRoleAssignment();

        if (Array.from(this.players.values()).some(p => p.isBot)) {
            this.startBotAI();
        }
    }

    startBotAI() {
        this.botInterval = setInterval(() => this.tickBots(), 2000);
    }

    tickBots() {
        this.players.forEach(bot => {
            if (bot.isBot && bot.isAlive) {
                if (this.currentPhase === 'DAY_PHASE') {
                    // Random wander around Village Square & Paths
                    const dx = (Math.random() - 0.5) * 40;
                    const dy = (Math.random() - 0.5) * 40;
                    bot.x = Math.max(300, Math.min(1200, (bot.x || 768) + dx));
                    bot.y = Math.max(250, Math.min(900, (bot.y || 580) + dy));

                    this.broadcast({
                        type: 'PLAYER_STATE_UPDATE',
                        playerId: bot.id,
                        x: bot.x,
                        y: bot.y,
                        direction: dx > 0 ? 'east' : 'west',
                        animation: `avatar_${bot.avatarId || '01'}_walk_${dx > 0 ? 'east' : 'west'}`
                    }, bot.id);
                } else if (this.currentPhase === 'JUDGEMENT_PHASE') {
                    // Periodic discussion messages from bots in Town Chat
                    if (Math.random() < 0.2) {
                        const livingOthers = this.getAlivePlayers().filter(p => p.id !== bot.id);
                        if (livingOthers.length > 0) {
                            const randomSuspect = livingOthers[Math.floor(Math.random() * livingOthers.length)];
                            const discussionPrompts = [
                                `I saw ${randomSuspect.name} walking suspiciously earlier.`,
                                `Who was seen near the Library verification podium?`,
                                `Let's make sure we find the Instigators!`,
                                `I think ${randomSuspect.name} might be holding fake documents.`,
                                `Remember to check the clues in the Village Hall!`,
                                `Look closely at who was roaming during the day.`,
                                `Let's cast our votes before the timer expires.`
                            ];
                            const msgText = discussionPrompts[Math.floor(Math.random() * discussionPrompts.length)];
                            this.broadcast({
                                type: 'CHAT_MESSAGE',
                                senderId: bot.id,
                                senderName: bot.name,
                                content: msgText,
                                mode: 'TOWN',
                                timestamp: Date.now()
                            });
                        }
                    }

                    if (!this.votes.has(bot.id)) {
                        const human = Array.from(this.players.values()).find(p => !p.isBot && p.isAlive);
                        let botChoice = 'SKIP';
                        if (human && this.votes.has(human.id)) {
                            const humanVote = this.votes.get(human.id);
                            if (humanVote && humanVote !== 'SKIP' && humanVote !== 'FORGIVE') {
                                botChoice = Math.random() < 0.65 ? humanVote : 'SKIP';
                            } else {
                                botChoice = 'SKIP';
                            }
                        } else {
                            if (Math.random() < 0.35) {
                                const livingOther = this.getAlivePlayers().filter(p => p.id !== bot.id);
                                if (livingOther.length > 0) {
                                    botChoice = livingOther[Math.floor(Math.random() * livingOther.length)].id;
                                }
                            }
                        }
                        this.handleVote(bot.id, botChoice);
                    }
                }
            }
        });
    }

    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const shuffled = this.fisherYatesShuffle(playerIds);

        // 3 Instigators, 7 Survivors
        const instigatorCount = 3;
        const instigators = shuffled.slice(0, instigatorCount);
        const survivors = shuffled.slice(instigatorCount);

        instigators.forEach(id => {
            const player = this.players.get(id);
            player.role = 'INSTIGATOR';
            this.sendToPlayer(id, {
                type: 'ROLE_ASSIGNED',
                role: 'INSTIGATOR',
                teammates: instigators.filter(tid => tid !== id)
            });
        });

        survivors.forEach(id => {
            const player = this.players.get(id);
            player.role = 'SURVIVOR';
            this.sendToPlayer(id, {
                type: 'ROLE_ASSIGNED',
                role: 'SURVIVOR'
            });
        });
    }

    selectMystery() {
        this.currentMystery = MYSTERIES[Math.floor(Math.random() * MYSTERIES.length)];
        this.mysteryStage = 1;
        this.deliveredFragments = { CLAIM: null, CONTEXT: null, SOURCE: null };
    }

    spawnStageFragments(stage) {
        if (stage > 3) return;
        this.mysteryStage = stage;

        // Clean up any unpicked fragments from previous stages
        this.worldFragments.forEach((frag, id) => {
            if (!frag.isPickedUp) {
                this.broadcast({ type: 'FRAGMENT_REMOVED', fragmentId: id });
                this.worldFragments.delete(id);
            }
        });

        // Shuffle all spawn points
        const availablePoints = [...EXTERIOR_ACCESSIBLE_SPAWN_POINTS].sort(() => Math.random() - 0.5);

        const stageTypeMap = { 1: 'claim', 2: 'context', 3: 'source' };
        const stageType = stageTypeMap[stage];
        const authenticData = this.currentMystery.fragments[stageType];

        const buildFragment = (id, template, isAuthentic, ptObj) => {
            const loc = ptObj.location || 'EXTERIOR';
            return {
                id,
                objectName: template.objectName || 'A mysterious document',
                title: template.title,
                description: template.description,
                clueText: template.clueText || null,
                fragmentType: stageType.toUpperCase(),
                location: loc,
                // World-space coords for EXTERIOR spawns; null for interior
                x: ptObj.x !== null ? ptObj.x : null,
                y: ptObj.y !== null ? ptObj.y : null,
                // Tile offset for SCHOOL / CLINIC interior spawns
                spawnTile: ptObj.spawnTile || null,
                isAuthentic,
                isPickedUp: false,
                heldByPlayerId: null,
                isVerified: false,
                mysteryStage: stage
            };
        };

        // 1. Authentic Stage Fragment
        const ptAuth = availablePoints.pop() || { x: 528, y: 304, location: 'EXTERIOR' };
        const authenticFrag = buildFragment(authenticData.id, authenticData, true, ptAuth);
        this.worldFragments.set(authenticFrag.id, authenticFrag);
        this.broadcast({ type: 'FRAGMENT_SPAWNED', fragment: authenticFrag });

        // 2. Spawn 3 Decoy Fragments
        const shuffledDecoys = [...DECOY_FRAGMENTS_POOL].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3; i++) {
            const ptDecoy = availablePoints.pop() || { x: 896 + (i - 1) * 32, y: 304, location: 'EXTERIOR' };
            const decoyTpl = shuffledDecoys[i] || { objectName: 'A scrap of paper', title: 'Scrap Note', description: 'Unrelated note.' };
            const decoyId = `decoy_${stage}_${i}_${uuidv4().substring(0, 6)}`;
            const decoyFrag = buildFragment(decoyId, decoyTpl, false, ptDecoy);
            this.worldFragments.set(decoyFrag.id, decoyFrag);
            this.broadcast({ type: 'FRAGMENT_SPAWNED', fragment: decoyFrag });
        }

        // Broadcast current mystery stage state
        this.broadcast({
            type: 'MYSTERY_STAGE_UPDATED',
            stage: this.mysteryStage,
            stageName: stageType.toUpperCase(),
            delivered: this.deliveredFragments
        });
    }

    startRoleAssignment() {
        this.currentPhase = 'ROLE_ASSIGNMENT';
        this.currentDayNumber = 0;
        
        // Calculate player cottage positions (Inside house for 15 seconds)
        const spawnPositions = {};
        this.players.forEach(p => {
            const cottage = this.getCottageSpawn(p.slot);
            p.x = cottage.x;
            p.y = cottage.y;
            spawnPositions[p.id] = cottage;
        });

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'ROLE_ASSIGNMENT',
            duration: 15,
            dayNumber: 1,
            spawnPositions,
            mystery: {
                id: this.currentMystery.id,
                title: this.currentMystery.title,
                narrativeIntro: this.currentMystery.narrativeIntro
            }
        });

        // 15 seconds Initiation Phase countdown
        this.startPhaseTimer(15, () => this.startDayPhase());
    }

    startDayPhase() {
        this.currentPhase = 'DAY_PHASE';
        this.currentDayNumber++;

        // Apply pending lockouts (20 seconds duration)
        this.pendingLockouts.forEach(lockout => {
            this.broadcast({
                type: 'BUILDING_LOCKED',
                buildingId: lockout.buildingId,
                duration: 20
            });
        });
        this.pendingLockouts = [];

        // Spawn pending forged fragments from night sabotages
        this.pendingForgedFragments.forEach(frag => {
            this.worldFragments.set(frag.id, frag);
            this.broadcast({ type: 'FRAGMENT_SPAWNED', fragment: frag });
        });
        this.pendingForgedFragments = [];

        // If no world fragments exist for the current mystery stage, spawn them now
        let hasActiveFragments = false;
        this.worldFragments.forEach(frag => {
            if (!frag.isPickedUp) hasActiveFragments = true;
        });
        if (!hasActiveFragments && this.mysteryStage <= 3) {
            this.spawnStageFragments(this.mysteryStage);
        } else {
            // Re-broadcast active world fragments to ensure sync
            this.worldFragments.forEach(frag => {
                if (!frag.isPickedUp) {
                    this.broadcast({ type: 'FRAGMENT_SPAWNED', fragment: frag });
                }
            });
        }

        // Teleport living players to Village Square surrounding the Angel Statue (768, 580)
        const spawnPositions = {};
        const living = this.getAlivePlayers();
        const totalLiving = living.length || 1;
        const statueRadius = 50; // px around angel statue center

        living.forEach((p, idx) => {
            const angle = (idx / totalLiving) * Math.PI * 2 - Math.PI / 2;
            p.x = Math.round(768 + Math.cos(angle) * statueRadius);
            p.y = Math.round(580 + Math.sin(angle) * statueRadius);
            p.currentLocation = 'EXTERIOR';
            spawnPositions[p.id] = { x: p.x, y: p.y };
        });

        // Reset night abilities
        this.players.forEach(p => {
            p.hasLockedBuildingThisNight = false;
            p.hasPlantedFragmentThisNight = false;
        });

        // Apply pending eviction and deliver Daybreak Report on the morning of the new Day Phase
        if (this.pendingEviction) {
            const ev = this.pendingEviction;
            const target = this.players.get(ev.playerId);
            if (target) {
                target.isAlive = false;
                this.evictionHistory.push({
                    playerId: target.id,
                    playerName: target.name,
                    role: target.role,
                    day: ev.day
                });

                this.broadcast({
                    type: 'PLAYER_EVICTED',
                    playerId: target.id,
                    playerName: target.name,
                    role: target.role
                });
            }
            this.pendingEviction = null;
        }

        if (this.pendingDaybreakReport) {
            const rpt = this.pendingDaybreakReport;
            this.broadcast({
                type: 'DAYBREAK_REPORT',
                report: rpt
            });
            this.broadcast({
                type: 'CHAT_MESSAGE',
                senderId: 'SYSTEM',
                senderName: 'COUNCIL REPORT',
                content: rpt.message,
                mode: 'TOWN',
                timestamp: Date.now()
            });
            this.broadcast({
                type: 'hud:announcement',
                text: rpt.shortText,
                color: rpt.color
            });
            this.pendingDaybreakReport = null;

            const winCheck = this.checkWinConditions();
            if (winCheck.isGameOver) {
                this.endGame(winCheck.winner, winCheck.reason);
                return;
            }
        }

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'DAY_PHASE',
            duration: 150, // 2 minutes and 30 seconds
            dayNumber: this.currentDayNumber,
            spawnPositions,
            mystery: {
                id: this.currentMystery.id,
                title: this.currentMystery.title,
                narrativeIntro: this.currentMystery.narrativeIntro
            }
        });

        // 2m 30s Day Phase countdown
        this.startPhaseTimer(150, () => this.startJudgementPhase());
    }

    startJudgementPhase() {
        this.currentPhase = 'JUDGEMENT_PHASE';
        this.nominatedPlayerId = null;
        this.votes.clear();

        // Teleport all living players around the Village Square Plaza (760, 580) in a council circle
        const spawnPositions = {};
        const living = this.getAlivePlayers();
        const total = living.length || 1;
        const radius = 54;
        const centerX = 768;
        const centerY = 580;

        living.forEach((p, idx) => {
            const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
            p.x = Math.round(centerX + Math.cos(angle) * radius);
            p.y = Math.round(centerY + Math.sin(angle) * radius);
            p.currentLocation = 'EXTERIOR';
            spawnPositions[p.id] = { x: p.x, y: p.y };
        });

        const livingList = living.map(p => ({
            id: p.id,
            name: p.name,
            slot: p.slot,
            avatarId: p.avatarId,
            isBot: !!p.isBot
        }));

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'JUDGEMENT_PHASE',
            duration: 60, // 1 minute
            dayNumber: this.currentDayNumber,
            livingPlayers: livingList,
            spawnPositions
        });

        // 60 seconds Judgement Phase countdown
        this.startPhaseTimer(60, () => this.resolveJudgement());
    }

    resolveJudgement() {
        const livingPlayers = this.getAlivePlayers();
        const voteCounts = new Map(); // choice -> count

        this.votes.forEach((choice) => {
            const cur = voteCounts.get(choice) || 0;
            voteCounts.set(choice, cur + 1);
        });

        let topCandidate = null;
        let maxVotes = 0;
        const skipVotes = (voteCounts.get('SKIP') || 0) + (voteCounts.get('FORGIVE') || 0);

        voteCounts.forEach((count, choice) => {
            if (choice !== 'SKIP' && choice !== 'FORGIVE') {
                if (count > maxVotes) {
                    maxVotes = count;
                    topCandidate = choice;
                }
            }
        });

        // In custom rooms with bots, the human player's vote determines the council's verdict
        const human = Array.from(this.players.values()).find(p => !p.isBot && p.isAlive);
        if (human && this.votes.has(human.id)) {
            const hChoice = this.votes.get(human.id);
            if (hChoice && hChoice !== 'SKIP' && hChoice !== 'FORGIVE') {
                topCandidate = hChoice;
                maxVotes = Math.max(maxVotes, skipVotes + 1);
            } else if (hChoice === 'SKIP' || hChoice === 'FORGIVE') {
                topCandidate = null;
            }
        }

        if (topCandidate && maxVotes > 0) {
            const target = this.players.get(topCandidate);
            if (target && target.isAlive) {
                const isInstigator = target.role === 'INSTIGATOR';
                this.pendingEviction = {
                    playerId: target.id,
                    playerName: target.name,
                    role: target.role,
                    day: this.currentDayNumber
                };
                this.pendingDaybreakReport = {
                    evicted: true,
                    playerId: target.id,
                    playerName: target.name,
                    role: target.role,
                    votes: maxVotes,
                    message: `📢 [DAYBREAK REPORT] ${target.name} was banished by the council! Secret role revealed: ${target.role}.`,
                    shortText: `EVICTED: ${target.name} (${target.role})`,
                    color: isInstigator ? '#10B981' : '#EF4444'
                };
            } else {
                this.pendingDaybreakReport = {
                    evicted: false,
                    message: `📢 [DAYBREAK REPORT] The council chose not to banish anyone last night.`,
                    shortText: `COUNCIL TIED / SKIPPED`,
                    color: '#94A3B8'
                };
            }
        } else {
            this.pendingDaybreakReport = {
                evicted: false,
                message: `📢 [DAYBREAK REPORT] The council chose not to banish anyone last night.`,
                shortText: `COUNCIL TIED / SKIPPED`,
                color: '#94A3B8'
            };
        }

        this.startNightPhase();
    }

    startNightPhase() {
        this.currentPhase = 'NIGHT_PHASE';

        // Survivors return to their cottages
        const spawnPositions = {};
        this.players.forEach(p => {
            if (p.isAlive) {
                const cottage = this.getCottageSpawn(p.slot);
                p.x = cottage.x;
                p.y = cottage.y;
                spawnPositions[p.id] = cottage;
            }
        });

        this.broadcast({
            type: 'PHASE_CHANGE',
            phase: 'NIGHT_PHASE',
            duration: 30, // 30 seconds Night Phase
            dayNumber: this.currentDayNumber,
            spawnPositions
        });

        // 30 seconds Night Phase countdown
        this.startPhaseTimer(30, () => this.startDayPhase());
    }

    startPhaseTimer(durationSeconds, nextPhaseCallback) {
        if (this.phaseTimer) clearTimeout(this.phaseTimer);
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.phaseSecondsRemaining = durationSeconds;

        this.timerInterval = setInterval(() => {
            this.phaseSecondsRemaining--;
            if (this.phaseSecondsRemaining < 0) this.phaseSecondsRemaining = 0;

            // Broadcast periodic timer sync every 5 seconds or when critical
            if (this.phaseSecondsRemaining % 5 === 0 || this.phaseSecondsRemaining <= 10) {
                this.broadcast({
                    type: 'TIME_SYNC',
                    phase: this.currentPhase,
                    remaining: this.phaseSecondsRemaining,
                    total: durationSeconds
                });
            }

            if (this.phaseSecondsRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }, 1000);

        this.phaseTimer = setTimeout(() => {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            nextPhaseCallback();
        }, durationSeconds * 1000);
    }

    checkWinConditions() {
        const livingPlayers = this.getAlivePlayers();
        const livingInstigators = livingPlayers.filter(p => p.role === 'INSTIGATOR');
        const livingSurvivors = livingPlayers.filter(p => p.role === 'SURVIVOR');

        // Survivors win if all Instigators are banished
        if (livingInstigators.length === 0) {
            return {
                isGameOver: true,
                winner: 'SURVIVOR',
                reason: 'All Instigators have been banished from Dusk Village!'
            };
        }

        // Instigators win if Instigators equal or exceed Survivors (e.g. 2 vs 2)
        if (livingInstigators.length >= livingSurvivors.length) {
            return {
                isGameOver: true,
                winner: 'INSTIGATOR',
                reason: 'The Instigators equal or outnumber the Survivors!'
            };
        }

        return { isGameOver: false };
    }

    endGame(winner, reason) {
        this.state = 'GAME_OVER';
        if (this.phaseTimer) clearTimeout(this.phaseTimer);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.botInterval) clearInterval(this.botInterval);

        this.broadcast({
            type: 'GAME_OVER',
            winner: winner,
            reason: reason,
            roleReveal: this.getRoleRevealData(),
            mysteryResult: {
                solved: this.mysteryStage > 3,
                claim: this.deliveredFragments.CLAIM,
                context: this.deliveredFragments.CONTEXT,
                source: this.deliveredFragments.SOURCE
            }
        });
    }

    getRoleRevealData() {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            isAlive: p.isAlive,
            avatarId: p.avatarId
        }));
    }

    handleVerification(playerAId, playerBId) {
        const playerA = this.players.get(playerAId);
        const playerB = this.players.get(playerBId);
        if (!playerA) return;

        const targetPlayer = playerA.heldFragmentId ? playerA : (playerB && playerB.heldFragmentId ? playerB : null);
        if (!targetPlayer || !targetPlayer.heldFragmentId) return;

        const fragment = this.worldFragments.get(targetPlayer.heldFragmentId) ||
                         this.getHeldFragment(targetPlayer.heldFragmentId);
        if (!fragment) return;

        fragment.isVerified = true;
        const isAuth = !!fragment.isAuthentic;

        const resultMsg = {
            type: 'VERIFICATION_RESULT',
            fragmentId: fragment.id,
            objectName: fragment.objectName,
            title: fragment.title,
            description: fragment.description,
            clueText: fragment.clueText || null,
            fragmentType: fragment.fragmentType,
            isAuthentic: isAuth,
            playerId: targetPlayer.id
        };

        if (!isAuth) {
            // Fake / Irrelevant fragment! Automatically disappears after verification
            targetPlayer.heldFragmentId = null;
            fragment.isPickedUp = false;
            this.worldFragments.delete(fragment.id);
        }

        this.broadcast(resultMsg);
    }

    handleFragmentDelivery(playerId) {
        const player = this.players.get(playerId);
        if (!player || !player.heldFragmentId) return;

        const fragment = this.worldFragments.get(player.heldFragmentId) ||
                         this.getHeldFragment(player.heldFragmentId);
        if (!fragment) return;

        if (!fragment.isVerified) {
            this.sendToPlayer(playerId, {
                type: 'DELIVERY_ERROR',
                message: 'You must verify this fragment at the Library before delivering it to Village Hall!'
            });
            return;
        }

        if (!fragment.isAuthentic) {
            this.sendToPlayer(playerId, {
                type: 'DELIVERY_ERROR',
                message: 'This is an irrelevant decoy document! Only authentic mystery clues can be archived.'
            });
            return;
        }

        const stageTypeMap = { 1: 'CLAIM', 2: 'CONTEXT', 3: 'SOURCE' };
        const requiredType = stageTypeMap[this.mysteryStage];

        if (fragment.fragmentType !== requiredType) {
            this.sendToPlayer(playerId, {
                type: 'DELIVERY_ERROR',
                message: `Village Hall currently requires the ${requiredType} clue for Stage ${this.mysteryStage}!`
            });
            return;
        }

        // Successfully delivered!
        this.deliveredFragments[requiredType] = fragment.title;
        player.heldFragmentId = null;
        fragment.isPickedUp = false;
        this.worldFragments.delete(fragment.id);

        this.broadcast({
            type: 'FRAGMENT_DELIVERED_SUCCESS',
            playerId: playerId,
            playerName: player.name,
            deliveredType: requiredType,
            fragmentTitle: fragment.title,
            delivered: this.deliveredFragments
        });

        if (this.mysteryStage === 1) {
            this.broadcast({
                type: 'CHAT_MESSAGE',
                senderId: 'SYSTEM',
                senderName: 'VILLAGE ARCHIVE',
                content: `📢 [STAGE 1 COMPLETE] "${fragment.title}" recorded! Stage 2 Fragment (CONTEXT) has appeared in the village!`,
                mode: 'TOWN',
                timestamp: Date.now()
            });
            this.spawnStageFragments(2);
        } else if (this.mysteryStage === 2) {
            this.broadcast({
                type: 'CHAT_MESSAGE',
                senderId: 'SYSTEM',
                senderName: 'VILLAGE ARCHIVE',
                content: `📢 [STAGE 2 COMPLETE] "${fragment.title}" recorded! Stage 3 Fragment (SOURCE) has appeared in the village!`,
                mode: 'TOWN',
                timestamp: Date.now()
            });
            this.spawnStageFragments(3);
        } else if (this.mysteryStage === 3) {
            this.mysteryStage = 4;
            this.broadcast({
                type: 'CHAT_MESSAGE',
                senderId: 'SYSTEM',
                senderName: 'VILLAGE ARCHIVE',
                content: `🏆 [MYSTERY SOLVED] All 3 clues verified in Village Hall! The full truth has been proven!`,
                mode: 'TOWN',
                timestamp: Date.now()
            });

            this.endGame('SURVIVOR', 'The Survivors successfully solved the Mystery at the Village Hall!');
        }
    }

    handleNomination(nominatorId, targetId) {
        if (this.currentPhase !== 'JUDGEMENT_PHASE') return;
        if (this.nominatedPlayerId) return;
        if (nominatorId === targetId) return;

        const target = this.players.get(targetId);
        if (!target || !target.isAlive) return;

        this.nominatedPlayerId = targetId;

        this.broadcast({
            type: 'VOTE_NOMINATION',
            nominatorId: nominatorId,
            nominatedPlayerId: targetId,
            nominatedPlayerName: target.name
        });
    }

    handleVote(voterId, choice) {
        if (this.currentPhase !== 'JUDGEMENT_PHASE') return;
        const voter = this.players.get(voterId);
        if (!voter || !voter.isAlive) return;

        this.votes.set(voterId, choice);

        this.broadcast({
            type: 'VOTE_CAST_UPDATE',
            voterId: voterId,
            choice: choice,
            totalVotesCast: this.votes.size,
            totalVoters: this.getAlivePlayers().length
        });
    }

    handleChat(senderId, chatData) {
        const sender = this.players.get(senderId);
        if (!sender || !sender.isAlive) return;

        const message = {
            type: 'CHAT_MESSAGE',
            senderId: senderId,
            senderName: sender.name,
            content: chatData.content.substring(0, 256),
            mode: chatData.mode,
            position: chatData.position,
            timestamp: Date.now()
        };

        switch (chatData.mode) {
            case 'PROXIMITY':
                this.players.forEach(player => {
                    if (player.isAlive && player.isConnected) {
                        const dist = Math.sqrt(
                            (player.x - chatData.position.x) ** 2 +
                            (player.y - chatData.position.y) ** 2
                        );
                        if (dist <= 64 || player.id === senderId) {
                            this.sendToPlayer(player.id, message);
                        }
                    }
                });
                break;

            case 'TOWN':
                this.getAlivePlayers().forEach(p => this.sendToPlayer(p.id, message));
                break;

            case 'INSTIGATOR':
                if (sender.role !== 'INSTIGATOR') return;
                this.players.forEach(p => {
                    if (p.role === 'INSTIGATOR' && p.isConnected) {
                        this.sendToPlayer(p.id, message);
                    }
                });
                break;
        }
    }

    handlePlayerMove(playerId, moveData) {
        const player = this.players.get(playerId);
        if (!player) return;

        if (this.currentPhase === 'DAY_PHASE' ||
            (this.currentPhase === 'NIGHT_PHASE' && player.role === 'INSTIGATOR')) {
            player.x = moveData.x;
            player.y = moveData.y;

            this.broadcast({
                type: 'PLAYER_STATE_UPDATE',
                playerId: playerId,
                x: moveData.x,
                y: moveData.y,
                direction: moveData.direction,
                animation: moveData.animation
            }, playerId);
        }
    }

    handleFragmentPickup(playerId, fragmentId) {
        const player = this.players.get(playerId);
        const fragment = this.worldFragments.get(fragmentId);
        if (!player || !fragment || fragment.isPickedUp) return;
        if (this.currentPhase !== 'DAY_PHASE') return;

        if (player.heldFragmentId) {
            this.handleFragmentDrop(playerId, { x: player.x, y: player.y });
        }

        fragment.isPickedUp = true;
        fragment.heldByPlayerId = playerId;
        player.heldFragmentId = fragmentId;

        this.broadcast({
            type: 'FRAGMENT_PICKED_UP',
            playerId: playerId,
            fragmentId: fragmentId,
            objectName: fragment.objectName || fragment.title,
            isVerified: fragment.isVerified,
            title: fragment.title,
            description: fragment.description,
            fragmentType: fragment.fragmentType
        });
    }

    handleFragmentDrop(playerId, position, location = 'EXTERIOR') {
        const player = this.players.get(playerId);
        if (!player || !player.heldFragmentId) return;

        const fragment = this.worldFragments.get(player.heldFragmentId) ||
                         this.getHeldFragment(player.heldFragmentId);
        if (fragment) {
            fragment.isPickedUp = false;
            fragment.heldByPlayerId = null;
            fragment.x = position.x;
            fragment.y = position.y;
            fragment.location = location;
            if (location !== 'EXTERIOR') {
                fragment.spawnTile = {
                    x: Math.max(1, Math.round(position.x / 16)),
                    y: Math.max(1, Math.round(position.y / 16))
                };
            }
            this.worldFragments.set(fragment.id, fragment);
        }

        const droppedFragId = player.heldFragmentId;
        player.heldFragmentId = null;

        this.broadcast({
            type: 'FRAGMENT_DROPPED',
            playerId: playerId,
            fragmentId: droppedFragId,
            fragment: fragment,
            position: position,
            location: location
        });
    }

    handleSabotageLock(instigatorId, buildingId) {
        const player = this.players.get(instigatorId);
        if (!player || player.role !== 'INSTIGATOR') return;
        if (this.currentPhase !== 'NIGHT_PHASE') return;
        if (player.hasLockedBuildingThisNight) return;

        player.hasLockedBuildingThisNight = true;
        this.pendingLockouts.push({ buildingId, instigatorId, lockDuration: 20000 }); // 20s lock duration

        this.sendToPlayer(instigatorId, {
            type: 'SABOTAGE_CONFIRMED',
            action: 'LOCK',
            buildingId: buildingId
        });
    }

    handleSabotagePlant(instigatorId, plantData) {
        const player = this.players.get(instigatorId);
        if (!player || player.role !== 'INSTIGATOR') return;
        if (this.currentPhase !== 'NIGHT_PHASE') return;
        if (player.hasPlantedFragmentThisNight) return;

        player.hasPlantedFragmentThisNight = true;
        const mystery = this.currentMystery;
        const type = (plantData.fragmentType || 'claim').toLowerCase();
        const authentic = mystery.fragments[type];

        const forgedFragment = {
            id: `forged_${uuidv4().substring(0, 8)}`,
            objectName: `A suspicious ${type} document`,
            title: `Fabricated ${authentic.title}`,
            description: `A forged document planted by an Instigator to mislead the survivors.`,
            fragmentType: type.toUpperCase(),
            location: 'EXTERIOR',
            x: plantData.x || 768,
            y: plantData.y || 580,
            isAuthentic: false,
            isPickedUp: false,
            heldByPlayerId: null,
            isVerified: false,
            plantedByInstigatorId: instigatorId
        };

        this.pendingForgedFragments.push(forgedFragment);

        this.sendToPlayer(instigatorId, {
            type: 'SABOTAGE_CONFIRMED',
            action: 'PLANT',
            fragmentType: plantData.fragmentType
        });
    }

    handleDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.isConnected = false;
            this.broadcast({
                type: 'PLAYER_DISCONNECTED',
                playerId: playerId
            });

            setTimeout(() => {
                if (!player.isConnected) {
                    this.broadcast({
                        type: 'PLAYER_BOT_TAKEOVER',
                        playerId: playerId
                    });
                }
            }, 30000);
        }
    }

    // === UTILITY METHODS ===

    getCottageSpawn(slot) {
        const cottageSpawns = {
            1:  { id: 'HOUSE_H01', x: 216,  y: 184 },
            2:  { id: 'HOUSE_H02', x: 376,  y: 184 },
            3:  { id: 'HOUSE_H03', x: 1144, y: 184 },
            4:  { id: 'HOUSE_H04', x: 1304, y: 184 },
            5:  { id: 'HOUSE_H05', x: 216,  y: 920 },
            6:  { id: 'HOUSE_H06', x: 376,  y: 920 },
            7:  { id: 'HOUSE_H07', x: 536,  y: 920 },
            8:  { id: 'HOUSE_H08', x: 984,  y: 920 },
            9:  { id: 'HOUSE_H09', x: 1144, y: 920 },
            10: { id: 'HOUSE_H10', x: 1304, y: 920 }
        };
        return cottageSpawns[slot] || cottageSpawns[1];
    }

    getAlivePlayers() {
        return Array.from(this.players.values()).filter(p => p.isAlive);
    }

    getNextAvailableSlot() {
        const usedSlots = new Set(Array.from(this.players.values()).map(p => p.slot));
        for (let i = 1; i <= 10; i++) {
            if (!usedSlots.has(i)) return i;
        }
        return null;
    }

    getPlayerList() {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            slot: p.slot,
            isReady: p.isReady,
            avatarId: p.avatarId,
            isBot: p.isBot || false
        }));
    }

    getHeldFragment(fragmentId) {
        for (const [id, frag] of this.worldFragments) {
            if (id === fragmentId) return frag;
        }
        return null;
    }

    broadcast(message, excludeId = null) {
        const json = JSON.stringify(message);
        this.players.forEach(player => {
            if (player.id !== excludeId && player.isConnected && player.ws) {
                try {
                    player.ws.send(json);
                } catch (err) {
                    console.error('Send error:', err);
                }
            }
        });
    }

    sendToPlayer(playerId, message) {
        const player = this.players.get(playerId);
        if (player && player.isConnected && player.ws) {
            try {
                player.ws.send(JSON.stringify(message));
            } catch (err) {
                console.error('Send error:', err);
            }
        }
    }

    setPlayerReady(roomCode, playerId, isReady) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = isReady;
            this.broadcast({ type: 'PLAYER_READY', playerId, isReady });
        }
    }

    setCharacter(roomCode, playerId, avatarId) {
        const player = this.players.get(playerId);
        if (player) {
            player.avatarId = avatarId;
            this.broadcast({ type: 'CHARACTER_SELECTED', playerId, avatarId });
        }
    }

    fisherYatesShuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

module.exports = { GameSession };
