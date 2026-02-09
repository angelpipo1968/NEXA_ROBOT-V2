import * as crypto from 'crypto';

export class Fingerprint {
    static async generate(text: string | string[]): Promise<string> {
        const content = Array.isArray(text) ? text.join('|||') : text;
        return crypto.createHash('md5').update(content).digest('hex');
    }
}
