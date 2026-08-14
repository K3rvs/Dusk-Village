import { gameEvents } from '../utils/EventBus.js';

export class SabotageSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeLockouts = new Map();

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('ui:requestSabotageLock', (buildingId) => {
            gameEvents.emit('network:send', {
                type: 'SABOTAGE_LOCK_BUILDING',
                buildingId: buildingId
            });
        });

        gameEvents.on('ui:requestSabotagePlant', (plantData) => {
            gameEvents.emit('network:send', {
                type: 'SABOTAGE_PLANT_FRAGMENT',
                fragmentType: plantData.fragmentType,
                location: plantData.location,
                spawnTile: plantData.spawnTile
            });
        });

        gameEvents.on('building:locked', (data) => {
            this.activeLockouts.set(data.buildingId, {
                expiresAt: Date.now() + (data.duration * 1000)
            });
            
            gameEvents.emit('chat:systemMessage', {
                content: 'Alert: A building has been locked!'
            });
            
            gameEvents.emit('hud:announcement', {
                text: 'A building has been locked!',
                color: '#EF4444'
            });
        });
    }

    isBuildingLocked(buildingId) {
        const lockout = this.activeLockouts.get(buildingId);
        if (!lockout) return false;
        
        if (Date.now() > lockout.expiresAt) {
            this.activeLockouts.delete(buildingId);
            return false;
        }
        return true;
    }

    destroy() {
        this.activeLockouts.clear();
    }
}
