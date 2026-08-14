import { MemoryFragment } from '../entities/MemoryFragment.js';
import { gameEvents } from '../utils/EventBus.js';

export class FragmentManager {
    constructor(scene) {
        this.scene = scene;
        this.worldFragments = new Map();  // id -> MemoryFragment
        this.heldFragments = new Map();   // playerId -> MemoryFragment

        this.setupEventListeners();
    }

    setupEventListeners() {
        gameEvents.on('fragment:spawned', (data) => this.spawnFragment(data));
        gameEvents.on('fragment:removed', (data) => this.removeFragment(data.fragmentId));
        gameEvents.on('fragment:pickedUpConfirmed', (data) => this.onPickupConfirmed(data));
        gameEvents.on('fragment:droppedConfirmed', (data) => this.onDropConfirmed(data));
        gameEvents.on('fragment:verifiedResult', (data) => this.onVerified(data));
        gameEvents.on('fragment:deliveredSuccess', (data) => this.onDeliveredSuccess(data));
    }

    spawnFragment(fragmentData) {
        const data = fragmentData.fragment || fragmentData;
        if (!data || !data.id) return;

        // If fragment already exists, update properties
        if (this.worldFragments.has(data.id)) {
            const existing = this.worldFragments.get(data.id);
            existing.location = (data.location || existing.location || 'EXTERIOR').toUpperCase();
            if (data.x !== undefined && data.y !== undefined) {
                existing.drop(data.x, data.y);
            }
            return;
        }

        const fragment = new MemoryFragment(this.scene, data);
        this.worldFragments.set(fragment.id, fragment);
    }

    removeFragment(fragmentId) {
        if (this.worldFragments.has(fragmentId)) {
            const frag = this.worldFragments.get(fragmentId);
            frag.destroy();
            this.worldFragments.delete(fragmentId);
        }
    }

    onPickupConfirmed(data) {
        const fragment = this.worldFragments.get(data.fragmentId);
        if (fragment) {
            fragment.pickup(data.playerId);
            this.worldFragments.delete(data.fragmentId);
            this.heldFragments.set(data.playerId, fragment);

            if (data.playerId === this.scene.localPlayerId) {
                if (this.scene.sound.get('sfx_fragment_pickup')) {
                    this.scene.sound.play('sfx_fragment_pickup', { volume: 0.6 });
                }
                gameEvents.emit('inventory:updated', {
                    fragment: {
                        id: fragment.id,
                        objectName: fragment.objectName,
                        title: fragment.title,
                        description: fragment.description,
                        type: fragment.fragmentType,
                        isVerified: fragment.isVerified,
                        isAuthentic: fragment.isAuthentic
                    }
                });

                gameEvents.emit('chat:systemMessage', {
                    content: `Found: ${fragment.objectName}. Take to Library to verify authenticity!`
                });

                gameEvents.emit('hud:announcement', {
                    text: `Acquired ${fragment.objectName.toUpperCase()}`,
                    color: '#F59E0B'
                });
            }
        }
    }

    onDropConfirmed(data) {
        const fragment = this.heldFragments.get(data.playerId);
        if (fragment) {
            fragment.drop(data.position.x, data.position.y);
            this.heldFragments.delete(data.playerId);
            this.worldFragments.set(fragment.id, fragment);

            if (data.playerId === this.scene.localPlayerId) {
                gameEvents.emit('inventory:updated', { fragment: null });
                gameEvents.emit('hud:announcement', {
                    text: `Dropped Document`,
                    color: '#94A3B8'
                });
            }
        }
    }

    onVerified(data) {
        const fragment = this.heldFragments.get(data.playerId);
        if (fragment && fragment.id === data.fragmentId) {
            fragment.verify(data.isAuthentic);
            fragment.title = data.title || fragment.title;
            fragment.description = data.description || fragment.description;
            fragment.fragmentType = data.fragmentType || fragment.fragmentType;

            if (data.playerId === this.scene.localPlayerId) {
                gameEvents.emit('inventory:updated', {
                    fragment: {
                        id: fragment.id,
                        objectName: fragment.objectName,
                        title: fragment.title,
                        description: fragment.description,
                        type: fragment.fragmentType,
                        isVerified: true,
                        isAuthentic: data.isAuthentic
                    }
                });

                if (data.isAuthentic) {
                    if (this.scene.sound.get('sfx_fragment_verified')) {
                        this.scene.sound.play('sfx_fragment_verified', { volume: 0.7 });
                    }
                    gameEvents.emit('chat:systemMessage', {
                        content: `✅ VERIFIED AUTHENTIC: "${fragment.title}" (${fragment.fragmentType}). Deliver to Village Hall Archive!`
                    });
                    gameEvents.emit('hud:announcement', {
                        text: `AUTHENTIC: ${fragment.title.toUpperCase()} - DELIVER TO VILLAGE HALL!`,
                        color: '#10B981'
                    });
                } else {
                    if (this.scene.sound.get('sfx_solve_fail')) {
                        this.scene.sound.play('sfx_solve_fail', { volume: 0.5 });
                    }
                    gameEvents.emit('chat:systemMessage', {
                        content: `❌ VERIFICATION: Irrelevant / Decoy document. Does not match the mystery.`
                    });
                    gameEvents.emit('hud:announcement', {
                        text: `VERIFIED: IRRELEVANT DOCUMENT`,
                        color: '#EF4444'
                    });
                }
            }
        }
    }

    onDeliveredSuccess(data) {
        if (data.playerId === this.scene.localPlayerId) {
            this.heldFragments.delete(data.playerId);
            gameEvents.emit('inventory:updated', { fragment: null });
            if (this.scene.sound.get('sfx_fragment_verified')) {
                this.scene.sound.play('sfx_fragment_verified', { volume: 0.8 });
            }
            gameEvents.emit('hud:announcement', {
                text: `DELIVERED: ${data.deliveredType} RECORDED IN VILLAGE ARCHIVE!`,
                color: '#10B981'
            });
        }
    }
}
