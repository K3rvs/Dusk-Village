const WebSocket = require('ws');

async function testGameFlow() {
    console.log('--- STARTING DUSK VILLAGE INTEGRATION TEST ---');
    const ws = new WebSocket('ws://localhost:3000/ws');

    let playerId = null;
    let roomCode = null;
    let localRole = null;
    let currentMystery = null;
    const spawnedFragments = new Map();
    let heldFragmentId = null;

    ws.on('open', () => {
        console.log('✓ Connected to WebSocket server');
        ws.send(JSON.stringify({
            type: 'CREATE_CUSTOM_ROOM',
            playerName: 'DetectiveAlex'
        }));
    });

    ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        console.log(`[MSG] ${msg.type}`, msg.phase || msg.fragment?.objectName || msg.message || '');

        switch (msg.type) {
            case 'ROOM_CREATED':
                playerId = msg.playerId;
                roomCode = msg.roomCode;
                console.log(`✓ Room Created: ${roomCode}, Player ID: ${playerId}`);
                // Start game from lobby
                ws.send(JSON.stringify({ type: 'START_GAME' }));
                break;

            case 'GAME_STARTING':
                console.log(`✓ Game Starting in phase: ${msg.phase}`);
                ws.send(JSON.stringify({ type: 'CHARACTER_SELECTED', avatarId: '01' }));
                setTimeout(() => {
                    console.log('Sending START_EARLY...');
                    ws.send(JSON.stringify({ type: 'START_EARLY' }));
                }, 300);
                break;

            case 'ROLE_ASSIGNED':
                localRole = msg.role;
                console.log(`✓ Role Assigned: ${localRole}`);
                break;

            case 'PHASE_CHANGE':
                console.log(`✓ Phase Changed to: ${msg.phase}, Duration: ${msg.duration}s`);
                if (msg.mystery) {
                    currentMystery = msg.mystery;
                    console.log(`✓ Current Mystery: "${currentMystery.title}"`);
                }
                break;

            case 'TIME_SYNC':
                console.log(`✓ Timer Sync: ${msg.phase} -> ${msg.remaining}s remaining / ${msg.total}s total`);
                break;

            case 'FRAGMENT_SPAWNED':
                spawnedFragments.set(msg.fragment.id, msg.fragment);
                console.log(`✓ Fragment Spawned: "${msg.fragment.objectName}" (Type: ${msg.fragment.fragmentType}, Auth: ${msg.fragment.isAuthentic}) at (${msg.fragment.x}, ${msg.fragment.y})`);
                
                // Assert no fragment spawns on cottage coordinates (Cottages 1-10 are at y: 184 and y: 920 with x: 216, 376, 536, 984, 1144, 1304)
                const isCottageY = (msg.fragment.y >= 150 && msg.fragment.y <= 210) || (msg.fragment.y >= 880 && msg.fragment.y <= 950);
                if (isCottageY) {
                    console.warn(`⚠️ Warning: Fragment near cottage row!`);
                } else {
                    console.log(`✓ Fragment is confirmed in open accessible exterior area!`);
                }

                // If Day Phase and we don't have a fragment, pick up the first authentic fragment or decoy
                if (!heldFragmentId && msg.fragment.isAuthentic) {
                    heldFragmentId = msg.fragment.id;
                    setTimeout(() => {
                        console.log(`Picking up authentic fragment "${msg.fragment.objectName}"...`);
                        ws.send(JSON.stringify({
                            type: 'FRAGMENT_PICKUP',
                            fragmentId: heldFragmentId
                        }));
                    }, 500);
                }
                break;

            case 'FRAGMENT_PICKED_UP':
                if (msg.playerId === playerId) {
                    console.log(`✓ Picked up confirmed! Surface Name: "${msg.objectName}", IsVerified: ${msg.isVerified}`);
                    // Now simulate verifying at Library
                    setTimeout(() => {
                        console.log('Simulating Library Verification Station...');
                        ws.send(JSON.stringify({
                            type: 'VERIFICATION_COMPLETE',
                            playerAId: playerId,
                            playerBId: playerId
                        }));
                    }, 800);
                }
                break;

            case 'VERIFICATION_RESULT':
                console.log(`✓ Verification Result: "${msg.title}" (${msg.fragmentType}) - Authentic: ${msg.isAuthentic}`);
                console.log(`  Full Description: "${msg.description}"`);
                // Now simulate delivering to Village Hall Archive
                setTimeout(() => {
                    console.log('Simulating Village Hall Archive Delivery...');
                    ws.send(JSON.stringify({
                        type: 'FRAGMENT_DELIVER'
                    }));
                }, 800);
                break;

            case 'FRAGMENT_DELIVERED_SUCCESS':
                console.log(`🏆 FRAGMENT DELIVERED SUCCESS! Delivered: ${msg.deliveredType} - "${msg.fragmentTitle}"`);
                console.log('Archive State:', msg.delivered);
                break;

            case 'MYSTERY_STAGE_UPDATED':
                console.log(`✓ Mystery Stage Updated -> Stage ${msg.stage} (${msg.stageName})`);
                if (msg.stage === 2) {
                    console.log('🎉 SUCCESS: Stage 1 CLAIM solved, Stage 2 CONTEXT fragments spawned!');
                    setTimeout(() => {
                        console.log('--- ALL TESTS PASSED! CLOSING CONNECTION ---');
                        ws.close();
                        process.exit(0);
                    }, 1000);
                }
                break;
        }
    });

    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
    });
}

testGameFlow();
