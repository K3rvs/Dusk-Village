export class MemoryFragment {
    constructor(scene, fragmentData) {
        this.scene = scene;
        const data = fragmentData.fragment || fragmentData;

        this.id = data.id || `frag_${Date.now()}`;
        this.mysteryId = data.mysteryId;
        this.objectName = data.objectName || data.title || 'A mysterious document';
        this.title = data.title || 'Memory Fragment';
        this.description = data.description || '';
        this.fragmentType = (data.fragmentType || data.type || 'CLAIM').toUpperCase();
        this.location = (data.location || 'EXTERIOR').toUpperCase();
        this.isAuthentic = data.isAuthentic !== undefined ? data.isAuthentic : true;
        this.iconAsset = data.iconAsset;
        this.clueText = data.clueText || '';
        this.isVerified = !!data.isVerified;
        this.mysteryStage = data.mysteryStage || 1;
        this.markedAsForged = false;

        const posX = data.x !== undefined ? data.x : (data.spawnTile ? data.spawnTile.x * 16 : 768);
        const posY = data.y !== undefined ? data.y : (data.spawnTile ? data.spawnTile.y * 16 : 580);
        this.x = posX;
        this.y = posY;

        // Create world sprite (pulsing scroll / clue sparkle)
        this.worldSprite = scene.add.sprite(posX, posY, 'spr_frag_world_pulse');
        if (scene.anims.exists('frag_world_pulse')) {
            this.worldSprite.play('frag_world_pulse');
        }
        this.worldSprite.setDepth(posY);

        // Interaction zone
        this.interactionZone = scene.add.zone(posX, posY, 32, 32);
        scene.physics.add.existing(this.interactionZone, true);

        // Hide in exterior GameScene if located inside an interior building
        if (this.location !== 'EXTERIOR') {
            this.worldSprite.setVisible(false);
            this.interactionZone.setActive(false);
        }
    }

    pickup(playerId) {
        this.worldSprite.setVisible(false);
        this.interactionZone.setActive(false);
        this.heldByPlayerId = playerId;
    }

    drop(x, y) {
        this.x = x;
        this.y = y;
        this.worldSprite.setPosition(x, y);
        this.worldSprite.setVisible(true);
        this.interactionZone.setPosition(x, y);
        this.interactionZone.setActive(true);
        this.heldByPlayerId = null;
        this.location = 'EXTERIOR';
    }

    verify(isAuthentic) {
        this.isVerified = true;
        if (!isAuthentic) {
            this.markedAsForged = true;
        }
    }

    destroy() {
        if (this.worldSprite) this.worldSprite.destroy();
        if (this.interactionZone) this.interactionZone.destroy();
    }
}
