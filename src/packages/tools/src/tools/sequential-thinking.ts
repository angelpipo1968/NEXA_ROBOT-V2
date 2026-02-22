import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';

export class SequentialThinkingTool extends Tool {
    name = 'sequential_thinking';
    description = 'A detailed tool for dynamic and reflective problem-solving. Allows for steps, revisions, and branching thoughts.';
    parameters = {
        type: 'object',
        properties: {
            thought: { type: 'string', description: 'The current thinking step' },
            thoughtNumber: { type: 'number', description: 'Current thought number' },
            totalThoughts: { type: 'number', description: 'Estimated total thoughts' },
            nextThoughtNeeded: { type: 'boolean', description: 'Whether another thought step is needed' }
        },
        required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded']
    };

    async execute(params: any, context: ExecutionContext): Promise<ToolResult> {
        // This tool is primary for the AI to "broadcast" its thinking process.
        // The return value is the confirmation that the thought was recorded.
        return {
            success: true,
            data: `Thought ${params.thoughtNumber}/${params.totalThoughts} recorded.`,
            metadata: { thought: params.thought }
        };
    }
}
