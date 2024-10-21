const { execSync } = require('child_process');
const dotenv = require('dotenv');
// Carica le variabili d'ambiente
dotenv.config();

console.log(`Starting server...`);
execSync(`npx ts-node src/server.ts`, { stdio: 'inherit' });