const fs = require('fs');
const path = require('path');

const directory = 'd:/SkillSwap/frontend/src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if (content.includes('http://localhost:5173')) {
                console.log(`Updating redirect URIs in ${fullPath}`);
                content = content.replace(/http:\/\/localhost:5173/g, '${window.location.origin}');
                // Note: since these are usually in backticks or template strings, we need to be careful.
                // But in Login.jsx they are in template strings: `...redirect_uri=http://localhost:5173/auth/callback...`
                changed = true;
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    });
}

walk(directory);
console.log('Done!');
