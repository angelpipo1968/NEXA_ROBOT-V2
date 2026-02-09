"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = void 0;
class CLI {
    constructor(client) {
        this.client = client;
    }
    initialize(program) {
        program
            .name('nexa')
            .description('Nexa AI Command Line Interface')
            .version('1.0.0');
        // Chat command
        program
            .command('chat')
            .description('Interactive chat with Nexa AI')
            .option('-m, --model <model>', 'Model to use', 'llama3')
            .action(async (options) => {
            await this.chatMode(options.model);
        });
        // Embed command
        program
            .command('embed <file>')
            .description('Generate embeddings for a file')
            .option('-o, --output <file>', 'Output file')
            .action(async (file, options) => {
            await this.embedFile(file, options.output);
        });
        // Process directory
        program
            .command('process <directory>')
            .description('Process directory for RAG indexing')
            .option('-c, --collection <name>', 'Collection name')
            .action(async (directory, options) => {
            await this.processDirectory(directory, options.collection);
        });
        return program;
    }
    async chatMode(model) {
        console.log('🚀 Nexa AI Interactive Chat');
        console.log(`Model: ${model}`);
        console.log('Type "quit" to exit\n');
        // Simple readline
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (prompt) => new Promise(resolve => readline.question(prompt, resolve));
        try {
            while (true) {
                const input = await question('You: ');
                if (input.toLowerCase() === 'quit') {
                    break;
                }
                console.log('Thinking...');
                try {
                    const response = await this.client.chat.send({
                        messages: [{ role: 'user', content: input }],
                        modelId: model
                    });
                    console.log('Nexa:', response.message.content);
                    console.log();
                }
                catch (error) {
                    console.error('Error', error.message);
                }
            }
        }
        finally {
            readline.close();
        }
    }
    async embedFile(inputFile, outputFile) {
        console.log(`Processing ${inputFile}...`);
        try {
            const content = await this.client.files.read(inputFile);
            const embeddings = await this.client.embeddings.create(content);
            if (outputFile) {
                await this.client.files.write(outputFile, JSON.stringify(embeddings, null, 2));
                console.log(`Embeddings saved to ${outputFile}`);
            }
            else {
                console.log('Embeddings generated');
                console.log(JSON.stringify(embeddings, null, 2));
            }
        }
        catch (error) {
            console.error('Error', error.message);
        }
    }
    async processDirectory(directory, collectionName) {
        console.log(`Processing directory ${directory}...`);
        try {
            const result = await this.client.processDirectory(directory);
            console.log(`Processed ${result.processed} files`);
            if (collectionName) {
                console.log('Creating RAG index...');
                const index = await this.client.createRAGIndex(result.results.map((r) => ({
                    content: r.embeddings.text, // Simplified
                    metadata: r.metadata
                })), { collectionName });
                console.log(`Index created: ${index.collectionId}`);
            }
        }
        catch (error) {
            console.error('Error', error.message);
        }
    }
}
exports.CLI = CLI;
//# sourceMappingURL=cli.js.map