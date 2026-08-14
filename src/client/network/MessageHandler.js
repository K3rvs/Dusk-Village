import { gameEvents } from '../utils/EventBus.js';

export class MessageHandler {
    constructor(scene) {
        this.scene = scene;
        // GameScene handles phase:serverChanged and player:remoteUpdate directly.
        // Listeners removed to prevent crashes since this.scene may be null here.
    }

    updateRemotePlayer(data) {
        const remotePlayer = this.scene.remotePlayers.get(data.playerId);
        if (remotePlayer) {
            this.scene.tweens.add({
                targets: remotePlayer.sprite,
                x: data.x,
                y: data.y,
                duration: 66,
                ease: 'Linear'
            });

            const avatarKey = `avatar_${remotePlayer.avatarId}`;
            if (data.animation && this.scene.anims.exists(`${avatarKey}_${data.animation}`)) {
                remotePlayer.sprite.anims.play(`${avatarKey}_${data.animation}`, true);
            }

            remotePlayer.shadow.setPosition(data.x, data.y + 12);
        }
    }
}
