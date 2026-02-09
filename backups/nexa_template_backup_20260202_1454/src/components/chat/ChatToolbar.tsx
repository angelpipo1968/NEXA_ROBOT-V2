'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatToolbarProps {
    // Props kept for compatibility but currently unused in new header design
    chatHistory?: any[];
    currentMessage?: string;
    onClearChat?: () => void;
}

export function ChatToolbar({ }: ChatToolbarProps) {

    return (
        <div className="header-content flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900" id="nexa-chat-header-content">
            <div className="header-left flex items-center gap-4" id="nexa-chat-header-left">
                {/* New Chat Icon */}
                <div className="new-chat cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                    <span role="img" aria-label="new-chat" className="anticon text-xl">
                        <svg width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4z" />
                        </svg>
                    </span>
                </div>

                {/* Model Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <span className="ant-dropdown-trigger cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
                            <div className="ant-flex flex items-center gap-2">
                                <div className="text-sm font-medium">Nexa-Ultra</div>
                                <span role="img" className="anticon text-xs text-gray-500">
                                    <svg width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                    </svg>
                                </span>
                            </div>
                        </span>
                    </DropdownMenuTrigger>
                    {/* Placeholder content for model selector */}
                    <DropdownMenuContent>
                        <DropdownMenuItem>Nexa-Ultra</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="header-right" id="nexa-chat-header-right">
                {/* Auth buttons removed as per user request */}
            </div>
        </div>
    );
}
