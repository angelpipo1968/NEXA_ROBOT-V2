import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import winston from 'winston';

const VAULT_PATH = path.join(os.homedir(), 'NEXA_ECHO_VAULT');
const SYSTEM_FILES = [
    'package.json',
    'nexa_os_ultimate_protocol.md'
]; // Adapted for Node.js context

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [NEXA-PROTECT] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(VAULT_PATH, 'protection.log') })
    ]
});

export class ProtectionCore {
    constructor() {
        fs.ensureDirSync(VAULT_PATH);
    }

    private calculateChecksum(filepath: string): string {
        if (!fs.existsSync(filepath)) return '';
        const fileBuffer = fs.readFileSync(filepath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }

    private getStoredHash(filename: string): string {
        const hashFile = path.join(VAULT_PATH, `${filename}.sha256`);
        return fs.existsSync(hashFile) ? fs.readFileSync(hashFile, 'utf-8').trim() : '';
    }

    public scanIntegrity(): Record<string, boolean> {
        const results: Record<string, boolean> = {};
        const cwd = process.cwd();

        for (const filename of SYSTEM_FILES) {
            const fullPath = path.join(cwd, filename);
            if (fs.existsSync(fullPath)) {
                const storedHash = this.getStoredHash(filename);
                const currentHash = this.calculateChecksum(fullPath);
                const isSecure = storedHash === currentHash;
                results[filename] = isSecure;

                if (!isSecure) {
                    logger.warn(`⚠️ Integrity breach detected: ${filename}`);
                }
            }
        }
        return results;
    }

    public async createEchoVault(): Promise<boolean> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const vaultSnapshot = path.join(VAULT_PATH, `snapshot_${timestamp}`);
            await fs.ensureDir(vaultSnapshot);

            const cwd = process.cwd();
            for (const filename of SYSTEM_FILES) {
                const src = path.join(cwd, filename);
                if (fs.existsSync(src)) {
                    const dst = path.join(vaultSnapshot, filename);
                    await fs.copy(src, dst);

                    const checksum = this.calculateChecksum(src);
                    await fs.outputFile(path.join(vaultSnapshot, `${filename}.sha256`), checksum);
                    // Also update the main vault hash for immediate comparison
                    await fs.outputFile(path.join(VAULT_PATH, `${filename}.sha256`), checksum);
                }
            }

            const manifest = {
                timestamp: new Date().toISOString(),
                system: os.platform(),
                node_version: process.version,
                files: SYSTEM_FILES
            };
            await fs.outputJson(path.join(vaultSnapshot, 'MANIFEST.json'), manifest, { spaces: 2 });

            logger.info(`✅ Protocolo Fénix activated: Vault created at ${vaultSnapshot}`);
            return true;
        } catch (error: any) {
            logger.error(`❌ Vault creation failed: ${error.message}`);
            return false;
        }
    }

    public async emergencyRestore(): Promise<boolean> {
        try {
            const snapshots = (await fs.readdir(VAULT_PATH))
                .filter(f => f.startsWith('snapshot_'))
                .sort()
                .reverse();

            if (snapshots.length === 0) {
                logger.error("No recovery snapshots available");
                return false;
            }

            const latest = path.join(VAULT_PATH, snapshots[0]);
            logger.info(`🔄 Initiating emergency restore from ${path.basename(latest)}`);

            const cwd = process.cwd();
            for (const filename of SYSTEM_FILES) {
                const vaultFile = path.join(latest, filename);
                if (fs.existsSync(vaultFile)) {
                    await fs.copy(vaultFile, path.join(cwd, filename));
                }
            }
            logger.info("✅ System restored successfully");
            return true;
        } catch (error: any) {
            logger.error(`❌ Restore failed: ${error.message}`);
            return false;
        }
    }
}
