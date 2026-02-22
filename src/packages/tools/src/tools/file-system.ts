import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

/**
 * Tool to list files and directories
 */
export class ListDirTool extends Tool {
    name = 'list_dir';
    description = 'List the contents of a directory. Returns names, types, and sizes.';
    parameters = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'Relative path to list (e.g. "./src")' },
            recursive: { type: 'boolean', description: 'Whether to list recursively' }
        },
        required: ['path']
    };

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(process.cwd(), params.path);

            // Security: Prevent accessing outside workspace
            if (!fullPath.startsWith(process.cwd())) {
                return { success: false, error: 'Access denied: Path outside workspace', data: null };
            }

            if (!existsSync(fullPath)) {
                return { success: false, error: 'Directory not found', data: null };
            }

            const entries = await this.listRecursive(fullPath, params.recursive ? 3 : 1);
            return { success: true, data: entries };
        } catch (e: any) {
            return { success: false, error: e.message, data: null };
        }
    }

    private async listRecursive(dir: string, depth: number): Promise<any[]> {
        if (depth === 0) return [];
        const files = await fs.readdir(dir, { withFileTypes: true });
        const results: any[] = [];

        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            const relativePath = path.relative(process.cwd(), fullPath);

            const stats = await fs.stat(fullPath);

            if (file.isDirectory()) {
                const children = depth > 1 ? await this.listRecursive(fullPath, depth - 1) : [];
                results.push({
                    name: file.name,
                    path: relativePath,
                    type: 'directory',
                    children
                });
            } else {
                results.push({
                    name: file.name,
                    path: relativePath,
                    type: 'file',
                    size: stats.size
                });
            }
        }
        return results;
    }
}

/**
 * Tool to read file content
 */
export class ReadFileTool extends Tool {
    name = 'read_file';
    description = 'Read the complete contents of a file as text.';
    parameters = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'Relative path to the file' }
        },
        required: ['path']
    };

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(process.cwd(), params.path);

            if (!fullPath.startsWith(process.cwd())) {
                return { success: false, error: 'Access denied: Path outside workspace', data: null };
            }

            if (!existsSync(fullPath)) {
                return { success: false, error: 'File not found', data: null };
            }

            const content = await fs.readFile(fullPath, 'utf-8');
            return { success: true, data: content };
        } catch (e: any) {
            return { success: false, error: e.message, data: null };
        }
    }
}

/**
 * Tool to write file content
 */
export class WriteFileTool extends Tool {
    name = 'write_file';
    description = 'Create a new file or overwrite an existing one with new content.';
    parameters = {
        type: 'object',
        properties: {
            path: { type: 'string', description: 'Relative path where to write the file' },
            content: { type: 'string', description: 'The content to write' }
        },
        required: ['path', 'content']
    };

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(process.cwd(), params.path);

            if (!fullPath.startsWith(process.cwd())) {
                return { success: false, error: 'Access denied: Path outside workspace', data: null };
            }

            // Ensure directory exists
            await fs.mkdir(path.dirname(fullPath), { recursive: true });

            await fs.writeFile(fullPath, params.content, 'utf-8');
            return {
                success: true,
                data: `File updated successfully at ${params.path}`,
                metadata: { path: params.path, bytes: params.content.length }
            };
        } catch (e: any) {
            return { success: false, error: e.message, data: null };
        }
    }
}
