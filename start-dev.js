const { execSync } = require('child_process');
const path = require('path');
const next = path.join(__dirname, 'node_modules', '.bin', 'next');
execSync(`"${next}" dev`, { stdio: 'inherit', cwd: __dirname });
