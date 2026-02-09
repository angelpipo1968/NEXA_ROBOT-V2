import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

export class GPGSigner {
    private gpgBin: string;
    private keyId: string | undefined;

    constructor(keyId?: string) {
        this.keyId = keyId || process.env.GPG_KEY_ID;
        this.gpgBin = this.detectGpg();
    }

    private detectGpg(): string {
        const candidates = ['gpg', 'gpg2', 'C:/Program Files (x86)/GnuPG/bin/gpg.exe', 'C:/Program Files/GnuPG/bin/gpg.exe'];

        for (const candidate of candidates) {
            try {
                const result = spawnSync(candidate, ['--version']);
                if (result.status === 0) {
                    return candidate;
                }
            } catch (e) {
                continue;
            }
        }
        // Instead of throwing, we warn and disable if strictly needed, but for now we follow the python script behavior
        logger.warn("GPG not found. Install GnuPG: https://www.gnupg.org/download/");
        throw new Error("GPG not found");
    }

    public signFile(filepath: string): string {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File not found: ${filepath}`);
        }

        const args = ['--detach-sign', '--armor', '--yes'];
        if (this.keyId) {
            args.push('--local-user', this.keyId);
        }
        args.push(filepath);

        const result = spawnSync(this.gpgBin, args, { encoding: 'utf-8' });

        if (result.status !== 0) {
            throw new Error(`GPG signing failed: ${result.stderr}`);
        }

        const sigPath = `${filepath}.asc`;
        if (!fs.existsSync(sigPath)) {
            throw new Error("Signature file not created");
        }

        logger.info(`✅ Signed: ${path.basename(filepath)} → ${path.basename(sigPath)}`);
        return sigPath;
    }

    public verifySignature(filepath: string): boolean {
        const sigFile = `${filepath}.asc`;
        if (!fs.existsSync(sigFile)) {
            return false;
        }

        const result = spawnSync(this.gpgBin, ['--verify', sigFile, filepath], { encoding: 'utf-8' });
        return result.status === 0;
    }
}
