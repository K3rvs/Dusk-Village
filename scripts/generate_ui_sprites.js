const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const uiDir = path.join(__dirname, '..', 'assets', 'sprites', 'ui');
fs.mkdirSync(uiDir, { recursive: true });

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

// UI Colors
const C_MIDNIGHT = parseHex('#1A1A2E');
const C_INDIGO = parseHex('#16213E');
const C_DUSK_BLUE = parseHex('#0F3460');
const C_DUSK_BLUE_LIGHT = parseHex('#1A5276');
const C_PARCHMENT = parseHex('#E8D5A3');
const C_WHITE = parseHex('#F5F0E1');
const C_ALERT_RED = parseHex('#C0392B');
const C_ALERT_RED_DARK = parseHex('#922B21');
const C_VERIFIED_GREEN = parseHex('#27AE60');
const C_CAUTION_AMBER = parseHex('#F39C12');
const C_INTRIGUE_VIOLET = parseHex('#8E44AD');
const C_TRANSPARENT = [0,0,0,0];

function generatePanels() {
    // 9-slice panels (16x16)
    const variants = [
        { name: 'default', border: C_DUSK_BLUE, header: C_INDIGO },
        { name: 'alert', border: C_ALERT_RED, header: [192, 57, 43, 80] }, // Alert Red at ~30%
        { name: 'success', border: C_VERIFIED_GREEN, header: [39, 174, 96, 80] }, // Green at ~30%
        { name: 'secure', border: C_INTRIGUE_VIOLET, header: [142, 68, 173, 80] }
    ];

    variants.forEach(v => {
        let png = new PNG({ width: 16, height: 16 });
        // Background
        drawRect(png, 2, 2, 12, 12, C_MIDNIGHT);
        // Header
        drawRect(png, 2, 2, 12, 4, v.header);
        // Border
        drawRect(png, 0, 0, 16, 2, v.border); // top
        drawRect(png, 0, 14, 16, 2, v.border); // bot
        drawRect(png, 0, 2, 2, 12, v.border); // left
        drawRect(png, 14, 2, 2, 12, v.border); // right
        fs.writeFileSync(path.join(uiDir, `ui_panel_9slice_${v.name}.png`), PNG.sync.write(png));
    });
    console.log('Generated Panels');
}

function generateButtons() {
    // ui_btn_primary (120x32), ui_btn_danger_ban (80x24), ui_btn_ghost_forgive (80x24)
    // We'll just generate the default state to keep it simple, but we can do a sprite sheet if needed.
    const btns = [
        { name: 'primary', w: 120, h: 32, bg: C_DUSK_BLUE, border: C_DUSK_BLUE_LIGHT, text: C_WHITE },
        { name: 'danger_ban', w: 80, h: 24, bg: C_ALERT_RED, border: C_ALERT_RED_DARK, text: C_WHITE },
        { name: 'ghost_forgive', w: 80, h: 24, bg: C_TRANSPARENT, border: C_DUSK_BLUE, text: C_PARCHMENT }
    ];

    btns.forEach(btn => {
        let png = new PNG({ width: btn.w, height: btn.h });
        drawRect(png, 0, 0, btn.w, btn.h, C_TRANSPARENT);
        drawRect(png, 2, 2, btn.w-4, btn.h-4, btn.bg);
        // Border (2px)
        drawRect(png, 0, 0, btn.w, 2, btn.border);
        drawRect(png, 0, btn.h-2, btn.w, 2, btn.border);
        drawRect(png, 0, 2, 2, btn.h-4, btn.border);
        drawRect(png, btn.w-2, 2, 2, btn.h-4, btn.border);
        fs.writeFileSync(path.join(uiDir, `ui_btn_${btn.name}.png`), PNG.sync.write(png));
    });
    console.log('Generated Buttons');
}

function generateIcons() {
    const png = new PNG({ width: 128, height: 64 });
    drawRect(png, 0, 0, 128, 64, C_TRANSPARENT);

    // 16x16 Icons at (0,0) and so on
    // Magnifier (0,0)
    drawRect(png, 4, 4, 6, 6, C_PARCHMENT);
    drawRect(png, 5, 5, 4, 4, C_MIDNIGHT); // hole
    drawRect(png, 9, 9, 4, 4, C_PARCHMENT); // handle

    // Library Badge (Book) (16,0)
    drawRect(png, 16+3, 4, 10, 8, C_VERIFIED_GREEN);
    drawRect(png, 16+7, 4, 2, 8, C_WHITE); // pages

    // Clinic Badge (Red Cross) (32,0)
    drawRect(png, 32+6, 2, 4, 12, C_ALERT_RED);
    drawRect(png, 32+2, 6, 12, 4, C_ALERT_RED);

    // School Badge (Chalkboard) (48,0)
    drawRect(png, 48+2, 4, 12, 8, C_DUSK_BLUE);
    drawRect(png, 48+4, 6, 8, 4, [30,60,40,255]); // green board

    // Status Icons (8x8) -> We'll put them in row 1 (0, 16)
    // Check ✓ (0,16)
    drawRect(png, 1, 16+4, 2, 2, C_VERIFIED_GREEN);
    drawRect(png, 3, 16+6, 2, 2, C_VERIFIED_GREEN);
    drawRect(png, 5, 16+2, 2, 4, C_VERIFIED_GREEN);

    // Cross ✗ (8,16)
    drawRect(png, 8+1, 16+1, 2, 2, C_ALERT_RED);
    drawRect(png, 8+5, 16+1, 2, 2, C_ALERT_RED);
    drawRect(png, 8+3, 16+3, 2, 2, C_ALERT_RED);
    drawRect(png, 8+1, 16+5, 2, 2, C_ALERT_RED);
    drawRect(png, 8+5, 16+5, 2, 2, C_ALERT_RED);

    // Lock 🔒 (16,16)
    drawRect(png, 16+2, 16+4, 4, 4, C_DUSK_BLUE);
    drawRect(png, 16+3, 16+1, 2, 4, C_DUSK_BLUE);
    drawRect(png, 16+3, 16+2, 2, 2, C_TRANSPARENT);

    // Dash — (24,16)
    drawRect(png, 24+2, 16+3, 4, 2, C_PARCHMENT);

    // Phase Icons (16x16) -> Row 2 (0, 32)
    // Sun (0, 32)
    drawRect(png, 4, 32+4, 8, 8, C_CAUTION_AMBER);
    drawRect(png, 7, 32+1, 2, 14, C_CAUTION_AMBER);
    drawRect(png, 1, 32+7, 14, 2, C_CAUTION_AMBER);

    // Moon (16, 32)
    drawRect(png, 16+4, 32+4, 8, 8, C_WHITE);
    drawRect(png, 16+6, 32+4, 6, 8, C_TRANSPARENT); // cut out

    // Gavel (32, 32)
    drawRect(png, 32+4, 32+4, 8, 4, C_INTRIGUE_VIOLET);
    drawRect(png, 32+7, 32+8, 2, 6, C_PARCHMENT);

    fs.writeFileSync(path.join(uiDir, `ui_atlas.png`), PNG.sync.write(png));
    console.log('Generated UI Atlas');

    // Voting Progress Bar (120x8)
    const prog = new PNG({ width: 120, height: 8 });
    drawRect(prog, 0, 0, 120, 8, C_MIDNIGHT);
    drawRect(prog, 1, 1, 60, 6, C_VERIFIED_GREEN); // Left half green
    drawRect(prog, 61, 1, 58, 6, C_DUSK_BLUE); // Right half blue
    fs.writeFileSync(path.join(uiDir, `ui_progress_vote.png`), PNG.sync.write(prog));
}

// Generate HTML preview
function generatePreview() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Dusk Village - UI Preview</title>
    <style>
        body { background: #222; color: #fff; font-family: sans-serif; padding: 20px; }
        .gallery { display: flex; flex-wrap: wrap; gap: 20px; }
        .card { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
        img { image-rendering: pixelated; }
        .scale2 { transform: scale(2); transform-origin: top left; margin-bottom: 20px; }
        .scale4 { transform: scale(4); transform-origin: top left; margin-bottom: 40px; }
        h1, h2 { color: #F6AD55; }
    </style>
</head>
<body>
    <h1>Dusk Village UI Components</h1>
    <div class="gallery">
        <div class="card">
            <h2>9-Slice Panels</h2>
            <img class="scale4" src="ui_panel_9slice_default.png">
            <img class="scale4" src="ui_panel_9slice_alert.png">
            <img class="scale4" src="ui_panel_9slice_success.png">
            <img class="scale4" src="ui_panel_9slice_secure.png">
        </div>
        <div class="card">
            <h2>Buttons</h2>
            <img class="scale2" src="ui_btn_primary.png"><br><br>
            <img class="scale2" src="ui_btn_danger_ban.png"><br><br>
            <img class="scale2" src="ui_btn_ghost_forgive.png"><br><br>
        </div>
        <div class="card">
            <h2>Voting Bar</h2>
            <img class="scale2" src="ui_progress_vote.png">
        </div>
        <div class="card">
            <h2>UI Atlas (Icons & Badges)</h2>
            <img class="scale4" src="ui_atlas.png">
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(path.join(uiDir, 'preview_ui.html'), html);
    console.log('Generated preview_ui.html');
}

// --- Execution ---
console.log('Starting UI generation...');
generatePanels();
generateButtons();
generateIcons();
generatePreview();
console.log('Done.');
