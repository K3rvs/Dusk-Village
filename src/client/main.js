import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import LobbyScene from './scenes/LobbyScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';
import InteriorScene from './scenes/InteriorScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import UIScene from './scenes/UIScene.js';
import { CONFIG } from './utils/Constants.js';
import { SocketClient } from './network/SocketClient.js';
import { MessageHandler } from './network/MessageHandler.js';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: CONFIG.BASE_RESOLUTION.w * CONFIG.DEFAULT_RENDER_SCALE,   // 1440
    height: CONFIG.BASE_RESOLUTION.h * CONFIG.DEFAULT_RENDER_SCALE,  // 810
    pixelArt: true,                         // Crisp 2D pixel-art nearest-neighbor filtering
    roundPixels: true,                      // Integer pixel snapping (no sub-pixel blurring)
    antialias: false,                       // Disable bilinear smoothing for razor-sharp pixel graphics
    backgroundColor: '#0F172A',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%'
    },
    scene: [
        BootScene,
        MenuScene,
        LobbyScene,
        CharacterSelectScene,
        GameScene,
        InteriorScene,
        GameOverScene,
        UIScene
    ]
};

const game = new Phaser.Game(gameConfig);

// Initialize Network
const socketClient = new SocketClient();
const messageHandler = new MessageHandler(null);

window.socketClient = socketClient;
window.messageHandler = messageHandler;

window.addEventListener('resize', () => {
    game.scale.refresh();
});
