const fs = require('fs');
const content = `DATABASE_URL=postgresql://vidlecta:vidlecta_secret@localhost:5433/vidlecta\nJWT_SECRET=super-secret-key-at-least-32-characters-long\n`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env created');
