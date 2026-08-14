/**
 * Generate missing sprite: spr_player_shadow.png
 * A simple elliptical shadow for the player character.
 */
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const width = 12;
const height = 6;
const png = new PNG({ width, height, colorType: 6 });

// Draw a simple dark ellipse
const cx = width / 2;
const cy = height / 2;

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Ellipse test
        const dx = (x - cx) / (width / 2);
        const dy = (y - cy) / (height / 2);
        const dist = dx * dx + dy * dy;

        if (dist <= 1.0) {
            // Inside ellipse — dark shadow
            const alpha = Math.max(0, Math.min(255, Math.floor((1 - dist) * 128)));
            png.data[idx] = 0;     // R
            png.data[idx + 1] = 0; // G
            png.data[idx + 2] = 0; // B
            png.data[idx + 3] = alpha; // A
        } else {
            // Outside — transparent
            png.data[idx] = 0;
            png.data[idx + 1] = 0;
            png.data[idx + 2] = 0;
            png.data[idx + 3] = 0;
        }
    }
}

const outputPath = path.join(__dirname, '..', 'assets', 'sprites', 'characters', 'spr_player_shadow.png');
const buffer = PNG.sync.write(png);
fs.writeFileSync(outputPath, buffer);
console.log(`Generated: ${outputPath}`);
