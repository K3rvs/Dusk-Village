/**
 * Generate placeholder sprite PNGs for development.
 */
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

function createSolidColorPng(width, height, r, g, b, a = 255) {
    const png = new PNG({ width, height, colorType: 6 });
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            png.data[idx] = r;
            png.data[idx + 1] = g;
            png.data[idx + 2] = b;
            png.data[idx + 3] = a;
        }
    }
    return PNG.sync.write(png);
}

const dirs = [
    'assets/sprites/characters',
    'assets/sprites/buildings',
    'assets/sprites/props',
    'assets/sprites/icons',
    'assets/sprites/terrain',
    'assets/sprites/ui'
];

dirs.forEach(dir => {
    fs.mkdirSync(path.join(__dirname, '..', dir), { recursive: true });
});

// Characters (avatars 01-10)
for (let i = 1; i <= 10; i++) {
    const num = i.toString().padStart(2, '0');
    // We create a spritesheet with 12 frames (3x4 directions: down, left, right, up)
    // 16x24 per frame -> 48x96 total
    const buffer = createSolidColorPng(48, 96, 255, 100 + i * 10, 100);
    fs.writeFileSync(path.join(__dirname, '..', `assets/sprites/characters/spr_avatar_${num}.png`), buffer);
}

// Terrain (for map fallback if we load it)
fs.writeFileSync(path.join(__dirname, '..', 'assets/sprites/terrain/tile_ground_grass.png'), createSolidColorPng(16, 16, 46, 204, 113));
fs.writeFileSync(path.join(__dirname, '..', 'assets/sprites/terrain/tile_ground_dirt.png'), createSolidColorPng(16, 16, 135, 54, 0));
fs.writeFileSync(path.join(__dirname, '..', 'assets/sprites/terrain/tile_ground_stone.png'), createSolidColorPng(16, 16, 149, 165, 166));

// Props / fragments
fs.writeFileSync(path.join(__dirname, '..', 'assets/sprites/props/spr_frag_world_pulse.png'), createSolidColorPng(24, 24, 243, 156, 18, 150));
fs.writeFileSync(path.join(__dirname, '..', 'assets/sprites/props/interior_props.png'), createSolidColorPng(16, 16, 200, 200, 200));

console.log('Sprite generation complete!');
