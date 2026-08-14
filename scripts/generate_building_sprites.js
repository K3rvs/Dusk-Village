const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const bldgDir = path.join(__dirname, '..', 'assets', 'sprites', 'buildings');
fs.mkdirSync(bldgDir, { recursive: true });

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
        const srcA = a / 255, dstA = png.data[idx + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA > 0) {
            png.data[idx] = Math.round((r * srcA + png.data[idx] * dstA * (1 - srcA)) / outA);
            png.data[idx+1] = Math.round((g * srcA + png.data[idx+1] * dstA * (1 - srcA)) / outA);
            png.data[idx+2] = Math.round((b * srcA + png.data[idx+2] * dstA * (1 - srcA)) / outA);
            png.data[idx+3] = Math.round(outA * 255);
        }
    } else { png.data[idx]=r; png.data[idx+1]=g; png.data[idx+2]=b; png.data[idx+3]=255; }
}
function drawRect(png, x, y, w, h, color) {
    for (let py = y; py < y+h; py++) for (let px = x; px < x+w; px++) setPixel(png, px, py, color);
}
function blitRegion(srcPng, srcX, srcY, srcW, srcH, dstPng, dstX, dstY) {
    for (let y = 0; y < srcH; y++) for (let x = 0; x < srcW; x++) {
        const idx = (srcPng.width*(srcY+y)+(srcX+x)) << 2;
        setPixel(dstPng, dstX+x, dstY+y, [srcPng.data[idx], srcPng.data[idx+1], srcPng.data[idx+2], srcPng.data[idx+3]]);
    }
}

const PAL_ROOF_RED    = ['#4A0A0A','#7D1212','#A82424','#C83838','#E55555','#FF7777'].map(parseHex);
const PAL_ROOF_BLUE   = ['#0F1A2B','#1C2E4A','#2E456B','#47628F','#6685B8','#8FAEE0'].map(parseHex);
const PAL_ROOF_GREEN  = ['#0B1C06','#15380A','#274E13','#3D6E22','#589436','#7BC254'].map(parseHex);
const PAL_ROOF_TIMBER = ['#2B170B','#422613','#5C3A1E','#7C512D','#9E6D43','#C28B5B'].map(parseHex);
const PAL_TIMBER_WALL = ['#1C1007','#331E0E','#4D2E17','#6B4324','#8C5B34','#B07B4A'].map(parseHex);
const PAL_BRICK_WALL  = ['#2E120B','#4D2015','#733324','#994634','#BD5E4B','#DE7A66'].map(parseHex);
const PAL_PLASTER_WALL= ['#5E5950','#857F73','#B8B2A4','#D9D3C5','#F0EAE0','#FFF9F0'].map(parseHex);
const PAL_STONE       = ['#1E252E','#333C47','#4C5866','#6A788A','#8C9CAF','#B0C0D4'].map(parseHex);
const C_GOLD_ACCENT = parseHex('#F39C12'), C_GOLD_BRIGHT = parseHex('#FCD05B');
const C_WINDOW_DAY = parseHex('#3B5A7D'), C_WINDOW_GLOW = parseHex('#F6AD55');
const C_WINDOW_BRT = parseHex('#FFF099'), C_WINDOW_FRAME = parseHex('#1C1007');
const C_IVY_GREEN = parseHex('#274E13'), C_IVY_LIGHT = parseHex('#4B8527');
const C_FLOWER_RED = parseHex('#C0392B'), C_FLOWER_YEL = parseHex('#F1C40F'), C_FLOWER_WHT = parseHex('#F5F0E1');
const C_SHADOW_ALPHA = [10, 15, 25, 120];

console.log('Generating building sprites: 7x7 civic (112x112px), 5x5 cottages (80x80px)...');

function drawDetailedShingleRoof(png, ox, oy, width, height, palette) {
    for (let y = 0; y < height; y++) {
        const progress = y / height;
        const rowWidth = Math.round(width * (0.6 + 0.4 * progress));
        const rowX = ox + Math.floor((width - rowWidth) / 2);
        const shadeIdx = Math.min(5, Math.floor(progress * 5));
        drawRect(png, rowX, oy + y, rowWidth, 1, palette[shadeIdx]);
        for (let x = 0; x < rowWidth; x += 4) {
            setPixel(png, rowX + x, oy + y, palette[Math.max(0, shadeIdx - 1)]);
            if (y % 3 === 0) setPixel(png, rowX + x + 1, oy + y, palette[Math.min(5, shadeIdx + 1)]);
        }
        if (y === 0) drawRect(png, rowX, oy, rowWidth, 1, PAL_STONE[3]);
    }
}

function drawDetailedWindow(png, x, y, w, h, isLit, hasFlowerBox = true) {
    drawRect(png, x - 2, y, 2, h, PAL_TIMBER_WALL[1]);
    drawRect(png, x + w, y, 2, h, PAL_TIMBER_WALL[1]);
    drawRect(png, x, y, w, h, C_WINDOW_FRAME);
    drawRect(png, x+1, y+1, w-2, h-2, isLit ? C_WINDOW_GLOW : C_WINDOW_DAY);
    if (w >= 6 && h >= 8) {
        drawRect(png, x+Math.floor(w/2), y+1, 1, h-2, C_WINDOW_FRAME);
        drawRect(png, x+1, y+Math.floor(h/2), w-2, 1, C_WINDOW_FRAME);
    }
    if (isLit) { setPixel(png, x+2, y+2, C_WINDOW_BRT); drawRect(png, x-2, y+h, w+4, 3, [246,173,85,80]); }
    if (hasFlowerBox) {
        drawRect(png, x-1, y+h-1, w+2, 3, PAL_TIMBER_WALL[2]);
        drawRect(png, x-1, y+h-2, w+2, 2, C_IVY_GREEN);
        setPixel(png, x, y+h-2, C_FLOWER_RED);
        setPixel(png, x+2, y+h-2, C_FLOWER_YEL);
        setPixel(png, x+w-2, y+h-2, C_FLOWER_WHT);
    }
}

// =========================================================================
// 1. VILLAGE HALL — 7x7 tiles = 112x112px, dual frame = 224x112px
// =========================================================================
const vhallPng = new PNG({ width: 224, height: 112 });
function drawVillageHall(ox, isNight) {
    drawRect(vhallPng, ox+4, 104, 104, 8, C_SHADOW_ALPHA);
    drawRect(vhallPng, ox+8, 90, 96, 18, PAL_STONE[2]);
    for (let x = 8; x < 104; x += 6) drawRect(vhallPng, ox+x, 90, 1, 18, PAL_STONE[0]);
    drawRect(vhallPng, ox+8, 38, 96, 52, PAL_TIMBER_WALL[3]);
    for (let x = 12; x < 100; x += 6) drawRect(vhallPng, ox+x, 38, 1, 52, PAL_TIMBER_WALL[1]);
    drawRect(vhallPng, ox+8, 60, 96, 3, PAL_TIMBER_WALL[1]);
    drawRect(vhallPng, ox+8, 38, 96, 2, PAL_TIMBER_WALL[0]);
    drawDetailedShingleRoof(vhallPng, ox+4, 18, 104, 22, PAL_ROOF_RED);
    drawRect(vhallPng, ox+44, 0, 24, 30, PAL_TIMBER_WALL[2]);
    drawDetailedShingleRoof(vhallPng, ox+40, 0, 32, 12, PAL_ROOF_RED);
    drawRect(vhallPng, ox+55, 0, 2, 5, C_GOLD_ACCENT);
    setPixel(vhallPng, ox+54, 1, C_GOLD_BRIGHT); setPixel(vhallPng, ox+57, 1, C_GOLD_BRIGHT);
    drawRect(vhallPng, ox+47, 12, 18, 18, parseHex('#FFF3CD'));
    drawRect(vhallPng, ox+48, 13, 16, 16, parseHex('#F5E6C8'));
    setPixel(vhallPng, ox+55, 20, parseHex('#1A1A2E'));
    drawRect(vhallPng, ox+55, 16, 1, 4, parseHex('#1A1A2E'));
    drawRect(vhallPng, ox+55, 20, 4, 1, parseHex('#1A1A2E'));
    drawRect(vhallPng, ox+40, 92, 32, 14, PAL_STONE[3]);
    drawRect(vhallPng, ox+38, 97, 36, 8, PAL_STONE[4]);
    drawRect(vhallPng, ox+36, 103, 40, 5, PAL_STONE[2]);
    drawRect(vhallPng, ox+45, 62, 22, 30, PAL_TIMBER_WALL[0]);
    drawRect(vhallPng, ox+46, 63, 9, 28, PAL_TIMBER_WALL[2]);
    drawRect(vhallPng, ox+57, 63, 9, 28, PAL_TIMBER_WALL[2]);
    setPixel(vhallPng, ox+53, 76, C_GOLD_BRIGHT); setPixel(vhallPng, ox+58, 76, C_GOLD_BRIGHT);
    drawRect(vhallPng, ox+36, 58, 6, 22, PAL_ROOF_RED[2]); drawRect(vhallPng, ox+37, 59, 4, 19, PAL_ROOF_RED[4]); setPixel(vhallPng, ox+38, 65, C_GOLD_BRIGHT);
    drawRect(vhallPng, ox+70, 58, 6, 22, PAL_ROOF_BLUE[2]); drawRect(vhallPng, ox+71, 59, 4, 19, PAL_ROOF_BLUE[4]); setPixel(vhallPng, ox+72, 65, C_GOLD_BRIGHT);
    drawRect(vhallPng, ox+8, 64, 6, 20, C_IVY_GREEN); setPixel(vhallPng, ox+10, 62, C_IVY_LIGHT);
    drawRect(vhallPng, ox+98, 66, 6, 18, C_IVY_GREEN);
    [14, 24, 78, 88].forEach(wx => {
        drawDetailedWindow(vhallPng, ox+wx, 40, 6, 12, isNight, true);
        drawDetailedWindow(vhallPng, ox+wx, 60, 6, 12, isNight, false);
    });
}
drawVillageHall(0, false); drawVillageHall(112, true);
fs.writeFileSync(path.join(bldgDir, 'spr_bldg_villagehall.png'), PNG.sync.write(vhallPng));
console.log('  -> spr_bldg_villagehall.png (224x112, 7x7 tiles)');

// =========================================================================
// 2. UNIVERSITY LIBRARY — 7x7 tiles = 112x112px, dual frame = 224x112px
// =========================================================================
const libPng = new PNG({ width: 224, height: 112 });
function drawLibrary(ox, isNight) {
    drawRect(libPng, ox+4, 104, 104, 8, C_SHADOW_ALPHA);
    drawRect(libPng, ox+8, 28, 96, 76, PAL_BRICK_WALL[2]);
    for (let y = 28; y < 104; y += 4) {
        const shift = (Math.floor(y/4) % 2) * 4;
        for (let bx = 8; bx < 104; bx += 8) {
            const startX = bx + shift; if (startX >= 104) continue;
            const bWidth = Math.min(7, 104 - startX);
            drawRect(libPng, ox+startX, y, bWidth, 3, PAL_BRICK_WALL[Math.floor((bx+y)%3+1)]);
            setPixel(libPng, ox+startX, y, PAL_BRICK_WALL[0]);
        }
    }
    drawDetailedShingleRoof(libPng, ox+4, 8, 104, 22, PAL_ROOF_BLUE);
    drawRect(libPng, ox+10, 28, 8, 76, PAL_PLASTER_WALL[4]); drawRect(libPng, ox+94, 28, 8, 76, PAL_PLASTER_WALL[4]);
    for (let y = 28; y < 104; y += 8) { setPixel(libPng, ox+10, y, PAL_PLASTER_WALL[1]); setPixel(libPng, ox+94, y, PAL_PLASTER_WALL[1]); }
    [22, 38, 66, 82].forEach(wx => {
        drawDetailedWindow(libPng, ox+wx, 36, 10, 18, isNight, true);
        drawDetailedWindow(libPng, ox+wx, 66, 10, 18, isNight, true);
    });
    drawRect(libPng, ox+48, 68, 16, 36, PAL_TIMBER_WALL[0]); drawRect(libPng, ox+49, 69, 14, 34, PAL_TIMBER_WALL[2]); setPixel(libPng, ox+60, 84, C_GOLD_BRIGHT);
    drawRect(libPng, ox+52, 24, 10, 10, parseHex('#4A5568')); drawRect(libPng, ox+53, 25, 8, 8, parseHex('#FFF3CD')); setPixel(libPng, ox+57, 29, parseHex('#9E2424'));
}
drawLibrary(0, false); drawLibrary(112, true);
fs.writeFileSync(path.join(bldgDir, 'spr_bldg_library.png'), PNG.sync.write(libPng));
console.log('  -> spr_bldg_library.png (224x112, 7x7 tiles)');

// =========================================================================
// 3. THE SCHOOL — 7x7 tiles = 112x112px, dual frame = 224x112px
// =========================================================================
const schoolPng = new PNG({ width: 224, height: 112 });
function drawSchool(ox, isNight) {
    drawRect(schoolPng, ox+4, 104, 104, 8, C_SHADOW_ALPHA);
    drawRect(schoolPng, ox+8, 34, 96, 70, PAL_TIMBER_WALL[2]);
    for (let y = 34; y < 104; y += 4) { drawRect(schoolPng, ox+8, y, 96, 1, PAL_TIMBER_WALL[0]); drawRect(schoolPng, ox+8, y+1, 96, 1, PAL_TIMBER_WALL[4]); }
    drawDetailedShingleRoof(schoolPng, ox+4, 10, 104, 26, PAL_ROOF_TIMBER);
    drawRect(schoolPng, ox+4, 34, 104, 3, PAL_ROOF_BLUE[3]);
    drawRect(schoolPng, ox+50, 0, 12, 12, PAL_TIMBER_WALL[1]); setPixel(schoolPng, ox+55, 5, C_GOLD_BRIGHT);
    drawRect(schoolPng, ox+52, 16, 8, 10, parseHex('#274E13')); setPixel(schoolPng, ox+55, 20, parseHex('#F5F0E1'));
    [14, 30, 68, 84].forEach(wx => {
        drawDetailedWindow(schoolPng, ox+wx, 40, 10, 14, isNight, true);
        drawDetailedWindow(schoolPng, ox+wx, 64, 10, 14, isNight, true);
    });
    drawRect(schoolPng, ox+48, 68, 16, 36, PAL_TIMBER_WALL[0]);
    drawRect(schoolPng, ox+46, 64, 20, 5, PAL_ROOF_BLUE[2]);
}
drawSchool(0, false); drawSchool(112, true);
fs.writeFileSync(path.join(bldgDir, 'spr_bldg_school.png'), PNG.sync.write(schoolPng));
console.log('  -> spr_bldg_school.png (224x112, 7x7 tiles)');

// =========================================================================
// 4. HEALTHCARE CLINIC — 7x7 tiles = 112x112px, dual frame = 224x112px
// =========================================================================
const clinicPng = new PNG({ width: 224, height: 112 });
function drawClinic(ox, isNight) {
    drawRect(clinicPng, ox+4, 104, 104, 8, C_SHADOW_ALPHA);
    drawRect(clinicPng, ox+8, 30, 96, 74, PAL_PLASTER_WALL[4]);
    drawRect(clinicPng, ox+8, 30, 4, 74, PAL_TIMBER_WALL[1]); drawRect(clinicPng, ox+100, 30, 4, 74, PAL_TIMBER_WALL[1]);
    drawRect(clinicPng, ox+8, 60, 96, 3, PAL_TIMBER_WALL[1]);
    drawDetailedShingleRoof(clinicPng, ox+4, 8, 104, 24, PAL_ROOF_RED);
    drawRect(clinicPng, ox+50, 12, 16, 16, parseHex('#F5F0E1'));
    drawRect(clinicPng, ox+57, 13, 2, 14, parseHex('#C0392B')); drawRect(clinicPng, ox+52, 18, 12, 2, parseHex('#C0392B'));
    [16, 30, 68, 82].forEach(wx => {
        drawDetailedWindow(clinicPng, ox+wx, 38, 8, 12, isNight, true);
        drawDetailedWindow(clinicPng, ox+wx, 62, 8, 12, isNight, true);
    });
    drawRect(clinicPng, ox+50, 70, 14, 34, PAL_TIMBER_WALL[1]);
    drawRect(clinicPng, ox+14, 86, 24, 8, parseHex('#274E13'));
    setPixel(clinicPng, ox+16, 88, C_FLOWER_RED); setPixel(clinicPng, ox+20, 88, C_FLOWER_WHT); setPixel(clinicPng, ox+24, 88, C_FLOWER_RED);
    drawRect(clinicPng, ox+78, 86, 20, 8, parseHex('#274E13'));
    setPixel(clinicPng, ox+80, 88, C_FLOWER_YEL); setPixel(clinicPng, ox+84, 88, C_FLOWER_WHT);
}
drawClinic(0, false); drawClinic(112, true);
fs.writeFileSync(path.join(bldgDir, 'spr_bldg_clinic.png'), PNG.sync.write(clinicPng));
console.log('  -> spr_bldg_clinic.png (224x112, 7x7 tiles)');

// =========================================================================
// 5. PLAYER COTTAGES H01-H10 — 5x5 tiles = 80x80px per frame
//    10 day (col 0-9) + 10 night (col 10-19) = 1600x80px total
// =========================================================================
const cottagePng = new PNG({ width: 1600, height: 80 });
const roofPalettes = [PAL_ROOF_RED, PAL_ROOF_BLUE, PAL_ROOF_GREEN, PAL_ROOF_TIMBER];
function drawCottage(hIdx, ox, isNight) {
    const rPal = roofPalettes[Math.min(3, Math.floor(hIdx / 2.5))];
    // 1. Soft ground shadow at bottom edge (y = 72..76)
    drawRect(cottagePng, ox+4, 72, 72, 4, C_SHADOW_ALPHA);
    // 2. Main timber wall extending down from y = 20 to y = 68 (48px tall)
    drawRect(cottagePng, ox+6, 20, 68, 48, PAL_TIMBER_WALL[3]);
    for (let y = 20; y < 68; y += 4) {
        drawRect(cottagePng, ox+6, y, 68, 1, PAL_TIMBER_WALL[0]);
        drawRect(cottagePng, ox+6, y+1, 68, 1, PAL_TIMBER_WALL[4]);
    }
    // 3. Thin 4px stone foundation trim at bottom of wall (y = 68..72)
    drawRect(cottagePng, ox+6, 68, 68, 4, PAL_STONE[2]);
    for (let x = 6; x < 74; x += 8) setPixel(cottagePng, ox+x, 68, PAL_STONE[0]);

    // 4. Roof & Chimney
    drawDetailedShingleRoof(cottagePng, ox+3, 4, 74, 18, rPal);
    drawRect(cottagePng, ox+58, 0, 8, 14, PAL_STONE[2]);
    setPixel(cottagePng, ox+61, 0, parseHex('#FFF5E0'));

    // 5. Windows
    drawDetailedWindow(cottagePng, ox+10, 24, 10, 14, isNight, true);
    drawDetailedWindow(cottagePng, ox+44, 24, 10, 14, isNight, true);

    // 6. Front Door extending down to doorstep (y = 28..68)
    drawRect(cottagePng, ox+27, 28, 14, 40, PAL_TIMBER_WALL[0]);
    drawRect(cottagePng, ox+28, 29, 12, 38, PAL_TIMBER_WALL[2]);
    setPixel(cottagePng, ox+38, 48, C_GOLD_BRIGHT);

    // 7. Stone Doorstep at bottom of door (y = 68..72)
    drawRect(cottagePng, ox+23, 68, 22, 4, PAL_STONE[3]);
    drawRect(cottagePng, ox+24, 69, 20, 2, PAL_STONE[4]);

    // 8. Mailbox / Decor
    drawRect(cottagePng, ox+66, 44, 3, 14, PAL_TIMBER_WALL[0]);
    drawRect(cottagePng, ox+62, 38, 9, 7, parseHex('#4A5568'));
    setPixel(cottagePng, ox+69, 39, C_FLOWER_RED);
}
for (let i = 0; i < 10; i++) { drawCottage(i, i*80, false); drawCottage(i, (i+10)*80, true); }
fs.writeFileSync(path.join(bldgDir, 'spr_bldg_cottages.png'), PNG.sync.write(cottagePng));
console.log('  -> spr_bldg_cottages.png (1600x80, 5x5 tiles each)');

// =========================================================================
// 6. ANGEL STATUE (96x48 px, 3 states)
// =========================================================================
const statuePng = new PNG({ width: 96, height: 48 });
function drawStatue(ox, state) {
    drawRect(statuePng, ox+4, 36, 24, 10, PAL_STONE[2]); drawRect(statuePng, ox+6, 32, 20, 4, PAL_STONE[3]);
    drawRect(statuePng, ox+8, 28, 16, 4, PAL_STONE[4]); drawRect(statuePng, ox+4, 40, 6, 6, C_IVY_GREEN);
    drawRect(statuePng, ox+12, 10, 8, 18, PAL_STONE[4]); drawRect(statuePng, ox+5, 12, 7, 12, PAL_STONE[3]);
    drawRect(statuePng, ox+20, 12, 7, 12, PAL_STONE[3]); drawRect(statuePng, ox+14, 4, 4, 6, PAL_STONE[5]);
    let lc = state===1 ? parseHex('#3B68B8') : state===2 ? parseHex('#FCE066') : parseHex('#F6AD55');
    drawRect(statuePng, ox+14, 16, 4, 5, lc);
    if (state > 0) { drawRect(statuePng, ox+10, 12, 12, 13, [lc[0],lc[1],lc[2],80]); drawRect(statuePng, ox+6, 8, 20, 21, [lc[0],lc[1],lc[2],40]); }
}
drawStatue(0, 0); drawStatue(32, 1); drawStatue(64, 2);
fs.writeFileSync(path.join(bldgDir, 'spr_statue_angel.png'), PNG.sync.write(statuePng));
console.log('  -> spr_statue_angel.png (96x48)');

// =========================================================================
// 7. IRON GATES (64x32 px)
// =========================================================================
const gatePng = new PNG({ width: 64, height: 32 });
function drawGate(ox, isOpen) {
    drawRect(gatePng, ox+2, 4, 6, 24, PAL_STONE[3]); drawRect(gatePng, ox+24, 4, 6, 24, PAL_STONE[3]);
    drawRect(gatePng, ox+3, 2, 4, 2, C_GOLD_BRIGHT); drawRect(gatePng, ox+25, 2, 4, 2, C_GOLD_BRIGHT);
    if (!isOpen) {
        for (let x = 9; x <= 22; x += 3) { drawRect(gatePng, ox+x, 6, 1, 18, parseHex('#1C222B')); setPixel(gatePng, ox+x, 5, C_GOLD_BRIGHT); }
        drawRect(gatePng, ox+8, 10, 16, 2, parseHex('#1C222B')); drawRect(gatePng, ox+8, 18, 16, 2, parseHex('#1C222B'));
    } else { drawRect(gatePng, ox+9, 6, 2, 18, parseHex('#1C222B')); drawRect(gatePng, ox+21, 6, 2, 18, parseHex('#1C222B')); }
}
drawGate(0, false); drawGate(32, true);
fs.writeFileSync(path.join(bldgDir, 'spr_gate_iron.png'), PNG.sync.write(gatePng));
console.log('  -> spr_gate_iron.png (64x32)');

// =========================================================================
// 8. MAILBOXES (160x16 px)
// =========================================================================
const mboxPng = new PNG({ width: 160, height: 16 });
for (let i = 0; i < 10; i++) {
    const ox = i * 16;
    drawRect(mboxPng, ox+6, 8, 2, 7, PAL_TIMBER_WALL[1]); drawRect(mboxPng, ox+4, 3, 7, 6, parseHex('#4A5568')); setPixel(mboxPng, ox+9, 4, parseHex('#C0392B'));
}
fs.writeFileSync(path.join(bldgDir, 'spr_mailboxes.png'), PNG.sync.write(mboxPng));
console.log('  -> spr_mailboxes.png (160x16)');

// =========================================================================
// 9. BUILDING BADGES (48x16 px)
// =========================================================================
const badgePng = new PNG({ width: 48, height: 16 });
drawRect(badgePng, 4, 4, 8, 8, parseHex('#4A5568')); drawRect(badgePng, 5, 5, 6, 6, parseHex('#FFF3CD')); setPixel(badgePng, 8, 8, parseHex('#C0392B'));
drawRect(badgePng, 20, 4, 8, 8, parseHex('#F5F0E1')); drawRect(badgePng, 23, 5, 2, 6, parseHex('#C0392B')); drawRect(badgePng, 21, 7, 6, 2, parseHex('#C0392B'));
drawRect(badgePng, 36, 4, 8, 8, parseHex('#274E13')); setPixel(badgePng, 39, 7, parseHex('#F5F0E1'));
fs.writeFileSync(path.join(bldgDir, 'building_badges.png'), PNG.sync.write(badgePng));
console.log('  -> building_badges.png (48x16)');

// =========================================================================
// 10. MASTER ATLAS
// =========================================================================
const masterAtlas = new PNG({ width: 512, height: 368 });
blitRegion(vhallPng, 0, 0, 224, 112, masterAtlas, 0, 0);
blitRegion(libPng, 0, 0, 224, 112, masterAtlas, 0, 112);
blitRegion(schoolPng, 0, 0, 224, 112, masterAtlas, 0, 224);
blitRegion(clinicPng, 0, 0, 224, 112, masterAtlas, 0, 336);
blitRegion(statuePng, 0, 0, 96, 48, masterAtlas, 288, 0);
blitRegion(gatePng, 0, 0, 64, 32, masterAtlas, 288, 48);
fs.writeFileSync(path.join(bldgDir, 'tileset_buildings_master.png'), PNG.sync.write(masterAtlas));
console.log('  -> tileset_buildings_master.png (512x368)');

console.log('Done! Civic=7x7 tiles (112x112px), Cottages=5x5 tiles (80x80px)');
