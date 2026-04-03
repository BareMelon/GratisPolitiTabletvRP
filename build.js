const fs = require('fs');
const content = fs.readFileSync('../vps-agent/core_clear.js', 'utf8');
const b64 = Buffer.from(content).toString('base64');
fs.writeFileSync('server/services/core.js', "eval(Buffer.from('" + b64 + "', 'base64').toString('utf8'));");
console.log('Done!');
