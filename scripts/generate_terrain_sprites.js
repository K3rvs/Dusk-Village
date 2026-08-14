const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Ensure output directory exists
const terrainDir = path.join(__dirname, '..', 'assets', 'sprites', 'terrain');
fs.mkdirSync(terrainDir, { recursive: true });

// --- Color Helpers ---
function parseHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function setPixel(png, x, y, [r, g, b, a = 255]) {
    if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
    const idx = (png.width * y + x) << 2;
    if (a < 255) {
        const srcA = a / 255;
        const dstA = png.data[idx + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA > 0) {
            png.data[idx] = Math.round((r * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
            png.data[idx + 1] = Math.round((g * srcA + png.data[idx + 1] * dstA * (1 - srcA)) / outA);
            png.data[idx + 2] = Math.round((b * srcA + png.data[idx + 2] * dstA * (1 - srcA)) / outA);
            png.data[idx + 3] = Math.round(outA * 255);
        }
    } else {
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
    }
}

function drawRect(png, x, y, w, h, color) {
    for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
            setPixel(png, px, py, color);
        }
    }
}

function blitTile(srcPng, srcX, srcY, dstPng, dstX, dstY, tileSize = 16) {
    for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
            const idx = (srcPng.width * (srcY + y) + (srcX + x)) << 2;
            const r = srcPng.data[idx];
            const g = srcPng.data[idx + 1];
            const b = srcPng.data[idx + 2];
            const a = srcPng.data[idx + 3];
            setPixel(dstPng, dstX + x, dstY + y, [r, g, b, a]);
        }
    }
}

// Master Color Palettes
const PAL_GRASS = [
    parseHex('#0B1C06'), parseHex('#1B3B0C'), parseHex('#274E13'),
    parseHex('#3E721D'), parseHex('#60A030'), parseHex('#89CC4B')
];

const PAL_DIRT = [
    parseHex('#331E0E'), parseHex('#4D2E17'), parseHex('#784B1F'),
    parseHex('#A1672D'), parseHex('#C78942'), parseHex('#E0AA60')
];

const PAL_COBBLE = [
    parseHex('#242C35'), parseHex('#333C47'), parseHex('#4C5866'),
    parseHex('#6A788A'), parseHex('#95A7B8'), parseHex('#BDCCD8')
];

const PAL_SLATE = [
    parseHex('#1E252E'), parseHex('#2D3642'), parseHex('#445163'),
    parseHex('#5E6F85'), parseHex('#7E92A8'), parseHex('#9FB3C7')
];

const PAL_OAK = [
    parseHex('#4D1E00'), parseHex('#7A3602'), parseHex('#B35509'),
    parseHex('#E07716'), parseHex('#F5A027'), parseHex('#FCD05B')
];

const PAL_MAPLE = [
    parseHex('#3B0A0A'), parseHex('#661414'), parseHex('#9E2323'),
    parseHex('#CC3B3B'), parseHex('#ED5E5E'), parseHex('#FF9494')
];

const PAL_PINE = [
    parseHex('#0A1C06'), parseHex('#14330D'), parseHex('#224E17'),
    parseHex('#346E25'), parseHex('#4B9137'), parseHex('#69B54E')
];

const PAL_BARK = [
    parseHex('#1F1208'), parseHex('#382010'), parseHex('#54331A'),
    parseHex('#754B2A'), parseHex('#96653D')
];

const C_SHADOW_ALPHA = [10, 15, 25, 120];

console.log('Generating 114 detailed Stardew Valley terrain & tree tiles...');

// =========================================================================
// 1. GRASS & FLOWERS AUTOTILE SET (17 tiles: 272x16 px)
// =========================================================================
const grassPng = new PNG({ width: 272, height: 16 });

function drawDetailedGrassTile(tIdx) {
    const ox = tIdx * 16;

    for (let py = 0; py < 16; py++) {
        for (let px = 0; px < 16; px++) {
            const seed = (tIdx * 31 + px * 7 + py * 13) % 100;
            let shade = 2;
            if (seed < 20) shade = 1;
            else if (seed < 55) shade = 2;
            else if (seed < 85) shade = 3;
            else shade = 4;
            setPixel(grassPng, ox + px, py, PAL_GRASS[shade]);
        }
    }

    const tuftPositions = [
        { x: 3, y: 5 }, { x: 9, y: 3 }, { x: 13, y: 7 },
        { x: 2, y: 11 }, { x: 7, y: 12 }, { x: 12, y: 13 }
    ];

    tuftPositions.forEach(p => {
        setPixel(grassPng, ox + p.x, p.y, PAL_GRASS[4]);
        setPixel(grassPng, ox + p.x - 1, p.y + 1, PAL_GRASS[3]);
        setPixel(grassPng, ox + p.x, p.y + 1, PAL_GRASS[5]);
        setPixel(grassPng, ox + p.x + 1, p.y + 1, PAL_GRASS[3]);
        setPixel(grassPng, ox + p.x, p.y + 2, PAL_GRASS[1]);
    });

    if (tIdx === 13) { // Red Autumn Roses & Golden Marigolds
        setPixel(grassPng, ox + 4, 4, parseHex('#8B1515'));
        setPixel(grassPng, ox + 3, 5, parseHex('#E52B2B'));
        setPixel(grassPng, ox + 4, 5, parseHex('#FF6B6B'));
        setPixel(grassPng, ox + 5, 5, parseHex('#E52B2B'));
        setPixel(grassPng, ox + 4, 6, parseHex('#F5D033'));

        setPixel(grassPng, ox + 11, 10, parseHex('#D47A11'));
        setPixel(grassPng, ox + 10, 11, parseHex('#F5A027'));
        setPixel(grassPng, ox + 11, 11, parseHex('#FCE066'));
        setPixel(grassPng, ox + 12, 11, parseHex('#F5A027'));
    } else if (tIdx === 14) { // Twilight Blue & White Flowers
        setPixel(grassPng, ox + 5, 10, parseHex('#1E3A6E'));
        setPixel(grassPng, ox + 4, 11, parseHex('#3B68B8'));
        setPixel(grassPng, ox + 5, 11, parseHex('#7AA2F5'));
        setPixel(grassPng, ox + 6, 11, parseHex('#3B68B8'));

        setPixel(grassPng, ox + 11, 3, parseHex('#A8A393'));
        setPixel(grassPng, ox + 10, 4, parseHex('#F5F0E1'));
        setPixel(grassPng, ox + 11, 4, parseHex('#FFFFFF'));
        setPixel(grassPng, ox + 12, 4, parseHex('#F5F0E1'));
    } else if (tIdx === 15) { // 4-Leaf Clover Patch
        setPixel(grassPng, ox + 7, 7, PAL_GRASS[0]);
        setPixel(grassPng, ox + 6, 6, PAL_GRASS[5]); setPixel(grassPng, ox + 8, 6, PAL_GRASS[5]);
        setPixel(grassPng, ox + 6, 8, PAL_GRASS[5]); setPixel(grassPng, ox + 8, 8, PAL_GRASS[5]);
    } else if (tIdx === 16) { // Wild Shoots
        setPixel(grassPng, ox + 3, 3, PAL_GRASS[5]); setPixel(grassPng, ox + 3, 4, PAL_GRASS[4]);
        setPixel(grassPng, ox + 9, 8, PAL_GRASS[5]); setPixel(grassPng, ox + 9, 9, PAL_GRASS[4]);
        setPixel(grassPng, ox + 13, 2, PAL_GRASS[5]);
    }
}
for (let i = 0; i < 17; i++) drawDetailedGrassTile(i);


// =========================================================================
// 2. DIRT AUTOTILE SET (15 tiles: 240x16 px)
// =========================================================================
const dirtPng = new PNG({ width: 240, height: 16 });

function drawDetailedDirtTile(tIdx) {
    const ox = tIdx * 16;

    for (let py = 0; py < 16; py++) {
        for (let px = 0; px < 16; px++) {
            const val = Math.sin(px * 1.7 + py * 2.3 + tIdx * 11) * Math.cos(px * 2.9 - py * 1.1);
            let shade = 2;
            if (val > 0.55) shade = 4;
            else if (val > 0.25) shade = 3;
            else if (val < -0.55) shade = 0;
            else if (val < -0.25) shade = 1;
            setPixel(dirtPng, ox + px, py, PAL_DIRT[shade]);
        }
    }

    const topEdge    = [2, 6, 7, 10].includes(tIdx);
    const bottomEdge = [3, 8, 9, 11].includes(tIdx);
    const leftEdge   = [4, 6, 8, 12].includes(tIdx);
    const rightEdge  = [5, 7, 9, 12].includes(tIdx);

    if (tIdx === 0) {
        for (let i = 0; i < 16; i++) {
            setPixel(dirtPng, ox + i, 0, PAL_GRASS[1]); setPixel(dirtPng, ox + i, 15, PAL_GRASS[1]);
            setPixel(dirtPng, ox, i, PAL_GRASS[1]); setPixel(dirtPng, ox + 15, i, PAL_GRASS[1]);
        }
    } else {
        if (topEdge) {
            for (let x = 0; x < 16; x++) {
                setPixel(dirtPng, ox + x, 0, PAL_GRASS[1]);
                if (x % 3 !== 0) setPixel(dirtPng, ox + x, 1, PAL_GRASS[3]);
                if (x % 5 === 0) setPixel(dirtPng, ox + x, 2, PAL_GRASS[4]);
            }
        }
        if (bottomEdge) {
            for (let x = 0; x < 16; x++) {
                setPixel(dirtPng, ox + x, 15, PAL_GRASS[1]);
                if (x % 3 !== 1) setPixel(dirtPng, ox + x, 14, PAL_GRASS[3]);
                if (x % 4 === 0) setPixel(dirtPng, ox + x, 13, PAL_GRASS[4]);
            }
        }
        if (leftEdge) {
            for (let y = 0; y < 16; y++) {
                setPixel(dirtPng, ox, y, PAL_GRASS[1]);
                if (y % 3 !== 0) setPixel(dirtPng, ox + 1, y, PAL_GRASS[3]);
            }
        }
        if (rightEdge) {
            for (let y = 0; y < 16; y++) {
                setPixel(dirtPng, ox + 15, y, PAL_GRASS[1]);
                if (y % 3 !== 1) setPixel(dirtPng, ox + 14, y, PAL_GRASS[3]);
            }
        }
    }

    if (tIdx === 13) { // Footprint
        drawRect(dirtPng, ox + 4, 5, 2, 5, PAL_DIRT[0]);
        setPixel(dirtPng, ox + 4, 4, PAL_DIRT[1]);
        setPixel(dirtPng, ox + 6, 6, PAL_DIRT[4]);
        drawRect(dirtPng, ox + 9, 8, 2, 5, PAL_DIRT[0]);
        setPixel(dirtPng, ox + 9, 7, PAL_DIRT[1]);
        setPixel(dirtPng, ox + 11, 9, PAL_DIRT[4]);
    } else if (tIdx === 14) { // Rain Puddle
        const pWater = parseHex('#2E5066');
        const pRefl  = parseHex('#58829B');
        const pSky   = parseHex('#8CB9D6');

        drawRect(dirtPng, ox + 3, 5, 10, 6, pWater);
        drawRect(dirtPng, ox + 5, 4, 6, 8, pWater);
        setPixel(dirtPng, ox + 5, 5, pSky); setPixel(dirtPng, ox + 6, 5, pSky);
        setPixel(dirtPng, ox + 6, 6, pRefl); setPixel(dirtPng, ox + 7, 6, pRefl);
        setPixel(dirtPng, ox + 3, 4, PAL_DIRT[0]); setPixel(dirtPng, ox + 12, 10, PAL_DIRT[0]);
    }
}
for (let i = 0; i < 15; i++) drawDetailedDirtTile(i);


// =========================================================================
// 3. COBBLESTONE PLAZA AUTOTILE SET (16 tiles: 256x16 px)
// =========================================================================
const cobblePng = new PNG({ width: 256, height: 16 });

function drawDetailedCobbleTile(tIdx) {
    const ox = tIdx * 16;
    drawRect(cobblePng, ox, 0, 16, 16, PAL_COBBLE[0]);

    for (let r = 0; r < 4; r++) {
        const rowShift = (r % 2) * 2;
        for (let c = 0; c < 4; c++) {
            const bx = ox + c * 4 + rowShift;
            const by = r * 4;
            const isWorn = (tIdx === 14) && ((r + c) % 2 === 0);

            for (let py = 1; py < 4; py++) {
                for (let px = 1; px < 4; px++) {
                    const gx = bx + px - 1;
                    const gy = by + py - 1;
                    if (gx >= ox && gx < ox + 16 && gy >= 0 && gy < 16) {
                        let color = isWorn ? PAL_COBBLE[1] : PAL_COBBLE[2];
                        if (px === 1 && py === 1) color = PAL_COBBLE[4];
                        else if (px === 1 || py === 1) color = PAL_COBBLE[3];
                        else if (px === 3 || py === 3) color = PAL_COBBLE[1];
                        setPixel(cobblePng, gx, gy, color);
                    }
                }
            }
        }
    }

    if (tIdx === 15) { // Decorative Rosette Mosaic Center Tile
        const roseRed   = parseHex('#992424');
        const roseGold  = parseHex('#E09B2B');
        const roseLight = parseHex('#F7CD6B');

        drawRect(cobblePng, ox + 5, 5, 6, 6, roseRed);
        drawRect(cobblePng, ox + 6, 6, 4, 4, roseGold);
        setPixel(cobblePng, ox + 7, 7, roseLight); setPixel(cobblePng, ox + 8, 7, roseLight);
        setPixel(cobblePng, ox + 7, 8, roseLight); setPixel(cobblePng, ox + 8, 8, roseLight);
    }
}
for (let i = 0; i < 16; i++) drawDetailedCobbleTile(i);


// =========================================================================
// 4. SLATE STONE AUTOTILE SET (15 tiles: 240x16 px)
// =========================================================================
const stonePng = new PNG({ width: 240, height: 16 });

function drawDetailedStoneTile(tIdx) {
    const ox = tIdx * 16;
    drawRect(stonePng, ox, 0, 16, 16, PAL_SLATE[0]);

    const slabs = [
        { x: 1, y: 1, w: 6, h: 6 },
        { x: 8, y: 1, w: 7, h: 6 },
        { x: 1, y: 8, w: 7, h: 7 },
        { x: 9, y: 8, w: 6, h: 7 }
    ];

    slabs.forEach(s => {
        drawRect(stonePng, ox + s.x, s.y, s.w, s.h, PAL_SLATE[2]);
        for (let x = 0; x < s.w; x++) setPixel(stonePng, ox + s.x + x, s.y, PAL_SLATE[4]);
        for (let y = 0; y < s.h; y++) setPixel(stonePng, ox + s.x, s.y + y, PAL_SLATE[3]);
        for (let x = 0; x < s.w; x++) setPixel(stonePng, ox + s.x + x, s.y + s.h - 1, PAL_SLATE[1]);
        for (let y = 0; y < s.h; y++) setPixel(stonePng, ox + s.x + s.w - 1, s.y + y, PAL_SLATE[1]);
    });

    if (tIdx === 13) {
        setPixel(stonePng, ox + 3, 3, PAL_SLATE[0]);
        setPixel(stonePng, ox + 4, 4, PAL_SLATE[0]); setPixel(stonePng, ox + 5, 4, PAL_SLATE[0]);
        setPixel(stonePng, ox + 6, 5, PAL_SLATE[0]);
    } else if (tIdx === 14) {
        setPixel(stonePng, ox + 7, 3, PAL_GRASS[2]); setPixel(stonePng, ox + 7, 4, PAL_GRASS[3]);
        setPixel(stonePng, ox + 8, 7, PAL_GRASS[2]); setPixel(stonePng, ox + 9, 7, PAL_GRASS[4]);
    }
}
for (let i = 0; i < 15; i++) drawDetailedStoneTile(i);


// =========================================================================
// 5. OCTAGONAL STONE WALL AUTOTILE SET (13 tiles: 208x16 px)
// =========================================================================
const wallPng = new PNG({ width: 208, height: 16 });

function drawDetailedWallTile(tIdx) {
    const ox = tIdx * 16;
    drawRect(wallPng, ox, 0, 16, 16, [0, 0, 0, 0]);

    if (tIdx === 0) {
        drawRect(wallPng, ox + 2, 2, 12, 12, PAL_COBBLE[2]);
        drawRect(wallPng, ox + 3, 3, 10, 10, PAL_COBBLE[3]);
        drawRect(wallPng, ox + 4, 4, 8, 8, PAL_COBBLE[4]);
        setPixel(wallPng, ox + 4, 4, PAL_COBBLE[5]);
        drawRect(wallPng, ox + 2, 13, 12, 2, C_SHADOW_ALPHA);
    } else if (tIdx >= 1 && tIdx <= 4) {
        drawRect(wallPng, ox, 3, 16, 10, PAL_COBBLE[2]);
        drawRect(wallPng, ox, 3, 16, 2, PAL_COBBLE[4]);
        drawRect(wallPng, ox, 11, 16, 2, PAL_COBBLE[1]);
        for (let x = 0; x < 16; x += 4) {
            drawRect(wallPng, ox + x, 5, 1, 6, PAL_COBBLE[1]);
        }
        drawRect(wallPng, ox, 13, 16, 2, C_SHADOW_ALPHA);
    } else {
        drawRect(wallPng, ox + 3, 0, 10, 16, PAL_COBBLE[2]);
        drawRect(wallPng, ox + 3, 0, 2, 16, PAL_COBBLE[4]);
        drawRect(wallPng, ox + 11, 0, 2, 16, PAL_COBBLE[1]);
        for (let y = 0; y < 16; y += 4) {
            drawRect(wallPng, ox + 5, y, 6, 1, PAL_COBBLE[1]);
        }
    }
}
for (let i = 0; i < 13; i++) drawDetailedWallTile(i);


// =========================================================================
// 6. WOODEN PICKET FENCE AUTOTILE SET (13 tiles: 208x16 px)
// =========================================================================
const fencePng = new PNG({ width: 208, height: 16 });

function drawDetailedFenceTile(tIdx) {
    const ox = tIdx * 16;
    drawRect(fencePng, ox, 0, 16, 16, [0, 0, 0, 0]);

    if (tIdx === 0) {
        drawRect(fencePng, ox + 6, 2, 4, 13, PAL_BARK[2]);
        setPixel(fencePng, ox + 7, 1, PAL_BARK[4]); setPixel(fencePng, ox + 8, 1, PAL_BARK[4]);
        setPixel(fencePng, ox + 6, 2, PAL_BARK[3]); setPixel(fencePng, ox + 9, 2, PAL_BARK[1]);
        drawRect(fencePng, ox + 6, 14, 4, 2, C_SHADOW_ALPHA);
    } else {
        drawRect(fencePng, ox, 4, 16, 2, PAL_BARK[1]);
        drawRect(fencePng, ox, 10, 16, 2, PAL_BARK[1]);

        const pickets = [1, 6, 11];
        pickets.forEach(px => {
            drawRect(fencePng, ox + px, 2, 4, 13, PAL_BARK[2]);
            setPixel(fencePng, ox + px + 1, 1, PAL_BARK[4]);
            setPixel(fencePng, ox + px + 2, 1, PAL_BARK[4]);
            setPixel(fencePng, ox + px, 2, PAL_BARK[3]);
            setPixel(fencePng, ox + px + 3, 2, PAL_BARK[1]);
            for (let y = 3; y < 14; y++) setPixel(fencePng, ox + px + 1, y, PAL_BARK[3]);
            setPixel(fencePng, ox + px + 2, 4, PAL_BARK[0]);
            setPixel(fencePng, ox + px + 2, 10, PAL_BARK[0]);
            drawRect(fencePng, ox + px, 14, 4, 2, C_SHADOW_ALPHA);
        });
    }
}
for (let i = 0; i < 13; i++) drawDetailedFenceTile(i);


// =========================================================================
// 7. GOLDEN OAK & CRIMSON MAPLE TREES (12 tiles: 64x48 px)
// =========================================================================
const oakPng = new PNG({ width: 64, height: 48 });

function drawDetailedTree(png, ox, oy, palLeaves) {
    for (let sy = 37; sy < 46; sy++) {
        for (let sx = 4; sx < 28; sx++) {
            const dist = Math.hypot((sx - 16) / 11, (sy - 41) / 4);
            if (dist <= 1.0) setPixel(png, ox + sx, oy + sy, C_SHADOW_ALPHA);
        }
    }

    // Gnarled Trunk with Bark Grain & Knot-Holes
    drawRect(png, ox + 13, oy + 22, 6, 20, PAL_BARK[2]);
    for (let y = oy + 22; y < oy + 42; y++) {
        setPixel(png, ox + 13, y, PAL_BARK[3]);
        setPixel(png, ox + 18, y, PAL_BARK[0]);
        if (y % 3 === 0) setPixel(png, ox + 15, y, PAL_BARK[1]);
    }
    // Knot-hole
    setPixel(png, ox + 15, oy + 32, PAL_BARK[0]);

    // Roots & Base Leaf Droppings
    setPixel(png, ox + 11, oy + 41, PAL_BARK[1]); setPixel(png, ox + 12, oy + 41, PAL_BARK[2]);
    setPixel(png, ox + 19, oy + 41, PAL_BARK[2]); setPixel(png, ox + 20, oy + 41, PAL_BARK[0]);
    setPixel(png, ox + 9, oy + 42, palLeaves[3]); setPixel(png, ox + 21, oy + 43, palLeaves[3]);

    // Cloud-like Canopy Clusters
    const clusters = [
        { cx: 16, cy: 12, r: 12 },
        { cx: 9,  cy: 16, r: 9  },
        { cx: 23, cy: 16, r: 9  },
        { cx: 16, cy: 20, r: 10 }
    ];

    clusters.forEach(c => {
        for (let py = c.cy - c.r; py <= c.cy + c.r; py++) {
            for (let px = c.cx - c.r; px <= c.cx + c.r; px++) {
                const dist = Math.hypot(px - c.cx, py - c.cy);
                if (dist <= c.r) {
                    setPixel(png, ox + px, oy + py, palLeaves[0]);
                }
            }
        }
    });

    clusters.forEach(c => {
        for (let py = c.cy - c.r; py <= c.cy + c.r; py++) {
            for (let px = c.cx - c.r; px <= c.cx + c.r; px++) {
                const dist = Math.hypot(px - c.cx, py - c.cy);
                if (dist <= c.r - 1) {
                    let shade = 2;
                    if (py < c.cy - 3 && px < c.cx) shade = 4;
                    else if (py < c.cy - 1 && px < c.cx + 2) shade = 3;
                    else if (py > c.cy + 2 || px > c.cx + 3) shade = 1;

                    if (py < c.cy - 6 && px < c.cx - 2 && (px + py) % 2 === 0) shade = 5;

                    setPixel(png, ox + px, oy + py, palLeaves[shade]);
                }
            }
        }
    });
}
drawDetailedTree(oakPng, 0, 0, PAL_OAK);   // Golden Oak
drawDetailedTree(oakPng, 32, 0, PAL_MAPLE); // Crimson Maple


// =========================================================================
// 8. EVERGREEN PINE BORDER TREE (8 tiles: 32x64 px)
// =========================================================================
const pinePng = new PNG({ width: 32, height: 64 });

for (let sy = 56; sy < 63; sy++) {
    for (let sx = 4; sx < 28; sx++) {
        const dist = Math.hypot((sx - 16) / 11, (sy - 59) / 3);
        if (dist <= 1.0) setPixel(pinePng, sx, sy, C_SHADOW_ALPHA);
    }
}

drawRect(pinePng, 14, 34, 4, 26, PAL_BARK[1]);
for (let y = 34; y < 60; y++) {
    setPixel(pinePng, 14, y, PAL_BARK[2]);
    setPixel(pinePng, 17, y, PAL_BARK[0]);
}

const pineTiers = [
    { topY: 3,  height: 14, width: 12 },
    { topY: 13, height: 16, width: 18 },
    { topY: 25, height: 18, width: 24 },
    { topY: 37, height: 18, width: 28 }
];

pineTiers.forEach(t => {
    for (let dy = 0; dy < t.height; dy++) {
        const wAtY = Math.round((dy / t.height) * (t.width / 2));
        for (let dx = -wAtY; dx <= wAtY; dx++) {
            const px = 16 + dx;
            const py = t.topY + dy;
            let shade = 2;
            if (dx < -wAtY / 3 && dy < t.height / 2) shade = 4;
            else if (dx < 0) shade = 3;
            else if (dx > wAtY / 3 || dy > t.height - 3) shade = 1;

            if (dx < -wAtY / 2 && dy < t.height / 3 && (px + py) % 2 === 0) shade = 5;

            setPixel(pinePng, px, py, PAL_PINE[shade]);
        }
    }
});
// Hanging Pine Cones
setPixel(pinePng, 11, 26, PAL_BARK[3]); setPixel(pinePng, 21, 38, PAL_BARK[3]);


// =========================================================================
// 9. CIRCULAR ROUND BUSHES & FLOWERING HEDGES (64x32 px)
// =========================================================================
const bushPng = new PNG({ width: 64, height: 32 });

// 1. Small Circular Bush (1x1, 16x16px)
for (let py = 0; py < 16; py++) {
    for (let px = 0; px < 16; px++) {
        const dist = Math.hypot(px - 7.5, py - 7.5);
        if (dist <= 6.8) {
            let shade = 2;
            if (px < 6 && py < 6) shade = 4;
            else if (px > 9 || py > 9) shade = 0;
            else shade = 3;
            setPixel(bushPng, px, py, PAL_GRASS[shade]);
        }
    }
}

// 2. Flowering Rose Bush (1x1, 16x16px)
for (let py = 0; py < 16; py++) {
    for (let px = 16; px < 32; px++) {
        const lx = px - 16;
        const dist = Math.hypot(lx - 7.5, py - 7.5);
        if (dist <= 6.8) {
            let shade = 2;
            if (lx < 6 && py < 6) shade = 4;
            else if (lx > 9 || py > 9) shade = 0;
            else shade = 3;
            setPixel(bushPng, px, py, PAL_GRASS[shade]);
        }
    }
}
// Rose blossoms
setPixel(bushPng, 20, 5, parseHex('#E52B2B')); setPixel(bushPng, 25, 8, parseHex('#FF6B6B'));
setPixel(bushPng, 22, 11, parseHex('#E52B2B'));

// 3. Golden Marigold Bush (1x1, 16x16px)
for (let py = 0; py < 16; py++) {
    for (let px = 32; px < 48; px++) {
        const lx = px - 32;
        const dist = Math.hypot(lx - 7.5, py - 7.5);
        if (dist <= 6.8) {
            let shade = 2;
            if (lx < 6 && py < 6) shade = 4;
            else if (lx > 9 || py > 9) shade = 0;
            else shade = 3;
            setPixel(bushPng, px, py, PAL_GRASS[shade]);
        }
    }
}
// Marigold blossoms
setPixel(bushPng, 36, 6, parseHex('#F5A027')); setPixel(bushPng, 42, 7, parseHex('#FCE066'));
setPixel(bushPng, 39, 11, parseHex('#F5A027'));

// 4. Large Circular Bush (2x2, 32x32px) at (0, 0..32, 16..32)
for (let py = 16; py < 32; py++) {
    for (let px = 0; px < 32; px++) {
        const dist = Math.hypot(px - 15.5, py - 23.5);
        if (dist <= 13.8) {
            let shade = 2;
            if (px < 12 && py < 22) shade = 4;
            else if (px > 19 || py > 26) shade = 0;
            else shade = 3;
            setPixel(bushPng, px, py, PAL_GRASS[shade]);
        }
    }
}

fs.writeFileSync(path.join(terrainDir, 'spr_bush_circular.png'), PNG.sync.write(bushPng));


// =========================================================================
// 10. SWAYING TALL GRASS (4 tiles: 32x24 px)
// =========================================================================
const tallGrassPng = new PNG({ width: 32, height: 24 });

function drawDetailedTallGrass(frameOffset, swayShift) {
    for (let i = 0; i < 2; i++) {
        const ox = frameOffset + i * 16;
        for (let b = 2; b < 14; b += 3) {
            for (let h = 0; h < 19; h++) {
                const shift = h > 7 ? swayShift : 0;
                setPixel(tallGrassPng, ox + b + shift, 23 - h, PAL_GRASS[1]);
                setPixel(tallGrassPng, ox + b + 1 + shift, 23 - h, PAL_GRASS[4]);
                setPixel(tallGrassPng, ox + b + 2 + shift, 23 - h, PAL_GRASS[2]);
            }
        }
    }
}
drawDetailedTallGrass(0, 0);
drawDetailedTallGrass(16, 2);


// =========================================================================
// 11. DRIFTING FALLEN LEAVES (3 tiles: 48x16 px)
// =========================================================================
const leavesPng = new PNG({ width: 48, height: 16 });

setPixel(leavesPng, 3, 4, PAL_OAK[2]); setPixel(leavesPng, 4, 4, PAL_OAK[4]);
setPixel(leavesPng, 10, 11, PAL_OAK[3]); setPixel(leavesPng, 11, 12, PAL_OAK[1]);

setPixel(leavesPng, 16 + 5, 8, PAL_MAPLE[2]); setPixel(leavesPng, 16 + 6, 8, PAL_MAPLE[4]);
setPixel(leavesPng, 16 + 12, 3, PAL_MAPLE[3]); setPixel(leavesPng, 16 + 13, 4, PAL_MAPLE[1]);

setPixel(leavesPng, 32 + 2, 10, PAL_OAK[3]); setPixel(leavesPng, 32 + 7, 5, PAL_MAPLE[3]);
setPixel(leavesPng, 32 + 13, 12, PAL_OAK[5]); setPixel(leavesPng, 32 + 14, 2, PAL_MAPLE[5]);


// Save individual PNG files
fs.writeFileSync(path.join(terrainDir, 'tile_ground_dirt.png'), PNG.sync.write(dirtPng));
fs.writeFileSync(path.join(terrainDir, 'tile_ground_cobble.png'), PNG.sync.write(cobblePng));
fs.writeFileSync(path.join(terrainDir, 'tile_ground_grass.png'), PNG.sync.write(grassPng));
fs.writeFileSync(path.join(terrainDir, 'tile_ground_stone.png'), PNG.sync.write(stonePng));
fs.writeFileSync(path.join(terrainDir, 'spr_wall_octagonal.png'), PNG.sync.write(wallPng));
fs.writeFileSync(path.join(terrainDir, 'prop_fence_picket.png'), PNG.sync.write(fencePng));
fs.writeFileSync(path.join(terrainDir, 'spr_tree_autumn_oak.png'), PNG.sync.write(oakPng));
fs.writeFileSync(path.join(terrainDir, 'spr_tree_pine_border.png'), PNG.sync.write(pinePng));
fs.writeFileSync(path.join(terrainDir, 'spr_foliage_bushes.png'), PNG.sync.write(bushPng));
fs.writeFileSync(path.join(terrainDir, 'spr_tall_grass.png'), PNG.sync.write(tallGrassPng));
fs.writeFileSync(path.join(terrainDir, 'spr_fallen_leaves.png'), PNG.sync.write(leavesPng));


// =========================================================================
// 12. MASTER COMBINED TILESET ATLAS (tileset_terrain_trees.png)
// Total 114 tiles placed on a 256x128 grid (16 cols x 8 rows)
// =========================================================================
const masterAtlas = new PNG({ width: 256, height: 128 });

let currentTileIndex = 0;

function placeTiles(srcPng, totalTilesWidth) {
    for (let i = 0; i < totalTilesWidth; i++) {
        const row = Math.floor(currentTileIndex / 16);
        const col = currentTileIndex % 16;
        const dstX = col * 16;
        const dstY = row * 16;
        const srcX = i * 16;
        blitTile(srcPng, srcX, 0, masterAtlas, dstX, dstY, 16);
        currentTileIndex++;
    }
}

placeTiles(dirtPng, 15);      // Tiles 0-14 (15 tiles)
placeTiles(cobblePng, 16);    // Tiles 15-30 (16 tiles)
placeTiles(grassPng, 17);     // Tiles 31-47 (17 tiles)
placeTiles(stonePng, 15);     // Tiles 48-62 (15 tiles)
placeTiles(wallPng, 13);      // Tiles 63-75 (13 tiles)
placeTiles(fencePng, 13);     // Tiles 76-88 (13 tiles)
placeTiles(bushPng, 5);       // Tiles 89-93 (5 tiles)
placeTiles(leavesPng, 3);     // Tiles 94-96 (3 tiles)

for (let y = 0; y < 24; y += 16) {
    for (let x = 0; x < 32; x += 16) {
        const row = Math.floor(currentTileIndex / 16);
        const col = currentTileIndex % 16;
        blitTile(tallGrassPng, x, y, masterAtlas, col * 16, row * 16, 16);
        currentTileIndex++;
    }
} // Tiles 97-100 (4 tiles)

for (let y = 0; y < 48; y += 16) {
    for (let x = 0; x < 64; x += 16) {
        const row = Math.floor(currentTileIndex / 16);
        const col = currentTileIndex % 16;
        blitTile(oakPng, x, y, masterAtlas, col * 16, row * 16, 16);
        currentTileIndex++;
    }
} // Tiles 101-112 (12 tiles)

for (let y = 0; y < 64; y += 16) {
    for (let x = 0; x < 32; x += 16) {
        const row = Math.floor(currentTileIndex / 16);
        const col = currentTileIndex % 16;
        blitTile(pinePng, x, y, masterAtlas, col * 16, row * 16, 16);
        currentTileIndex++;
    }
} // Tiles 113-120 (8 tiles) -> Total 114 tiles placed!

fs.writeFileSync(path.join(terrainDir, 'tileset_terrain_trees.png'), PNG.sync.write(masterAtlas));

console.log(`Successfully generated all 114 Stardew Valley detailed terrain & tree tiles in: ${terrainDir}`);
