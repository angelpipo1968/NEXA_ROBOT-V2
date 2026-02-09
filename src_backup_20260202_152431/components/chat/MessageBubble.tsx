import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCw, MoreHorizontal, Volume2, Edit2, GitFork } from 'lucide-react';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
    const isUser = role === 'user';
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        };

        if (showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMoreMenu]);

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group mb-2`}>
            <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed ${isUser
                    ? 'bg-[#2a2a35] text-white shadow-sm rounded-tr-sm'
                    : 'text-gray-100'
                    }`}
            >
                {isUser ? (
                    <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                    <div className="space-y-3">
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-white/10">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>

                        {/* AI Action Toolbar */}
                        <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
                            <ActionButton icon={<Copy size={16} />} onClick={() => navigator.clipboard.writeText(content)} label="Copy" />
                            <ActionButton icon={<ThumbsUp size={16} />} label="Good response" />
                            <ActionButton icon={<ThumbsDown size={16} />} label="Bad response" />
                            <ActionButton icon={<Share2 size={16} />} label="Share" />
                            <ActionButton icon={<RotateCw size={16} />} label="Regenerate" />

                            <div className="relative" ref={menuRef}>
                                <ActionButton
                                    icon={<MoreHorizontal size={16} />}
                                    label="More"
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    isActive={showMoreMenu}
                                />
                                {showMoreMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-48 p-1 rounded-xl bg-[#1e1e2e] border border-white/10 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <MenuOption icon={<Volume2 size={16} />} label="Read aloud" />
                                        <MenuOption icon={<Edit2 size={16} />} label="Edit" />
                                        <MenuOption icon={<GitFork size={16} />} label="Branch in new chat" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionButton({ icon, onClick, label, isActive }: { icon: React.ReactNode, onClick?: () => void, label: string, isActive?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title={label}
        >
            {icon}
        </button>
    );
}

function MenuOption({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-left transition-colors text-sm text-gray-300 hover:text-white">
            {icon}
            <span>{label}</span>
        </button>
    );
}
