const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const vfxDir = path.join(__dirname, '..', 'assets', 'sprites', 'vfx');
fs.mkdirSync(vfxDir, { recursive: true });

function parseHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
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
        for (let px = x; px < x + w; px++) setPixel(png, px, py, color);
    }
}

// Colors
const C_ELECTRIC = parseHex('#00FFFF');
const C_ELECTRIC_CORE = parseHex('#FFFFFF');
const C_DISSOLVE = parseHex('#C0392B');
const C_SPARKLE = parseHex('#27AE60');
const C_SPARKLE_CORE = parseHex('#E8D5A3');
const C_BURST_GREEN = parseHex('#27AE60');
const C_BURST_GOLD = parseHex('#F39C12');

function generateVFX() {
    // 1. vfx_ban_sever (64x64, 8f) - 512x64
    const banPng = new PNG({ width: 512, height: 64 });
    drawRect(banPng, 0, 0, 512, 64, [0,0,0,0]);
    for(let f=0; f<8; f++) {
        let dx = f * 64;
        let intensity = (f < 4) ? f : 7 - f;
        for(let i=0; i<10 * intensity; i++) {
            let px = dx + 32 + (Math.random() - 0.5) * 40;
            let py = 32 + (Math.random() - 0.5) * 40;
            drawRect(banPng, px, py, 2, 2, C_ELECTRIC);
            if(Math.random() > 0.5) setPixel(banPng, px, py, C_ELECTRIC_CORE);
        }
        // center strike
        if (f > 1 && f < 6) {
            drawRect(banPng, dx + 30, 0, 4, 64, C_ELECTRIC);
            drawRect(banPng, dx + 31, 0, 2, 64, C_ELECTRIC_CORE);
        }
    }
    fs.writeFileSync(path.join(vfxDir, 'vfx_ban_sever.png'), PNG.sync.write(banPng));

    // 2. vfx_dissolve_player (16x24, 8f) - 128x24
    const disPng = new PNG({ width: 128, height: 24 });
    drawRect(disPng, 0, 0, 128, 24, [0,0,0,0]);
    for(let f=0; f<8; f++) {
        let dx = f * 16;
        for(let y=0; y<24; y++) {
            for(let x=0; x<16; x++) {
                // start solid, dissolve away
                if(Math.random() * 8 > f) {
                    setPixel(disPng, dx + x, y, C_DISSOLVE);
                }
            }
        }
    }
    fs.writeFileSync(path.join(vfxDir, 'vfx_dissolve_player.png'), PNG.sync.write(disPng));

    // 3. vfx_verify_sparkle (24x24, 4f) - 96x24
    const sprPng = new PNG({ width: 96, height: 24 });
    drawRect(sprPng, 0, 0, 96, 24, [0,0,0,0]);
    for(let f=0; f<4; f++) {
        let dx = f * 24;
        let r = f * 4;
        for(let a=0; a<Math.PI*2; a+=Math.PI/2) {
            let px = dx + 12 + Math.cos(a + f) * r;
            let py = 12 + Math.sin(a + f) * r;
            drawRect(sprPng, px, py, 2, 2, C_SPARKLE);
            setPixel(sprPng, px, py, C_SPARKLE_CORE);
        }
    }
    fs.writeFileSync(path.join(vfxDir, 'vfx_verify_sparkle.png'), PNG.sync.write(sprPng));

    // 4. vfx_statue_burst (64x64, 8f) - 512x64
    const brstPng = new PNG({ width: 512, height: 64 });
    drawRect(brstPng, 0, 0, 512, 64, [0,0,0,0]);
    for(let f=0; f<8; f++) {
        let dx = f * 64;
        let r = f * 8;
        for(let a=0; a<Math.PI*2; a+=Math.PI/8) {
            let px = dx + 32 + Math.cos(a) * r;
            let py = 32 + Math.sin(a) * r;
            drawRect(brstPng, px, py, 4, 4, (f % 2 === 0) ? C_BURST_GREEN : C_BURST_GOLD);
        }
    }
    fs.writeFileSync(path.join(vfxDir, 'vfx_statue_burst.png'), PNG.sync.write(brstPng));

    console.log('Generated VFX');
}

function generatePreview() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Dusk Village - VFX Preview</title>
    <style>
        body { background: #222; color: #fff; font-family: sans-serif; padding: 20px; }
        .gallery { display: flex; flex-direction: column; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; }
        img { image-rendering: pixelated; background: #2a2a2a; border: 1px solid #444; }
        .scale2 { transform: scale(2); transform-origin: top left; margin-bottom: 40px; }
        h1, h2 { color: #F6AD55; }
    </style>
</head>
<body>
    <h1>Dusk Village VFX</h1>
    <div class="gallery">
        <div class="card">
            <h2>vfx_ban_sever (8 frames)</h2>
            <img class="scale2" src="vfx_ban_sever.png">
        </div>
        <div class="card">
            <h2>vfx_dissolve_player (8 frames)</h2>
            <img class="scale2" src="vfx_dissolve_player.png">
        </div>
        <div class="card">
            <h2>vfx_verify_sparkle (4 frames)</h2>
            <img class="scale2" src="vfx_verify_sparkle.png">
        </div>
        <div class="card">
            <h2>vfx_statue_burst (8 frames)</h2>
            <img class="scale2" src="vfx_statue_burst.png">
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(vfxDir, 'preview_vfx.html'), html);
    console.log('Generated preview_vfx.html');
}

console.log('Starting VFX generation...');
generateVFX();
generatePreview();
console.log('Done.');
