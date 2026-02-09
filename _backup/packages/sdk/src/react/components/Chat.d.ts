import React from 'react';
import { NexaConfig } from '../../core';
interface ChatProps {
    apiKey: string;
    config?: NexaConfig;
    modelId?: string;
    tools?: string[];
    showThinking?: boolean;
    className?: string;
}
export declare function Chat({ apiKey, config, modelId, tools, showThinking, className }: ChatProps): React.JSX.Element;
export {};
//# sourceMappingURL=Chat.d.ts.map