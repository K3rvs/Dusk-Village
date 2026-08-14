const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Ensure output directories exist
const charsDir = path.join(__dirname, '..', 'assets', 'sprites', 'characters');
const portsDir = path.join(__dirname, '..', 'assets', 'sprites', 'portraits');
fs.mkdirSync(charsDir, { recursive: true });
fs.mkdirSync(portsDir, { recursive: true });

// --- Color Helpers ---
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

// Color Palettes
const SKIN_TONES = [
    [parseHex('#FFD1B3'), parseHex('#E6A87C')], // Alex (Light)
    [parseHex('#E5B99F'), parseHex('#C78B6B')], // Sam (Medium Light)
    [parseHex('#A66C47'), parseHex('#784323')], // Jordan (Dark)
    [parseHex('#C78B6B'), parseHex('#9E5D38')], // Morgan (Medium)
    [parseHex('#FCE4D6'), parseHex('#D6AB8F')]  // Taylor (Pale)
];

const HAIR_COLORS = [
    [parseHex('#2A1F1A'), parseHex('#150F0D')], // Black
    [parseHex('#D1A354'), parseHex('#A87428')], // Blonde
    [parseHex('#543324'), parseHex('#331A10')], // Brown
    [parseHex('#993D26'), parseHex('#661F0F')], // Red
    [parseHex('#5E6B75'), parseHex('#3D4A54')]  // Gray/Slate
];

const AVATARS = [
    { id: '01', name: 'Chef', file: 'Chef.png', top: parseHex('#FFFFFF'), bot: parseHex('#1A1A2E'), skin: 0, hair: 0 },
    { id: '02', name: 'Construction Worker', file: 'Construction Worker.png', top: parseHex('#E67E22'), bot: parseHex('#1A5276'), skin: 1, hair: 1 },
    { id: '03', name: 'Mechanic', file: 'Mechanic.png', top: parseHex('#1B365D'), bot: parseHex('#1B365D'), skin: 2, hair: 2 },
    { id: '04', name: 'Nurse', file: 'Nurse.png', top: parseHex('#1ABC9C'), bot: parseHex('#1ABC9C'), skin: 3, hair: 3 },
    { id: '05', name: 'Office Worker', file: 'Office Worker.png', top: parseHex('#4A5568'), bot: parseHex('#1A1A2E'), skin: 4, hair: 4 },
    { id: '06', name: 'Police', file: 'Police.png', top: parseHex('#0F3460'), bot: parseHex('#0F3460'), skin: 1, hair: 0 }
];

// Draw a single character frame at (dx, dy) within the spritesheet
// 16x24 px character
function drawCharacterFrame(png, dx, dy, avatar, frameType, animPhase) {
    const skin = SKIN_TONES[avatar.skin][0];
    const skinD = SKIN_TONES[avatar.skin][1];
    const hair = HAIR_COLORS[avatar.hair][0];
    const top = avatar.top;
    const bot = avatar.bot;
    
    // Head (common 8x8 block)
    let headY = dy + 2;
    // Breathing/walking bob
    if (frameType === 'idle' && animPhase === 1) headY += 1;
    if (frameType === 'walk' && (animPhase === 1 || animPhase === 3)) headY -= 1;
    if (frameType === 'interact' && animPhase > 0) headY += (animPhase === 2 ? 3 : 1);
    
    // Dissolve logic
    if (frameType === 'dissolve') {
        let dissolveLevel = animPhase; // 0 to 7
        for(let py=dy; py<dy+24; py++) {
            for(let px=dx; px<dx+16; px++) {
                if(Math.random() * 8 > dissolveLevel) {
                    setPixel(png, px, py, top); // simplified dissolve particle
                }
            }
        }
        return;
    }

    // Direction handling
    let dir = 'S';
    if(frameType === 'walk' || frameType === 'idle') {
        const dirs = ['N', 'S', 'E', 'W'];
        // Assume animPhase or a passed var tells us direction. 
        // We'll simplify: passed dir is encoded in frameType like "walk_N"
    }
    
    let isN = frameType.includes('_N');
    let isE = frameType.includes('_E');
    let isW = frameType.includes('_W');
    let isS = frameType.includes('_S') || frameType === 'interact';
    
    // Body
    let bodyY = headY + 8;
    drawRect(png, dx + 4, bodyY, 8, 8, top); // Torso
    
    // Legs
    let legY = bodyY + 8;
    drawRect(png, dx + 4, legY, 3, 4, bot); // L Leg
    drawRect(png, dx + 9, legY, 3, 4, bot); // R Leg
    
    // Animation specific leg offsets
    if (frameType.includes('walk')) {
        if (animPhase === 1) { // Left step
            drawRect(png, dx + 4, legY, 3, 3, [0,0,0,0]);
            drawRect(png, dx + 4, legY-1, 3, 4, bot);
        } else if (animPhase === 3) { // Right step
            drawRect(png, dx + 9, legY, 3, 3, [0,0,0,0]);
            drawRect(png, dx + 9, legY-1, 3, 4, bot);
        }
    }

    // Arms
    if (isS || isN) {
        drawRect(png, dx + 2, bodyY + 1, 2, 5, top); // L arm
        drawRect(png, dx + 12, bodyY + 1, 2, 5, top); // R arm
        if(isS) {
            drawRect(png, dx + 2, bodyY + 6, 2, 2, skin); // L hand
            drawRect(png, dx + 12, bodyY + 6, 2, 2, skin); // R hand
        }
    } else if (isE) {
        drawRect(png, dx + 6, bodyY + 1, 3, 5, top);
        drawRect(png, dx + 6, bodyY + 6, 2, 2, skin);
    } else if (isW) {
        drawRect(png, dx + 7, bodyY + 1, 3, 5, top);
        drawRect(png, dx + 8, bodyY + 6, 2, 2, skin);
    }

    if(frameType === 'interact') {
        // override arms for interact
        drawRect(png, dx + 2, bodyY + 1, 2, 5, [0,0,0,0]); // clear
        drawRect(png, dx + 12, bodyY + 1, 2, 5, [0,0,0,0]); 
        drawRect(png, dx + 6, bodyY + 6, 4, 3, skin); // reach down
    }

    // Head
    drawRect(png, dx + 4, headY, 8, 8, skin);
    if (!isN) {
        // Eyes
        let eyeOffset = isE ? 2 : (isW ? -2 : 0);
        drawRect(png, dx + 6 + eyeOffset, headY + 3, 1, 2, [30,30,40,255]);
        if(isS) drawRect(png, dx + 9, headY + 3, 1, 2, [30,30,40,255]);
    }
    // Hair
    drawRect(png, dx + 4, headY, 8, 3, hair);
    if (isN) drawRect(png, dx + 4, headY, 8, 8, hair); // full back of head
    if (isE) drawRect(png, dx + 4, headY, 4, 8, hair);
    if (isW) drawRect(png, dx + 8, headY, 4, 8, hair);
}

function generateAvatars() {
    AVATARS.forEach(avatar => {
        const png = new PNG({ width: 256, height: 72 }); // 16x3 grid of 16x24 frames
        drawRect(png, 0, 0, 256, 72, [0,0,0,0]); // bg

        // Row 0: Walk Cycles (N, S, E, W) - 4 frames each
        const dirs = ['N', 'S', 'E', 'W'];
        for(let d=0; d<4; d++) {
            for(let f=0; f<4; f++) {
                drawCharacterFrame(png, (d*4 + f)*16, 0, avatar, 'walk_' + dirs[d], f);
            }
        }
        
        // Row 1: Idle (N, S, E, W) - 2 frames each, then Interact S (3 frames)
        for(let d=0; d<4; d++) {
            for(let f=0; f<2; f++) {
                drawCharacterFrame(png, (d*2 + f)*16, 24, avatar, 'idle_' + dirs[d], f);
            }
        }
        for(let f=0; f<3; f++) {
            drawCharacterFrame(png, (8 + f)*16, 24, avatar, 'interact', f);
        }

        // Row 2: Dissolve (8 frames)
        for(let f=0; f<8; f++) {
            drawCharacterFrame(png, f*16, 48, avatar, 'dissolve', f);
        }

        // Write spr_avatar_XX.png
        const pngBuf = PNG.sync.write(png);
        fs.writeFileSync(path.join(charsDir, `spr_avatar_${avatar.id}.png`), pngBuf);
        // Also copy/write to named file if it doesn't exist
        const namedPath = path.join(charsDir, avatar.file);
        if (!fs.existsSync(namedPath)) {
            fs.writeFileSync(namedPath, pngBuf);
        }
    });
    
    // Ground Shadow
    const shadowPng = new PNG({ width: 16, height: 8 });
    drawRect(shadowPng, 0, 0, 16, 8, [0,0,0,0]);
    drawRect(shadowPng, 2, 2, 12, 4, [0,0,0,100]);
    drawRect(shadowPng, 4, 1, 8, 6, [0,0,0,100]);
    fs.writeFileSync(path.join(charsDir, `spr_player_shadow.png`), PNG.sync.write(shadowPng));
    console.log('Generated 6 Official Avatars & Shadow');
}

function generatePortraits() {
    // 6 Select, 1 Anon, 6 Elim
    AVATARS.forEach(avatar => {
        // Select (32x32)
        let selPng = new PNG({ width: 32, height: 32 });
        drawRect(selPng, 0, 0, 32, 32, parseHex('#2C3E50')); // bg
        drawRect(selPng, 2, 2, 28, 28, parseHex('#34495E')); // inner bg
        drawRect(selPng, 8, 12, 16, 16, SKIN_TONES[avatar.skin][0]); // face
        drawRect(selPng, 8, 12, 16, 6, HAIR_COLORS[avatar.hair][0]); // hair
        drawRect(selPng, 12, 18, 2, 2, [0,0,0,255]); // eye L
        drawRect(selPng, 18, 18, 2, 2, [0,0,0,255]); // eye R
        drawRect(selPng, 6, 28, 20, 4, avatar.top); // shoulders
        fs.writeFileSync(path.join(portsDir, `port_avatar_${avatar.id}_select.png`), PNG.sync.write(selPng));

        // Elim (32x32) - Desaturated + Red X
        let elimPng = new PNG({ width: 32, height: 32 });
        drawRect(elimPng, 0, 0, 32, 32, parseHex('#222222'));
        drawRect(elimPng, 2, 2, 28, 28, parseHex('#444444'));
        drawRect(elimPng, 8, 12, 16, 16, parseHex('#888888')); // desat face
        drawRect(elimPng, 6, 28, 20, 4, parseHex('#555555')); 
        // Red X
        for(let i=0; i<32; i++) {
            setPixel(elimPng, i, i, parseHex('#C0392B'));
            setPixel(elimPng, i, 31-i, parseHex('#C0392B'));
            setPixel(elimPng, i+1, i, parseHex('#C0392B'));
            setPixel(elimPng, i+1, 31-i, parseHex('#C0392B'));
        }
        fs.writeFileSync(path.join(portsDir, `port_avatar_${avatar.id}_elim.png`), PNG.sync.write(elimPng));
    });

    // Anon (32x32)
    let anonPng = new PNG({ width: 32, height: 32 });
    drawRect(anonPng, 0, 0, 32, 32, parseHex('#1A1A2E'));
    drawRect(anonPng, 8, 12, 16, 16, parseHex('#0F3460')); // silhouette
    drawRect(anonPng, 6, 28, 20, 4, parseHex('#0F3460'));
    // ? mark
    drawRect(anonPng, 14, 14, 4, 8, parseHex('#E8D5A3'));
    fs.writeFileSync(path.join(portsDir, `port_avatar_anon.png`), PNG.sync.write(anonPng));

    // Role Reveals (64x64)
    // Survivor
    let survPng = new PNG({ width: 64, height: 64 });
    drawRect(survPng, 0, 0, 64, 64, parseHex('#0A192F'));
    drawRect(survPng, 16, 24, 32, 32, parseHex('#E8D5A3')); // abstract face
    drawRect(survPng, 8, 48, 12, 16, parseHex('#F6AD55')); // lantern glow
    drawRect(survPng, 40, 40, 16, 16, parseHex('#1A5276')); // notebook
    fs.writeFileSync(path.join(portsDir, `port_role_survivor.png`), PNG.sync.write(survPng));

    // Instigator
    let instPng = new PNG({ width: 64, height: 64 });
    drawRect(instPng, 0, 0, 64, 64, parseHex('#160824'));
    drawRect(instPng, 16, 24, 32, 32, parseHex('#4A235A')); // dark hood
    drawRect(instPng, 20, 36, 6, 4, parseHex('#C0392B')); // red eye
    drawRect(instPng, 40, 40, 12, 16, parseHex('#7D3C98')); // forged doc
    fs.writeFileSync(path.join(portsDir, `port_role_instigator.png`), PNG.sync.write(instPng));

    console.log('Generated Portraits');
}

// Generate HTML preview
function generatePreview() {
    const avatarCardsHtml = AVATARS.map(a => `
        <div class="card">
            <h3>spr_avatar_${a.id} (${a.name})</h3>
            <img class="sheet" src="${a.file}">
        </div>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Dusk Village - Official Characters Preview</title>
    <style>
        body { background: #222; color: #fff; font-family: sans-serif; padding: 20px; }
        .gallery { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
        img { image-rendering: pixelated; background: #2a2a2a; border: 1px solid #444; }
        .sheet { width: 768px; }
        .port { width: 128px; height: 128px; }
        .role { width: 256px; height: 256px; }
        h1, h2 { color: #F6AD55; }
    </style>
</head>
<body>
    <h1>Dusk Village Official Characters (6 Selectable Avatars)</h1>
    
    <h2>Player Avatars</h2>
    <div class="gallery">
        ${avatarCardsHtml}
    </div>

    <h2>Portraits</h2>
    <div class="gallery">
        <div class="card"><img class="port" src="../portraits/port_avatar_01_select.png"><br>Select</div>
        <div class="card"><img class="port" src="../portraits/port_avatar_01_elim.png"><br>Elim</div>
        <div class="card"><img class="port" src="../portraits/port_avatar_anon.png"><br>Anon</div>
        <div class="card"><img class="role" src="../portraits/port_role_survivor.png"><br>Role: Survivor</div>
        <div class="card"><img class="role" src="../portraits/port_role_instigator.png"><br>Role: Instigator</div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(charsDir, 'preview_characters.html'), html);
    console.log('Generated preview_characters.html');
}

// --- Execution ---
console.log('Starting character generation...');
generateAvatars();
generatePortraits();
generatePreview();
console.log('Done.');
