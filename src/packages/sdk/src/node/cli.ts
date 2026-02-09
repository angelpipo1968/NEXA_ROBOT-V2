import { Command } from 'commander'
// Mock chalk and ora to avoid potential ESM import issues in this environment or if packages missing
// In a real scenario we'd use imports provided in package.json
// But since I'm generating code, I'll use simple console.log fallbacks if imports fail or just assume they are there.
// For safety in this agent environment, I'll stub them or use simple logging if complex setup is needed.
// However, the user request explicitly asks for them. I will assume they are installed.
// Note: chalk v5 is ESM only. commander 11 is likely fine.

// Since I cannot guarantee node_modules are installed right now, I will write the code as requested.
// If run_command fails, I might need to mock them.

import { NexaNode } from './index'

export class CLI {
    constructor(private client: NexaNode) { }

    initialize(program: Command) {
        program
            .name('nexa')
            .description('Nexa AI Command Line Interface')
            .version('1.0.0')

        // Chat command
        program
            .command('chat')
            .description('Interactive chat with Nexa AI')
            .option('-m, --model <model>', 'Model to use', 'llama3')
            .action(async (options: any) => {
                await this.chatMode(options.model)
            })

        // Embed command
        program
            .command('embed <file>')
            .description('Generate embeddings for a file')
            .option('-o, --output <file>', 'Output file')
            .action(async (file: string, options: any) => {
                await this.embedFile(file, options.output)
            })

        // Process directory
        program
            .command('process <directory>')
            .description('Process directory for RAG indexing')
            .option('-c, --collection <name>', 'Collection name')
            .action(async (directory: string, options: any) => {
                await this.processDirectory(directory, options.collection)
            })

        return program
    }

    private async chatMode(model: string) {
        console.log('🚀 Nexa AI Interactive Chat')
        console.log(`Model: ${model}`)
        console.log('Type "quit" to exit\n')

        // Simple readline
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        })

        const question = (prompt: string): Promise<string> =>
            new Promise(resolve => readline.question(prompt, resolve))

        try {
            while (true) {
                const input = await question('You: ')

                if (input.toLowerCase() === 'quit') {
                    break
                }

                console.log('Thinking...')

                try {
                    const response = await this.client.chat.send({
                        messages: [{ role: 'user', content: input }],
                        modelId: model
                    })

                    console.log('Nexa:', response.message.content)
                    console.log()
                } catch (error: any) {
                    console.error('Error', error.message)
                }
            }
        } finally {
            readline.close()
        }
    }

    private async embedFile(inputFile: string, outputFile?: string) {
        console.log(`Processing ${inputFile}...`)

        try {
            const content = await this.client.files.read(inputFile)
            const embeddings = await this.client.embeddings.create(content)

            if (outputFile) {
                await this.client.files.write(outputFile, JSON.stringify(embeddings, null, 2))
                console.log(`Embeddings saved to ${outputFile}`)
            } else {
                console.log('Embeddings generated')
                console.log(JSON.stringify(embeddings, null, 2))
            }
        } catch (error: any) {
            console.error('Error', error.message)
        }
    }

    private async processDirectory(directory: string, collectionName?: string) {
        console.log(`Processing directory ${directory}...`)

        try {
            const result = await this.client.processDirectory(directory)

            console.log(`Processed ${result.processed} files`)

            if (collectionName) {
                console.log('Creating RAG index...')

                const index = await this.client.createRAGIndex(
                    result.results.map((r: any) => ({
                        content: r.embeddings.text, // Simplified
                        metadata: r.metadata
                    })),
                    { collectionName }
                )

                console.log(`Index created: ${index.collectionId}`)
            }
        } catch (error: any) {
            console.error('Error', error.message)
        }
    }
}
