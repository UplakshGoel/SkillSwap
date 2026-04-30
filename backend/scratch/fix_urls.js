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
            if (content.includes('http://localhost:5000')) {
                console.log(`Updating ${fullPath}`);
                // Replace with a relative path or a variable
                // Since we use vercel.json rewrites, relative path /api works
                content = content.replace(/http:\/\/localhost:5000/g, '');
                fs.writeFileSync(fullPath, content);
            }
        }
    });
}

walk(directory);
console.log('Done!');
