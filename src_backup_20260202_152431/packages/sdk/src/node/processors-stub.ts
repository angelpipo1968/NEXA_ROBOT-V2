export class FileProcessor {
    constructor(private axios: any) { }
    async scanDirectory(path: string, options: any): Promise<string[]> { return []; }
    async read(file: string): Promise<string> { return ""; }
    async write(file: string, content: string): Promise<void> { }
}

export class BatchProcessor {
    constructor(private axios: any) { }
    async process(items: any[], handler: any, options: any): Promise<any> { return { successful: [], failed: [] }; }
}
