const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.js')) results.push(file);
    });
    return results;
}

walk('./src/client').forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content
        .replace(/'Pixelify Sans, Silkscreen, sans-serif'/g, "'Outfit, sans-serif'")
        .replace(/'Pixelify Sans, sans-serif'/g, "'Outfit, sans-serif'")
        .replace(/'Pixelify Sans'/g, "'Outfit, sans-serif'");
    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        console.log('Updated ' + f);
    }
});
