import { CONFIG } from '../utils/Constants.js';
import { gameEvents } from '../utils/EventBus.js';
import { getDistance } from '../utils/Helpers.js';

export class PlayerController {
    constructor(scene, localPlayer) {
        this.scene = scene;
        this.player = localPlayer;
        this.interactionCooldown = false;
        this.idleTimer = 0;
        this.IDLE_THRESHOLD = 3000;
    }

    /**
     * Check for nearby interactable objects and trigger interaction
     */
    checkInteraction(worldFragments, buildingDoors, interactables) {
        if (!this.player || !this.player.sprite) return;
        const px = this.player.sprite.x;
        const py = this.player.sprite.y;

        // 1. Check world fragments first (pickup radius 40px)
        for (const fragment of worldFragments) {
            if (getDistance(px, py, fragment.x, fragment.y) <= 40) {
                gameEvents.emit('fragment:attemptPickup', {
                    playerId: this.player.id,
                    fragmentId: fragment.id
                });
                return;
            }
        }

        // 2. Check building doors (radius 40px)
        for (const door of buildingDoors) {
            if (getDistance(px, py, door.x, door.y) <= 40) {
                gameEvents.emit('building:attemptEntry', {
                    playerId: this.player.id,
                    buildingId: door.buildingId
                });
                return;
            }
        }

        // 3. Check interactables (statue, podium, notice boards)
        for (const obj of interactables) {
            if (getDistance(px, py, obj.x, obj.y) <= 40) {
                gameEvents.emit('interaction:trigger', {
                    playerId: this.player.id,
                    objectId: obj.id,
                    action: obj.action
                });
                return;
            }
        }
    }

    /**
     * Drop the currently held fragment
     */
    dropFragment() {
        if (!this.player || !this.player.sprite) return;
        gameEvents.emit('fragment:attemptDrop', {
            playerId: this.player.id,
            position: {
                x: this.player.sprite.x,
                y: this.player.sprite.y
            }
        });
    }

    destroy() {
        // Cleanup
    }
}
