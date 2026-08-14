import { gameEvents } from '../utils/EventBus.js';

export class VotingSystem {
    constructor(scene) {
        this.scene = scene;
        this.isVotingActive = false;
        this.nominatedPlayerId = null;
        this.localVote = null;
        this.voteResults = { ban: 0, forgive: 0, total: 0 };

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('vote:nominationReceived', (data) => {
            this.startVoting(data.nominatedPlayerId, data.nominatedPlayerName);
        });

        gameEvents.on('vote:resultReceived', (data) => {
            this.resolveVoting(data);
        });
    }

    nominate(targetPlayerId) {
        gameEvents.emit('network:send', {
            type: 'VOTE_NOMINATE',
            nominatorId: this.scene.localPlayerId,
            targetId: targetPlayerId
        });
    }

    startVoting(nominatedPlayerId, nominatedPlayerName) {
        this.isVotingActive = true;
        this.nominatedPlayerId = nominatedPlayerId;
        this.localVote = null;

        gameEvents.emit('ui:showVotingModal', {
            nominatedPlayerId,
            nominatedPlayerName,
            totalVoters: this.scene.allPlayers.filter(p => p.isAlive).length
        });
    }

    castVote(choice) {
        if (!this.isVotingActive || this.localVote !== null) return;

        this.localVote = choice;

        gameEvents.emit('network:send', {
            type: 'VOTE_CAST',
            voterId: this.scene.localPlayerId,
            choice: choice  // 'BAN' or 'FORGIVE'
        });

        gameEvents.emit('ui:voteCast', { choice });
    }

    resolveVoting(data) {
        this.isVotingActive = false;
        this.voteResults = {
            ban: data.banVotes,
            forgive: data.forgiveVotes,
            total: data.totalVoters,
            result: data.result  // 'EVICTED' | 'FORGIVEN' | 'SKIPPED'
        };

        gameEvents.emit('ui:voteResolved', data);

        if (data.result === 'EVICTED') {
            gameEvents.emit('player:evicted', {
                playerId: data.nominatedPlayerId,
                day: data.currentDay
            });
        }
    }

    destroy() {
        // Cleanup
    }
}
