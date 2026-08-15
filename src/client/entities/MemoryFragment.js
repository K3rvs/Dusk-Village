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

        const posX = data.x !== undefined && data.x !== null ? data.x : 768;
        const posY = data.y !== undefined && data.y !== null ? data.y : 580;
        this.x = posX;
        this.y = posY;
        this.spawnTile = data.spawnTile || null;

        // Determine if this fragment lives in an interior building
        const INTERIOR_LOCATIONS = ['SCHOOL', 'CLINIC', 'HOUSE', 'VILLAGE_HALL', 'LIBRARY', 'ARCHIVES'];
        this.isInterior = INTERIOR_LOCATIONS.includes(this.location);

        // Create golden glowing aura beacon beneath fragment
        this.glowCircle = scene.add.circle(posX, posY + 4, 9, 0xF59E0B, 0.45);
        this.glowCircle.setDepth(posY - 1);

        scene.tweens.add({
            targets: this.glowCircle,
            scaleX: 1.35,
            scaleY: 1.35,
            alpha: 0.15,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });

        // Create world sprite (pulsing scroll / clue sparkle)
        this.worldSprite = scene.add.sprite(posX, posY, 'spr_frag_world_pulse');
        if (scene.anims.exists('frag_world_pulse')) {
            this.worldSprite.play('frag_world_pulse');
        }
        this.worldSprite.setDepth(posY);

        // Gentle floating bob animation
        this.bobTween = scene.tweens.add({
            targets: this.worldSprite,
            y: posY - 3,
            yoyo: true,
            repeat: -1,
            duration: 900,
            ease: 'Sine.easeInOut'
        });

        // Interaction zone
        this.interactionZone = scene.add.zone(posX, posY, 36, 36);
        scene.physics.add.existing(this.interactionZone, true);

        // Hide in GameScene exterior if this fragment belongs inside a building
        if (this.isInterior) {
            this.worldSprite.setVisible(false);
            this.glowCircle.setVisible(false);
            this.interactionZone.setActive(false);
        }
    }

    pickup(playerId) {
        this.worldSprite.setVisible(false);
        if (this.glowCircle) this.glowCircle.setVisible(false);
        this.interactionZone.setActive(false);
        this.heldByPlayerId = playerId;
    }

    drop(x, y) {
        this.x = x;
        this.y = y;
        this.worldSprite.setPosition(x, y);
        this.worldSprite.setVisible(true);
        if (this.glowCircle) {
            this.glowCircle.setPosition(x, y + 4);
            this.glowCircle.setVisible(true);
        }
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
        if (this.bobTween) this.bobTween.stop();
        if (this.glowCircle) this.glowCircle.destroy();
        if (this.worldSprite) this.worldSprite.destroy();
        if (this.interactionZone) this.interactionZone.destroy();
    }
}
