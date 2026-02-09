import { ExecutionContext } from '../types';

export interface Sandbox {
    type: string;
    execute(options: SandboxExecutionOptions): Promise<SandboxExecutionResult>;
}

export interface SandboxExecutionOptions {
    code: string;
    language: string;
    inputs?: string[];
    environment?: any;
    [key: string]: any;
}

export interface SandboxExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTime: number;
    memoryUsed: number;
}

export interface SecurityViolation {
    safe: boolean;
    violations: string[];
}

export interface SecurityAnalysis {
    safe: boolean;
    violations: string[];
    level: number;
}
