const { execSync } = require('child_process');
const dotenv = require('dotenv');
// Carica le variabili d'ambiente
dotenv.config();
// Prendi il nome del file da eseguire dagli argomenti della riga di comando
const fileToRun = process.argv[2];

if (!fileToRun) {
    console.error('Please specify the name of the file in src/tutorials/ to run after index.ts');
    process.exit(1);
}

console.log('Running index.ts...');
execSync('npx ts-node src/index.ts', { stdio: 'inherit' });

console.log(`Running ${fileToRun}...`);
execSync(`npx ts-node src/tutorials/${fileToRun}`, { stdio: 'inherit' });