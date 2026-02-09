import { Command } from 'commander';
import { NexaNode } from './index';
export declare class CLI {
    private client;
    constructor(client: NexaNode);
    initialize(program: Command): Command;
    private chatMode;
    private embedFile;
    private processDirectory;
}
//# sourceMappingURL=cli.d.ts.map