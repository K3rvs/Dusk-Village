/**
 * Generate placeholder audio files for development.
 * Creates minimal valid WAV files so the game loads without errors.
 */
const fs = require('fs');
const path = require('path');

// Minimal WAV header for a silent 0.1s mono 8-bit 8000Hz file
function createSilentWav(durationMs = 100) {
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 8;
    const numSamples = Math.floor(sampleRate * (durationMs / 1000));
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const fileSize = 44 + dataSize - 8;

    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);               // Sub-chunk size
    buffer.writeUInt16LE(1, 20);                 // PCM format
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // Byte rate
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // Block align
    buffer.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Silence (0x80 for unsigned 8-bit PCM)
    for (let i = 0; i < dataSize; i++) {
        buffer[44 + i] = 0x80;
    }

    return buffer;
}

const sfxDir = path.join(__dirname, '..', 'assets', 'audio', 'sfx');
const musicDir = path.join(__dirname, '..', 'assets', 'audio', 'music');

// Create directories
fs.mkdirSync(sfxDir, { recursive: true });
fs.mkdirSync(musicDir, { recursive: true });

const sfxFiles = [
    'button_click.wav',
    'panel_open.wav',
    'fragment_pickup.wav',
    'fragment_verified.wav',
    'solve_fail.wav',
    'bell_day.wav',
    'bell_night.wav',
    'ban_sever.wav'
];

const musicFiles = [
    'victory_fanfare.wav',
    'defeat_sting.wav'
];

// Generate WAV files
const shortWav = createSilentWav(100);
const longWav = createSilentWav(500);

sfxFiles.forEach(file => {
    const filePath = path.join(sfxDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, shortWav);
        console.log(`Generated: ${filePath}`);
    }
});

musicFiles.forEach(file => {
    const filePath = path.join(musicDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, longWav);
        console.log(`Generated: ${filePath}`);
    }
});

// Generate OGG placeholders (just create empty files so Phaser doesn't crash)
const oggFiles = ['ambient_day.ogg', 'ambient_judgement.ogg', 'ambient_night.ogg'];
oggFiles.forEach(file => {
    const filePath = path.join(musicDir, file);
    if (!fs.existsSync(filePath)) {
        // Write a minimal valid Ogg container (just headers, no actual audio)
        // Phaser will fail silently on empty OGGs, which is acceptable for placeholders
        fs.writeFileSync(filePath, Buffer.alloc(0));
        console.log(`Generated placeholder: ${filePath}`);
    }
});

console.log('Audio placeholder generation complete!');
