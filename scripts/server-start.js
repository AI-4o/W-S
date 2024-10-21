const { execSync } = require('child_process');
const dotenv = require('dotenv');
// Load environment variables
dotenv.config();
// Start the server
console.log(`Starting server...`);
execSync(`npx ts-node src/server.ts`, { stdio: 'inherit' });