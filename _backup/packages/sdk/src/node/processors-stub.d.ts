export declare class FileProcessor {
    private axios;
    constructor(axios: any);
    scanDirectory(path: string, options: any): Promise<string[]>;
    read(file: string): Promise<string>;
    write(file: string, content: string): Promise<void>;
}
export declare class BatchProcessor {
    private axios;
    constructor(axios: any);
    process(items: any[], handler: any, options: any): Promise<any>;
}
//# sourceMappingURL=processors-stub.d.ts.map