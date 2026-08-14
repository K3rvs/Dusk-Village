const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Ensure output directory exists
const propsDir = path.join(__dirname, '..', 'assets', 'sprites', 'props');
fs.mkdirSync(propsDir, { recursive: true });

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

function drawCircle(png, cx, cy, r, color) {
    for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
            if (x * x + y * y <= r * r) {
                setPixel(png, cx + x, cy + y, color);
            }
        }
    }
}

function blitRegion(srcPng, srcX, srcY, srcW, srcH, dstPng, dstX, dstY) {
    for (let y = 0; y < srcH; y++) {
        for (let x = 0; x < srcW; x++) {
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
const PAL_TIMBER = [
    parseHex('#1C1007'), parseHex('#331E0E'), parseHex('#4D2E17'),
    parseHex('#6B4324'), parseHex('#8C5B34'), parseHex('#B07B4A')
];
const PAL_STONE = [
    parseHex('#1E252E'), parseHex('#333C47'), parseHex('#4C5866'),
    parseHex('#6A788A'), parseHex('#8C9CAF'), parseHex('#B0C0D4')
];
const PAL_STEEL = [
    parseHex('#2C3539'), parseHex('#455157'), parseHex('#5E6D75'),
    parseHex('#7A8A94'), parseHex('#96A8B3'), parseHex('#B3C8D4')
];
const PAL_RED = [
    parseHex('#4A0A0A'), parseHex('#7D1212'), parseHex('#A82424'),
    parseHex('#C83838'), parseHex('#E55555'), parseHex('#FF7777')
];
const PAL_BLUE = [
    parseHex('#0F1A2B'), parseHex('#1C2E4A'), parseHex('#2E456B'),
    parseHex('#47628F'), parseHex('#6685B8'), parseHex('#8FAEE0')
];
const PAL_GREEN = [
    parseHex('#0B1C06'), parseHex('#15380A'), parseHex('#274E13'),
    parseHex('#3D6E22'), parseHex('#589436'), parseHex('#7BC254')
];
const PAL_GOLD = [
    parseHex('#5C3E14'), parseHex('#8C5E1A'), parseHex('#C4801D'),
    parseHex('#F0A224'), parseHex('#FFC64A'), parseHex('#FFE28A')
];
const PAL_PARCHMENT = [
    parseHex('#8C7752'), parseHex('#B39A6D'), parseHex('#D9BD8A'),
    parseHex('#F2D7A6'), parseHex('#FFEFC2'), parseHex('#FFFFE0')
];

const C_SHADOW = parseHex('#11111166');
const C_GLOW_AMBER = parseHex('#F6AD55');
const C_GLOW_GREEN = parseHex('#27AE60');
const C_GLOW_CYAN = parseHex('#00FFFF');

function noise(x, y) {
    return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
}

// --- Outdoor Props ---

function drawOutdoorProps() {
    const png = new PNG({ width: 256, height: 256 });
    
    // 1. Swings (32x32) at (0, 0)
    drawRect(png, 0, 0, 32, 32, [0,0,0,0]); // bg
    // Frame
    drawRect(png, 4, 8, 4, 24, PAL_TIMBER[2]); // left leg
    drawRect(png, 24, 8, 4, 24, PAL_TIMBER[2]); // right leg
    drawRect(png, 2, 6, 28, 4, PAL_TIMBER[3]); // top bar
    drawRect(png, 2, 4, 28, 2, PAL_TIMBER[4]); // top bar highlight
    // Seats
    drawRect(png, 8, 10, 1, 14, PAL_STONE[2]); // rope L1
    drawRect(png, 13, 10, 1, 14, PAL_STONE[2]); // rope L2
    drawRect(png, 7, 24, 8, 3, PAL_RED[3]); // seat L
    
    drawRect(png, 18, 10, 1, 14, PAL_STONE[2]); // rope R1
    drawRect(png, 23, 10, 1, 14, PAL_STONE[2]); // rope R2
    drawRect(png, 17, 24, 8, 3, PAL_BLUE[3]); // seat R
    
    // 2. Slide (32x24) at (32, 0)
    // Ladder
    drawRect(png, 32 + 24, 8, 2, 16, PAL_STEEL[2]); // Ladder rails
    drawRect(png, 32 + 28, 8, 2, 16, PAL_STEEL[2]); 
    for(let y = 10; y < 24; y+=4) drawRect(png, 32+24, y, 6, 1, PAL_STEEL[3]); // rungs
    // Platform
    drawRect(png, 32 + 22, 6, 8, 2, PAL_RED[4]);
    // Slide chute
    for (let i = 0; i < 18; i++) {
        drawRect(png, 32 + 22 - i, 8 + Math.floor(i*0.8), 4, 4, PAL_RED[3]);
        drawRect(png, 32 + 22 - i + 1, 8 + Math.floor(i*0.8), 2, 2, PAL_RED[4]); // highlight
    }
    
    // 3. Bench Timber (32x16) at (64, 0)
    // Legs
    drawRect(png, 64 + 4, 12, 4, 4, PAL_STEEL[1]);
    drawRect(png, 64 + 24, 12, 4, 4, PAL_STEEL[1]);
    // Seat
    drawRect(png, 64 + 2, 8, 28, 4, PAL_TIMBER[3]);
    drawRect(png, 64 + 2, 8, 28, 1, PAL_TIMBER[4]);
    // Backrest
    drawRect(png, 64 + 2, 2, 28, 4, PAL_TIMBER[3]);
    drawRect(png, 64 + 2, 2, 28, 1, PAL_TIMBER[4]);
    // Connecting iron
    drawRect(png, 64 + 6, 6, 2, 2, PAL_STEEL[2]);
    drawRect(png, 64 + 24, 6, 2, 2, PAL_STEEL[2]);
    
    // 4. Lamp Post (16x32) at (96, 0)
    // Base
    drawRect(png, 96 + 4, 28, 8, 4, PAL_STEEL[1]);
    // Pole
    drawRect(png, 96 + 6, 10, 4, 18, PAL_STEEL[2]);
    drawRect(png, 96 + 6, 10, 1, 18, PAL_STEEL[1]); // shade
    // Lantern Housing
    drawRect(png, 96 + 3, 4, 10, 2, PAL_STEEL[3]); // top
    drawRect(png, 96 + 4, 2, 8, 2, PAL_STEEL[4]); // tip
    drawRect(png, 96 + 4, 6, 8, 6, PAL_STEEL[1]); // glass bg
    drawRect(png, 96 + 5, 7, 6, 4, C_GLOW_AMBER); // glow
    setPixel(png, 96+7, 8, PAL_PARCHMENT[5]); // core
    setPixel(png, 96+8, 8, PAL_PARCHMENT[5]); 
    drawRect(png, 96 + 3, 12, 10, 2, PAL_STEEL[2]); // bottom
    
    // 5. Water Well (32x32) at (0, 32)
    // Stone base
    for(let y=16; y<32; y++) {
        for(let x=4; x<28; x++) {
            let n = noise(x,y);
            let c = n > 0.8 ? PAL_STONE[2] : n > 0.4 ? PAL_STONE[3] : PAL_STONE[4];
            setPixel(png, x, 32+y, c);
            if(y==16) setPixel(png, x, 32+y, PAL_STONE[5]);
        }
    }
    drawRect(png, 8, 32+17, 16, 6, [30,30,40,255]); // hole
    // Pillars
    drawRect(png, 4, 32+8, 4, 16, PAL_TIMBER[3]);
    drawRect(png, 24, 32+8, 4, 16, PAL_TIMBER[3]);
    // Roof
    drawRect(png, 2, 32+2, 28, 8, PAL_TIMBER[1]); // roof back
    drawRect(png, 0, 32+4, 32, 6, PAL_RED[3]); // roof front
    drawRect(png, 0, 32+4, 32, 2, PAL_RED[4]); // roof highlight
    // Crank and bucket
    drawRect(png, 8, 32+12, 16, 2, PAL_TIMBER[4]); // beam
    drawRect(png, 28, 32+11, 2, 4, PAL_STEEL[3]); // crank
    drawRect(png, 14, 32+14, 1, 6, PAL_STONE[4]); // rope
    drawRect(png, 12, 32+20, 5, 6, PAL_TIMBER[2]); // bucket

    // 6. Notice Board (32x32) at (32, 32)
    // Legs
    drawRect(png, 32+4, 32+8, 4, 24, PAL_TIMBER[2]);
    drawRect(png, 32+24, 32+8, 4, 24, PAL_TIMBER[2]);
    // Board
    drawRect(png, 32+2, 32+4, 28, 16, PAL_TIMBER[3]); // frame
    drawRect(png, 32+4, 32+6, 24, 12, PAL_TIMBER[1]); // cork
    // Papers
    drawRect(png, 32+6, 32+8, 6, 6, PAL_PARCHMENT[5]); // white
    setPixel(png, 32+9, 32+9, PAL_RED[4]); // pin
    drawRect(png, 32+14, 32+10, 5, 5, PAL_GOLD[5]); // yellow
    setPixel(png, 32+16, 32+11, PAL_RED[4]);
    drawRect(png, 32+21, 32+7, 4, 5, PAL_RED[4]); // red
    
    // 7. Flower Cart (32x24) at (64, 32)
    // Cart Body
    drawRect(png, 64+4, 32+10, 24, 8, PAL_TIMBER[3]);
    drawRect(png, 64+4, 32+10, 24, 1, PAL_TIMBER[4]);
    // Wheels
    drawCircle(png, 64+8, 32+18, 4, PAL_TIMBER[2]);
    drawCircle(png, 64+8, 32+18, 1, PAL_STEEL[3]);
    drawCircle(png, 64+24, 32+18, 4, PAL_TIMBER[2]);
    drawCircle(png, 64+24, 32+18, 1, PAL_STEEL[3]);
    // Flowers (Red, Blue, Yellow bundles)
    for(let i=0; i<15; i++) {
        setPixel(png, 64+6+(i%8), 32+6+Math.floor(i/8), PAL_RED[4+i%2]);
        setPixel(png, 64+14+(i%6), 32+5+Math.floor(i/6), PAL_BLUE[4+i%2]);
        setPixel(png, 64+20+(i%7), 32+7+Math.floor(i/7), PAL_GOLD[4+i%2]);
    }
    
    // 8. Signpost (16x32) at (96, 32)
    // Post
    drawRect(png, 96+6, 32+4, 4, 28, PAL_TIMBER[2]);
    // Signs
    drawRect(png, 96+2, 32+6, 12, 4, PAL_TIMBER[4]); // Left
    setPixel(png, 96+3, 32+7, PAL_PARCHMENT[4]); // text
    setPixel(png, 96+5, 32+7, PAL_PARCHMENT[4]); 
    drawRect(png, 96+4, 32+12, 10, 4, PAL_TIMBER[4]); // Right
    
    // 9. Hay Bales (16x16) at (112, 32)
    // Round bale
    drawCircle(png, 112+8, 32+8, 6, PAL_GOLD[3]);
    drawCircle(png, 112+8, 32+8, 4, PAL_GOLD[4]);
    // Twine
    drawRect(png, 112+4, 32+8, 9, 1, PAL_GOLD[1]);

    // 10. Barrels and Crates (32x32) at (0, 64)
    // Crate 1 (bottom left)
    drawRect(png, 2, 64+16, 12, 12, PAL_TIMBER[3]);
    drawRect(png, 2, 64+16, 12, 1, PAL_TIMBER[4]); // edge
    drawRect(png, 2, 64+16, 1, 12, PAL_TIMBER[4]);
    drawRect(png, 13, 64+16, 1, 12, PAL_TIMBER[1]);
    drawRect(png, 2, 64+27, 12, 1, PAL_TIMBER[1]);
    // cross brace
    for(let i=0; i<10; i++) {
        setPixel(png, 3+i, 64+17+i, PAL_TIMBER[4]);
        setPixel(png, 12-i, 64+17+i, PAL_TIMBER[4]);
    }
    // Barrel (bottom right)
    drawRect(png, 16, 64+14, 12, 14, PAL_TIMBER[2]);
    drawRect(png, 18, 64+14, 8, 14, PAL_TIMBER[3]);
    // iron bands
    drawRect(png, 16, 64+17, 12, 2, PAL_STEEL[2]);
    drawRect(png, 16, 64+23, 12, 2, PAL_STEEL[2]);
    
    fs.writeFileSync(path.join(propsDir, 'outdoor_props.png'), PNG.sync.write(png));
    console.log('Generated outdoor_props.png');
}

// --- Interior Props ---

function drawInteriorProps() {
    const png = new PNG({ width: 256, height: 256 });
    
    // Village Hall: Council Table (64x24) at (0,0)
    // Table top
    drawRect(png, 4, 8, 56, 12, PAL_TIMBER[3]);
    drawRect(png, 4, 8, 56, 2, PAL_TIMBER[4]);
    // Legs
    drawRect(png, 8, 20, 4, 4, PAL_TIMBER[1]);
    drawRect(png, 52, 20, 4, 4, PAL_TIMBER[1]);
    // Papers
    drawRect(png, 12, 12, 6, 4, PAL_PARCHMENT[5]);
    drawRect(png, 32, 10, 8, 6, PAL_PARCHMENT[4]); // Map/large doc
    // Chairs (top and bottom)
    for(let i=0; i<3; i++) {
        drawRect(png, 16 + i*16, 4, 6, 6, PAL_RED[2]); // top chairs
        drawRect(png, 16 + i*16, 20, 6, 4, PAL_RED[3]); // bottom chairs
    }
    
    // Village Hall: Filing Cabinet (16x32) at (64, 0)
    drawRect(png, 64+2, 4, 12, 28, PAL_STEEL[2]);
    // Drawers
    for(let i=0; i<4; i++) {
        drawRect(png, 64+3, 6 + i*6, 10, 5, PAL_STEEL[3]);
        drawRect(png, 64+6, 8 + i*6, 4, 1, PAL_STEEL[1]); // handle
    }
    
    // Village Hall: Lectern (32x32) at (80, 0)
    drawRect(png, 80+12, 12, 8, 20, PAL_TIMBER[2]); // stand
    drawRect(png, 80+8, 8, 16, 8, PAL_TIMBER[4]); // top slanted
    // Open Ledger
    drawRect(png, 80+10, 10, 12, 4, PAL_PARCHMENT[5]);
    drawRect(png, 80+16, 10, 1, 4, PAL_TIMBER[1]); // spine
    
    // Library: Verification Podium (48x32) at (0, 32)
    // Base
    drawRect(png, 4, 32+16, 40, 16, PAL_STEEL[2]);
    drawRect(png, 6, 32+16, 36, 2, PAL_STEEL[4]);
    // Scanner pads (L/R)
    drawRect(png, 8, 32+14, 10, 2, PAL_STEEL[3]);
    drawRect(png, 30, 32+14, 10, 2, PAL_STEEL[3]);
    drawRect(png, 9, 32+14, 8, 1, C_GLOW_GREEN);
    drawRect(png, 31, 32+14, 8, 1, C_GLOW_GREEN);
    // Center hologram / light beam
    drawRect(png, 22, 32+4, 4, 12, C_GLOW_CYAN);
    for(let y=4; y<16; y+=2) setPixel(png, 23, 32+y, [255,255,255,255]); // core beam

    // Library: Database Terminal (32x32) at (48, 32)
    drawRect(png, 48+4, 32+16, 24, 16, PAL_STEEL[1]); // desk
    // Monitor
    drawRect(png, 48+8, 32+4, 16, 12, PAL_STEEL[2]);
    drawRect(png, 48+10, 32+6, 12, 8, [0,40,0,255]); // screen bg
    // Text on screen
    drawRect(png, 48+11, 32+7, 6, 1, C_GLOW_GREEN);
    drawRect(png, 48+11, 32+9, 10, 1, C_GLOW_GREEN);
    drawRect(png, 48+11, 32+11, 8, 1, C_GLOW_GREEN);
    
    // Library: Filing Shelves (48x48) at (80, 32)
    drawRect(png, 80+2, 32+2, 44, 46, PAL_TIMBER[2]); // back
    for(let y=12; y<48; y+=12) {
        drawRect(png, 80+2, 32+y, 44, 2, PAL_TIMBER[4]); // shelves
        // Books & Boxes on shelves
        let x = 80+4;
        while(x < 80+40) {
            let type = Math.floor(Math.random() * 3);
            let w = 2 + Math.floor(Math.random() * 4);
            let h = 6 + Math.floor(Math.random() * 4);
            if(type === 0) drawRect(png, x, 32+y-h, w, h, PAL_RED[3]);
            else if(type === 1) drawRect(png, x, 32+y-h, w, h, PAL_BLUE[3]);
            else drawRect(png, x, 32+y-h, w, h, PAL_PARCHMENT[4]); // box
            x += w + 1 + Math.floor(Math.random() * 3);
        }
    }
    
    // School: Desks (16x16) at (0, 80)
    drawRect(png, 2, 80+6, 12, 6, PAL_TIMBER[3]); // top
    drawRect(png, 2, 80+6, 12, 1, PAL_TIMBER[4]);
    drawRect(png, 3, 80+12, 2, 4, PAL_STEEL[2]); // legs
    drawRect(png, 11, 80+12, 2, 4, PAL_STEEL[2]);
    drawRect(png, 6, 80+14, 4, 2, PAL_TIMBER[2]); // seat
    // Book on desk
    drawRect(png, 8, 80+7, 4, 3, PAL_BLUE[4]);
    
    // School: Chalkboard (32x24) at (16, 80)
    drawRect(png, 16+2, 80+2, 28, 20, PAL_TIMBER[3]); // frame
    drawRect(png, 16+4, 80+4, 24, 16, [30,60,40,255]); // slate
    // scrawl
    drawRect(png, 16+6, 80+6, 8, 1, PAL_PARCHMENT[5]);
    drawRect(png, 16+6, 80+8, 12, 1, PAL_PARCHMENT[5]);
    drawRect(png, 16+6, 80+10, 18, 1, PAL_PARCHMENT[5]);
    drawRect(png, 16+6, 80+14, 10, 1, PAL_GOLD[4]); // yellow chalk
    
    // Clinic: Medicine Cabinet (32x32) at (48, 80)
    drawRect(png, 48+4, 80+4, 24, 28, PAL_STEEL[4]); // body
    drawRect(png, 48+6, 80+6, 20, 20, [100,120,130,255]); // glass
    drawRect(png, 48+6, 80+14, 20, 1, PAL_STEEL[3]); // shelf
    // Bottles
    drawRect(png, 48+8, 80+10, 3, 4, PAL_RED[4]);
    drawRect(png, 48+13, 80+11, 4, 3, PAL_GREEN[4]);
    drawRect(png, 48+19, 80+9, 3, 5, PAL_BLUE[4]);
    drawRect(png, 48+9, 80+18, 5, 6, PAL_PARCHMENT[5]);
    drawRect(png, 48+17, 80+19, 3, 5, PAL_GOLD[3]);
    
    // Clinic: Exam Table (32x16) at (80, 80)
    drawRect(png, 80+2, 80+6, 28, 6, PAL_STEEL[2]); // frame
    drawRect(png, 80+2, 80+4, 28, 2, PAL_PARCHMENT[5]); // paper sheet
    drawRect(png, 80+2, 80+4, 8, 4, PAL_STEEL[4]); // headrest
    drawRect(png, 80+4, 80+12, 2, 4, PAL_STEEL[1]); // legs
    drawRect(png, 80+26, 80+12, 2, 4, PAL_STEEL[1]);

    // Cottage: Bed (32x24) at (112, 80)
    drawRect(png, 112+2, 80+4, 28, 18, PAL_TIMBER[3]); // frame
    drawRect(png, 112+4, 80+6, 24, 14, PAL_RED[3]); // blanket (red avatar)
    drawRect(png, 112+4, 80+6, 6, 14, PAL_PARCHMENT[5]); // sheets
    drawRect(png, 112+5, 80+8, 4, 10, PAL_PARCHMENT[5]); // pillow
    
    fs.writeFileSync(path.join(propsDir, 'interior_props.png'), PNG.sync.write(png));
    console.log('Generated interior_props.png');
}

// Generate HTML preview
function generatePreview() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Dusk Village - Props Preview</title>
    <style>
        body { background: #222; color: #fff; font-family: sans-serif; padding: 20px; }
        .gallery { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
        img { image-rendering: pixelated; width: 512px; height: 512px; background: #2a2a2a; border: 1px solid #444; }
        h1, h2 { color: #F6AD55; }
    </style>
</head>
<body>
    <h1>Dusk Village Props</h1>
    <div class="gallery">
        <div class="card">
            <h2>Outdoor Props</h2>
            <img src="outdoor_props.png" alt="Outdoor Props">
        </div>
        <div class="card">
            <h2>Interior Props</h2>
            <img src="interior_props.png" alt="Interior Props">
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(propsDir, 'preview_props.html'), html);
    console.log('Generated preview_props.html');
}

// --- Execution ---
console.log('Starting prop generation...');
drawOutdoorProps();
drawInteriorProps();
generatePreview();
console.log('Done.');
