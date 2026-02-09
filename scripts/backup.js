const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `backup-${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

console.log(`Creating backup at ${filepath}...`);

// Use docker exec to run pg_dump inside the container
// We stream stdout to the file
const command = `docker exec nexa-postgres pg_dump -U nexa nexa > "${filepath}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Backup stderr: ${stderr}`);
    }
    console.log(`Backup completed successfully: ${filename}`);
});
