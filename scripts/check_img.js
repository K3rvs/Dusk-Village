const fs = require('fs');
const pngjs = require('pngjs').PNG;

const files = [
    'c:\\duskvillage\\assets\\sprites\\characters\\Chef.png',
    'c:\\duskvillage\\assets\\sprites\\terrain\\tileset_terrain_trees.png'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const data = fs.readFileSync(file);
        const png = pngjs.sync.read(data);
        console.log(`${file}: ${png.width}x${png.height}`);
    } else {
        console.log(`${file}: NOT FOUND`);
    }
});
