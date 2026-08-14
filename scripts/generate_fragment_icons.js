const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Ensure output directory exists
const iconsDir = path.join(__dirname, '..', 'assets', 'sprites', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

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

function drawBorder(png, x, y, w, h, color) {
    drawRect(png, x, y, w, 1, color);
    drawRect(png, x, y+h-1, w, 1, color);
    drawRect(png, x, y, 1, h, color);
    drawRect(png, x+w-1, y, 1, h, color);
}

// Master Color Palettes (UI Style Guide)
const C_ALERT_RED = parseHex('#C0392B');
const C_ALERT_RED_DARK = parseHex('#922B21');
const C_VERIFIED_GREEN = parseHex('#27AE60');
const C_VERIFIED_GREEN_DARK = parseHex('#1E8449');
const C_PARCHMENT = parseHex('#E8D5A3');
const C_PARCHMENT_DARK = parseHex('#B39A6D');
const C_WHITE = parseHex('#F5F0E1');
const C_DARK_ROAST = parseHex('#3E2713');
const C_DUSK_BLUE = parseHex('#0F3460');
const C_DUSK_BLUE_LIGHT = parseHex('#1A5276');
const C_CAUTION_AMBER = parseHex('#F39C12');
const C_INTRIGUE_VIOLET = parseHex('#8E44AD');

const C_SHADOW = [20, 20, 30, 150];

// --- Memory Fragment Icons (16x16) ---

function drawMemoryFragments() {
    // 4 cols x 4 rows = 16 icons. 64x64 total atlas.
    const png = new PNG({ width: 64, height: 64 });
    
    // Fill transparent bg
    drawRect(png, 0, 0, 64, 64, [0,0,0,0]);

    // Row 0: Counterfeit Cure (Claim, Context, Source)
    // 0,0: Claim (Green flyer with leaf icon & "CURE!")
    drawRect(png, 2, 2, 12, 14, C_VERIFIED_GREEN);
    drawBorder(png, 2, 2, 12, 14, C_VERIFIED_GREEN_DARK);
    // leaf icon
    setPixel(png, 7, 5, C_WHITE);
    setPixel(png, 8, 5, C_WHITE);
    setPixel(png, 6, 6, C_WHITE);
    setPixel(png, 9, 6, C_WHITE);
    setPixel(png, 7, 7, C_WHITE);
    setPixel(png, 8, 7, C_WHITE);
    // "CURE!" scrawl
    drawRect(png, 4, 10, 8, 2, C_WHITE);
    drawRect(png, 4, 13, 8, 1, C_WHITE);
    
    // 16,0: Context (Open ledger with red health graph)
    drawRect(png, 16+1, 3, 14, 10, C_PARCHMENT); // book
    drawBorder(png, 16+1, 3, 14, 10, C_PARCHMENT_DARK);
    drawRect(png, 16+7, 2, 2, 12, C_DARK_ROAST); // spine
    // red graph
    setPixel(png, 16+3, 10, C_ALERT_RED);
    setPixel(png, 16+4, 9, C_ALERT_RED);
    setPixel(png, 16+5, 6, C_ALERT_RED);
    setPixel(png, 16+10, 8, C_ALERT_RED);
    setPixel(png, 16+11, 7, C_ALERT_RED);
    setPixel(png, 16+12, 10, C_ALERT_RED);

    // 32,0: Source (Red folder stamped "FRAUD")
    drawRect(png, 32+2, 4, 12, 10, C_ALERT_RED);
    drawBorder(png, 32+2, 4, 12, 10, C_ALERT_RED_DARK);
    drawRect(png, 32+4, 2, 4, 2, C_ALERT_RED); // tab
    drawRect(png, 32+4, 7, 8, 4, C_WHITE); // stamp bg
    drawRect(png, 32+5, 8, 6, 2, C_ALERT_RED_DARK); // "FRAUD" text

    // Row 1: Silent Hallways
    // 0,16: Claim (Printed chat bubbles with angry emoji)
    drawRect(png, 2, 16+2, 12, 12, C_WHITE); // paper
    drawBorder(png, 2, 16+2, 12, 12, C_PARCHMENT_DARK);
    drawRect(png, 4, 16+4, 6, 4, C_DUSK_BLUE); // bubble 1
    drawRect(png, 6, 16+9, 6, 4, C_CAUTION_AMBER); // bubble 2
    setPixel(png, 8, 16+10, C_ALERT_RED); // angry eye
    setPixel(png, 10, 16+10, C_ALERT_RED);

    // 16,16: Context (Sealed envelope with tear-stain)
    drawRect(png, 16+2, 16+4, 12, 8, C_PARCHMENT);
    drawBorder(png, 16+2, 16+4, 12, 8, C_DARK_ROAST);
    // V flap
    for(let i=0; i<6; i++) {
        setPixel(png, 16+2+i, 16+4+i, C_DARK_ROAST);
        setPixel(png, 16+13-i, 16+4+i, C_DARK_ROAST);
    }
    // tear stain
    drawRect(png, 16+10, 16+8, 2, 2, C_DUSK_BLUE_LIGHT);

    // 32,16: Source (Screen showing IP address trace)
    drawRect(png, 32+2, 16+2, 12, 12, C_DUSK_BLUE);
    drawBorder(png, 32+2, 16+2, 12, 12, C_DUSK_BLUE_LIGHT);
    drawRect(png, 32+4, 16+4, 8, 8, [0,40,0,255]); // screen
    // IP trace green lines
    drawRect(png, 32+5, 16+5, 6, 1, C_VERIFIED_GREEN);
    drawRect(png, 32+5, 16+7, 4, 1, C_VERIFIED_GREEN);
    drawRect(png, 32+5, 16+9, 6, 1, C_VERIFIED_GREEN);

    // Row 2: Breaking Point
    // 0,32: Claim (Official form stamped "LEAVE")
    drawRect(png, 3, 32+2, 10, 14, C_WHITE);
    drawBorder(png, 3, 32+2, 10, 14, C_PARCHMENT_DARK);
    // lines
    drawRect(png, 5, 32+4, 6, 1, C_DUSK_BLUE_LIGHT);
    drawRect(png, 5, 32+6, 6, 1, C_DUSK_BLUE_LIGHT);
    drawRect(png, 5, 32+8, 6, 1, C_DUSK_BLUE_LIGHT);
    // leave stamp
    drawRect(png, 4, 32+10, 8, 4, C_ALERT_RED);
    drawRect(png, 5, 32+11, 6, 2, C_WHITE); // text

    // 16,32: Context (Counselor clipboard with sad icon)
    drawRect(png, 16+3, 32+3, 10, 12, C_DARK_ROAST); // board
    drawRect(png, 16+4, 32+4, 8, 10, C_WHITE); // paper
    drawRect(png, 16+6, 32+2, 4, 2, C_DUSK_BLUE); // clip
    // sad face
    drawRect(png, 16+6, 32+7, 4, 4, C_CAUTION_AMBER);
    setPixel(png, 16+7, 32+8, C_DARK_ROAST);
    setPixel(png, 16+8, 32+8, C_DARK_ROAST);
    drawRect(png, 16+7, 32+10, 2, 1, C_DARK_ROAST);

    // 32,32: Source (Continuous-feed chat printout)
    drawRect(png, 32+4, 32+1, 8, 14, C_WHITE); // paper feed
    drawBorder(png, 32+4, 32+1, 8, 14, C_PARCHMENT_DARK);
    // perforated edges
    for(let y=1; y<15; y+=2) {
        setPixel(png, 32+3, 32+y, C_WHITE);
        setPixel(png, 32+12, 32+y, C_WHITE);
    }
    // text
    drawRect(png, 32+6, 32+3, 4, 1, C_DUSK_BLUE);
    drawRect(png, 32+6, 32+6, 4, 1, C_ALERT_RED);
    drawRect(png, 32+6, 32+9, 4, 1, C_DUSK_BLUE);
    drawRect(png, 32+6, 32+12, 4, 1, C_ALERT_RED);

    // Row 3: Illusory Truth & Empty Vault
    // 0,48: Claim (Illusory Truth) - Photo frame with cracked glass
    drawRect(png, 2, 48+2, 12, 12, C_DARK_ROAST); // frame
    drawRect(png, 3, 48+3, 10, 10, C_WHITE); // photo bg
    drawRect(png, 4, 48+4, 8, 8, C_DUSK_BLUE_LIGHT); // photo content
    // crack
    setPixel(png, 10, 48+4, C_WHITE);
    setPixel(png, 9, 48+5, C_WHITE);
    setPixel(png, 9, 48+6, C_WHITE);
    setPixel(png, 8, 48+7, C_WHITE);
    setPixel(png, 7, 48+8, C_WHITE);

    // 16,48: Context (Software purchase receipt)
    drawRect(png, 16+4, 48+2, 8, 12, C_WHITE);
    drawBorder(png, 16+4, 48+2, 8, 12, C_PARCHMENT_DARK);
    // barcode / items
    drawRect(png, 16+6, 48+4, 4, 2, C_DARK_ROAST);
    drawRect(png, 16+6, 48+7, 4, 1, C_DUSK_BLUE);
    drawRect(png, 16+6, 48+9, 4, 1, C_DUSK_BLUE);
    drawRect(png, 16+6, 48+11, 4, 1, C_VERIFIED_GREEN_DARK); // total

    // 32,48: Source (Photo with "METADATA" data overlay)
    drawRect(png, 32+2, 48+3, 12, 10, C_WHITE); // photo border
    drawRect(png, 32+3, 48+4, 10, 8, C_DUSK_BLUE); // photo
    // metadata text overlay
    drawRect(png, 32+4, 48+5, 8, 3, [0,200,0,200]); // transparent green block
    drawRect(png, 32+5, 48+6, 6, 1, C_WHITE); // "DATA"

    // 48,0: Empty Vault Claim (Red letter with "URGENT" & hook icon)
    drawRect(png, 48+2, 4, 12, 8, C_ALERT_RED);
    drawBorder(png, 48+2, 4, 12, 8, C_ALERT_RED_DARK);
    // URGENT stamp
    drawRect(png, 48+4, 5, 8, 2, C_WHITE);
    // hook icon
    drawRect(png, 48+7, 8, 2, 3, C_CAUTION_AMBER);
    setPixel(png, 48+6, 10, C_CAUTION_AMBER);

    // 48,16: Context (Bank ledger with red money arrows)
    drawRect(png, 48+1, 16+3, 14, 10, C_DARK_ROAST); // book cover
    drawRect(png, 48+2, 16+4, 12, 8, C_PARCHMENT); // pages
    // red arrows down
    drawRect(png, 48+4, 16+6, 2, 4, C_ALERT_RED);
    setPixel(png, 48+3, 16+9, C_ALERT_RED);
    setPixel(png, 48+6, 16+9, C_ALERT_RED);
    drawRect(png, 48+10, 16+6, 2, 4, C_ALERT_RED);
    setPixel(png, 48+9, 16+9, C_ALERT_RED);
    setPixel(png, 48+12, 16+9, C_ALERT_RED);

    // 48,32: Source (Orange folder "SCAM REGISTRY")
    drawRect(png, 48+2, 32+4, 12, 10, C_CAUTION_AMBER);
    drawBorder(png, 48+2, 32+4, 12, 10, C_DARK_ROAST);
    drawRect(png, 48+4, 32+2, 4, 2, C_CAUTION_AMBER); // tab
    // label
    drawRect(png, 48+4, 32+7, 8, 4, C_WHITE);
    drawRect(png, 48+5, 32+8, 6, 2, C_DARK_ROAST); // "SCAM" text

    // 48,48: Generic World Scroll (2 frames horizontally, 32x16px total)
    // Frame 1 (Normal)
    drawRect(png, 48+4, 48+2, 8, 12, C_PARCHMENT);
    drawBorder(png, 48+4, 48+2, 8, 12, C_DARK_ROAST);
    drawRect(png, 48+6, 48+4, 4, 1, C_DARK_ROAST);
    drawRect(png, 48+6, 48+6, 4, 1, C_DARK_ROAST);
    drawRect(png, 48+6, 48+8, 4, 1, C_DARK_ROAST);
    // Frame 2 (Glowing, shift right by 16 if we were putting it in a row. Let's just put it here and pretend it's a 32x16 sprite internally by adjusting coordinates)
    // Actually, we'll write `spr_frag_world_pulse.png` as a separate 32x16 file.

    fs.writeFileSync(path.join(iconsDir, 'memory_fragments.png'), PNG.sync.write(png));
    console.log('Generated memory_fragments.png (15 MIL Icons)');

    // -- Generate 32x16 world scroll
    const scrollPng = new PNG({ width: 32, height: 16 });
    drawRect(scrollPng, 0, 0, 32, 16, [0,0,0,0]);
    // Frame 1
    drawRect(scrollPng, 4, 2, 8, 12, C_PARCHMENT);
    drawBorder(scrollPng, 4, 2, 8, 12, C_DARK_ROAST);
    drawRect(scrollPng, 6, 4, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 6, 6, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 6, 8, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 4, 5, 8, 2, C_ALERT_RED); // Ribbon
    
    // Frame 2 (Glow)
    // Glow aura
    drawRect(scrollPng, 16+3, 1, 10, 14, C_CAUTION_AMBER);
    drawRect(scrollPng, 16+2, 2, 12, 12, C_CAUTION_AMBER);
    drawRect(scrollPng, 16+4, 2, 8, 12, C_WHITE); // brighten base
    drawBorder(scrollPng, 16+4, 2, 8, 12, C_CAUTION_AMBER);
    drawRect(scrollPng, 16+6, 4, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 16+6, 6, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 16+6, 8, 4, 1, C_DARK_ROAST);
    drawRect(scrollPng, 16+4, 5, 8, 2, C_ALERT_RED); // Ribbon
    
    fs.writeFileSync(path.join(iconsDir, 'spr_frag_world_pulse.png'), PNG.sync.write(scrollPng));
    console.log('Generated spr_frag_world_pulse.png');
}

// Generate HTML preview
function generatePreview() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Dusk Village - Fragment Icons Preview</title>
    <style>
        body { background: #222; color: #fff; font-family: sans-serif; padding: 20px; }
        .gallery { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
        img { image-rendering: pixelated; width: 256px; height: 256px; background: #2a2a2a; border: 1px solid #444; }
        .scroll { width: 128px; height: 64px; }
        h1, h2 { color: #F6AD55; }
    </style>
</head>
<body>
    <h1>Dusk Village Memory Fragments</h1>
    <div class="gallery">
        <div class="card">
            <h2>The 15 MIL Puzzle Icons (64x64 Atlas)</h2>
            <img src="memory_fragments.png" alt="Memory Fragments">
        </div>
        <div class="card">
            <h2>Generic World Scroll (Animated)</h2>
            <img class="scroll" src="spr_frag_world_pulse.png" alt="World Scroll">
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(iconsDir, 'preview_fragments.html'), html);
    console.log('Generated preview_fragments.html');
}

// --- Execution ---
console.log('Starting fragment icon generation...');
drawMemoryFragments();
generatePreview();
console.log('Done.');
