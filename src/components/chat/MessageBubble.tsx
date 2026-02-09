import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCw, MoreHorizontal, Volume2, Edit2, GitFork } from 'lucide-react';
import ThinkingCard from './ThinkingCard';
import ArtifactCard from './ArtifactCard';
import CodePreview from './CodePreview';
import { SearchResultCard } from './SearchResultCard';
import { SearchStatusBadge } from './SearchStatusBadge';
import { WeatherCard } from './WeatherCard';
import './WeatherCard.css';
import { CurrencyCard } from './CurrencyCard';
import './CurrencyCard.css';
import { NewsCard } from './NewsCard';
import './NewsCard.css';
import { StockCard } from './StockCard';
import './StockCard.css';
import './SearchComponents.css';

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
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-[var(--shadow-lg)] ${isUser
                    ? 'bg-[var(--vp-accent-purple)] text-white rounded-tr-sm'
                    : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)]'
                    }`}
            >


                {isUser ? (
                    <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                    <div className="space-y-3">
                        {/* Tool Call / Agent Action Logic */}
                        {content.startsWith('TOOL_CALL: ') ? (
                            (() => {
                                try {
                                    const jsonStr = content.replace('TOOL_CALL: ', '');
                                    const toolData = JSON.parse(jsonStr);
                                    return (
                                        <>
                                            <ThinkingCard toolName={toolData.name} toolArgs={toolData.args} />
                                            {toolData.name === 'create_artifact' && (
                                                <ArtifactCard
                                                    filename={toolData.args.filename}
                                                    content={toolData.args.content}
                                                    language={toolData.args.language}
                                                />
                                            )}
                                        </>
                                    );
                                } catch (e) {
                                    return <div className="text-red-400">Error rendering tool execution</div>;
                                }
                            })()
                        ) : (() => {
                            // Check if content is structured search results
                            let parsedData = null;
                            try {
                                parsedData = JSON.parse(content);
                            } catch (e) {
                                // Not JSON, will render as markdown
                            }

                            // If we have search results, render SearchResultCard
                            if (parsedData?.type === 'search_results') {
                                return (
                                    <>
                                        <SearchStatusBadge status={parsedData.isCached ? "cached" : "searching"} />
                                        <SearchResultCard
                                            results={parsedData.results}
                                            query={parsedData.query}
                                        />
                                    </>
                                );
                            }

                            // If we have weather result, render WeatherCard
                            if (parsedData?.type === 'weather_result') {
                                return <WeatherCard weather={parsedData.data} />;
                            }

                            // If we have currency result, render CurrencyCard
                            if (parsedData?.type === 'currency_result') {
                                return <CurrencyCard conversion={parsedData.conversion} />;
                            }

                            // If we have news results, render NewsCard
                            if (parsedData?.type === 'news_results') {
                                return <NewsCard articles={parsedData.articles} query={parsedData.query} />;
                            }

                            // If we have stock result, render StockCard
                            if (parsedData?.type === 'stock_result') {
                                return <StockCard stock={parsedData.stock} />;
                            }

                            // Otherwise, render as markdown
                            return (
                                <div className="prose prose-invert dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--bg-tertiary)] prose-pre:border prose-pre:border-[var(--border-color)] prose-pre:p-0 text-[var(--text-primary)]">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const code = String(children).replace(/\n$/, '');
                                                if (!inline && match) {
                                                    return <CodePreview language={match[1]} code={code} />;
                                                }
                                                return <code className={className} {...props}>{children}</code>;
                                            },
                                            pre({ children }) {
                                                return <div className="not-prose">{children}</div>;
                                            },
                                            p({ children }) {
                                                return <p className="text-[var(--text-primary)]">{children}</p>;
                                            }
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            );
                        })()}

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
            className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[var(--card-hover-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)]'}`}
            title={label}
        >
            {icon}
        </button>
    );
}

function MenuOption({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--card-hover-bg)] rounded-lg text-left transition-colors text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            {icon}
            <span>{label}</span>
        </button>
    );
}
