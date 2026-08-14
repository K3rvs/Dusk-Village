const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, '..', 'village_layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));

const mapWidth = layout.width || 72;
const mapHeight = layout.height || 54;
const tileSize = 16;

// GIDs
const GID_GRASS = 1;
const GID_DIRT = 2;
const GID_COBBLE = 3;
const GID_STONE = 19;

function createLayer(name, data, width, height) {
    return { data, height, id: Math.floor(Math.random() * 10000), name, opacity: 1, type: "tilelayer", visible: true, width, x: 0, y: 0 };
}

function generateExteriorMap() {
    const groundData = layout.groundData && layout.groundData.length === mapWidth * mapHeight
        ? layout.groundData
        : new Array(mapWidth * mapHeight).fill(GID_GRASS);

    const wallsData = new Array(mapWidth * mapHeight).fill(0);
    const treesTrunksData = new Array(mapWidth * mapHeight).fill(0);
    const treesCanopyData = new Array(mapWidth * mapHeight).fill(0);
    const collisionObjects = [];
    const spawnObjects = [];

    let objId = 1;

    const addSpawn = (name, type, tx, ty, props = {}) => {
        spawnObjects.push({
            id: objId++, name, type, x: tx * tileSize, y: ty * tileSize, width: tileSize, height: tileSize,
            properties: Object.entries(props).map(([k, v]) => ({ name: k, type: "string", value: v }))
        });
    };

    const addCol = (tx, ty, tw, th) => {
        collisionObjects.push({
            id: objId++, name: "col", type: "collision", x: tx * tileSize, y: ty * tileSize, width: tw * tileSize, height: th * tileSize
        });
    };

    // Border collision
    for (let x = 0; x < mapWidth; x++) {
        addCol(x, 0, 1, 1);
        addCol(x, mapHeight - 1, 1, 1);
    }
    for (let y = 0; y < mapHeight; y++) {
        addCol(0, y, 1, 1);
        addCol(mapWidth - 1, y, 1, 1);
    }

    // Spawn points - Angel Statue at Tile (35, 24)
    addSpawn("village_square_center", "teleport_point", 36, 26);

    const mapJson = {
        compressionlevel: -1, height: mapHeight, infinite: false,
        layers: [
            createLayer("ground", groundData, mapWidth, mapHeight),
            createLayer("walls_lower", wallsData, mapWidth, mapHeight),
            createLayer("trees_trunks", treesTrunksData, mapWidth, mapHeight),
            createLayer("trees_canopy", treesCanopyData, mapWidth, mapHeight),
            { id: 101, name: "collision", type: "objectgroup", objects: collisionObjects },
            { id: 102, name: "spawn_points", type: "objectgroup", objects: spawnObjects }
        ],
        nextlayerid: 103, nextobjectid: objId, orientation: "orthogonal", renderorder: "right-down",
        tileheight: tileSize, tilewidth: tileSize, type: "map", width: mapWidth,
        tilesets: [
            { firstgid: 1, name: "tile_ground_grass", image: "tile_ground_grass.png", imageheight: 16, imagewidth: 16, tileheight: 16, tilewidth: 16 },
            { firstgid: 2, name: "tile_ground_dirt", image: "tile_ground_dirt.png", imageheight: 16, imagewidth: 16, tileheight: 16, tilewidth: 16 },
            { firstgid: 3, name: "tile_ground_cobble", image: "tile_ground_cobble.png", imageheight: 16, imagewidth: 256, tileheight: 16, tilewidth: 16 },
            { firstgid: 19, name: "tile_ground_stone", image: "tile_ground_stone.png", imageheight: 16, imagewidth: 16, tileheight: 16, tilewidth: 16 },
            { firstgid: 20, name: "tileset_terrain_trees", image: "tileset_terrain_trees.png", imageheight: 128, imagewidth: 256, tileheight: 16, tilewidth: 16 }
        ]
    };

    return JSON.stringify(mapJson, null, 2);
}

// Generate interior map
function generateInteriorMap(name) {
    const w = 24;
    const h = 20;
    const total = w * h;
    const groundData = new Array(total).fill(3); // wood
    const wallsData = new Array(total).fill(0);
    const spawnObjects = [];
    let objId = 1;

    for (let x = 0; x < w; x++) {
        wallsData[x] = 19;
        wallsData[(h - 1) * w + x] = 19;
    }
    for (let y = 0; y < h; y++) {
        wallsData[y * w] = 19;
        wallsData[y * w + (w - 1)] = 19;
    }

    spawnObjects.push({
        id: objId++, name: "entrance", type: "teleport_point", x: 12 * tileSize, y: 18 * tileSize, width: tileSize, height: tileSize,
        properties: [{ name: "targetScene", type: "string", value: "GameScene" }]
    });

    const mapJson = {
        compressionlevel: -1, height: h, infinite: false,
        layers: [
            createLayer("ground", groundData, w, h),
            createLayer("walls_lower", wallsData, w, h),
            { id: 101, name: "spawn_points", type: "objectgroup", objects: spawnObjects }
        ],
        nextlayerid: 102, nextobjectid: objId, orientation: "orthogonal", renderorder: "right-down",
        tileheight: tileSize, tilewidth: tileSize, type: "map", width: w,
        tilesets: [
            { firstgid: 1, name: "tile_ground_grass", image: "tile_ground_grass.png", imageheight: 16, imagewidth: 16, tileheight: 16, tilewidth: 16 },
            { firstgid: 3, name: "tile_ground_cobble", image: "tile_ground_cobble.png", imageheight: 16, imagewidth: 256, tileheight: 16, tilewidth: 16 },
            { firstgid: 19, name: "tile_ground_stone", image: "tile_ground_stone.png", imageheight: 16, imagewidth: 16, tileheight: 16, tilewidth: 16 }
        ]
    };

    return JSON.stringify(mapJson, null, 2);
}

const outDir = path.join(__dirname, '..', 'assets', 'tilemaps');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'village_exterior.json'), generateExteriorMap());
fs.writeFileSync(path.join(outDir, 'interior_villagehall.json'), generateInteriorMap('villagehall'));
fs.writeFileSync(path.join(outDir, 'interior_clinic.json'), generateInteriorMap('clinic'));
fs.writeFileSync(path.join(outDir, 'interior_library.json'), generateInteriorMap('library'));
fs.writeFileSync(path.join(outDir, 'interior_school.json'), generateInteriorMap('school'));

console.log("Successfully generated village_exterior.json from village_layout.json.");

