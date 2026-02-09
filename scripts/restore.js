const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the file argument
const args = process.argv.slice(2);
let backupFile = args.find(arg => arg.startsWith('--file=') || !arg.startsWith('-'));

if (!backupFile) {
    console.error('Please specify a backup file using --file=<path> or just the path.');
    console.error('Usage: npm run restore -- <path_to_sql_file>');
    process.exit(1);
}

if (backupFile.startsWith('--file=')) {
    backupFile = backupFile.split('=')[1];
}

// Resolve absolute path
const absPath = path.isAbsolute(backupFile) ? backupFile : path.join(process.cwd(), backupFile);

if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
}

console.log(`Restoring database from ${absPath}...`);

// For restoration on Windows/Linux cross-platform, piping the file content into docker exec is standard
// docker exec -i nexa-postgres psql -U nexa nexa < file.sql
const command = `docker exec -i nexa-postgres psql -U nexa nexa`;

const dbRestore = exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Restore failed: ${error.message}`);
        return;
    }
    console.log(`Restore completed successfully.`);
});

const fileStream = fs.createReadStream(absPath);
fileStream.pipe(dbRestore.stdin);

dbRestore.stderr.on('data', (data) => console.error(`pg_restore stderr: ${data}`));
