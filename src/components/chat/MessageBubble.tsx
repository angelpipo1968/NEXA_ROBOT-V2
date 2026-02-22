import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Trash2, Volume2, Edit2, GitFork, ThumbsUp, ThumbsDown, Share2, RotateCw, MoreHorizontal, Settings, ChevronLeft, Check } from 'lucide-react';
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
import { OptimizedImage } from '../ui/OptimizedImage';
import { useChatStore } from '../../store/useChatStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { Download, ExternalLink, Maximize2, FileText } from 'lucide-react';
import { ImageReviewCard } from './ImageReviewCard';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    id: string;
    deleteMessage: (id: string) => void;
    forkChat: (messageId: string) => void;
    regenerateResponse: () => Promise<void>;
}

export default function MessageBubble({ role, content, id, deleteMessage, forkChat, regenerateResponse }: MessageBubbleProps) {
    const isUser = role === 'user';
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const menuRef = useRef<HTMLDivElement>(null);

    const { updateMessage, generateAIResponse } = useChatStore();
    const { speak, selectedVoice, setSelectedVoice } = useVoiceStore();

    const handleSaveEdit = async () => {
        if (editContent.trim() !== content) {
            updateMessage(id, { content: editContent });

            // If editing a user message, we assume a "branch and retry" pattern
            if (isUser) {
                // 1. Fork at this point (removes future messages)
                forkChat(id);
                // 2. Trigger AI response with the new content
                await generateAIResponse(editContent);
            }
        }
        setIsEditing(false);
    };

    const handleFork = () => {
        if (window.confirm('¿Crear una nueva rama desde aquí? Los mensajes posteriores desaparecerán de la vista actual.')) {
            forkChat(id);
        }
    };

    // Load voices
    useEffect(() => {
        if (!showVoiceMenu) return;

        const loadVoices = () => {
            if (typeof window === 'undefined' || !window.speechSynthesis) return;
            const voices = window.speechSynthesis.getVoices();
            // Filter mainly for Spanish/English or show all but sorted
            // For now, let's just show all distinct ones or filter by current lang if possible
            // Let's show all, but prioritize Spanish
            const sorted = [...voices].sort((a, b) => {
                if (a.lang.startsWith('es') && !b.lang.startsWith('es')) return -1;
                if (!a.lang.startsWith('es') && b.lang.startsWith('es')) return 1;
                return a.name.localeCompare(b.name);
            });
            setAvailableVoices(sorted);
        };

        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [showVoiceMenu]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
                setShowVoiceMenu(false);
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
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group mb-4`}
        >
            <div
                className={`max-w-[85%] rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl border border-white/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${isUser
                    ? 'bg-gradient-to-br from-purple-600/90 to-indigo-600/90 text-white rounded-tr-sm'
                    : 'bg-white/5 dark:bg-black/20 text-[var(--text-primary)]'
                    }`}
            >
                {isUser ? (
                    <div className="space-y-2">
                        {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[300px]">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-black/20 text-white rounded-lg p-3 text-[15px] focus:outline-none resize-none border border-white/10"
                                    rows={Math.max(3, editContent.split('\n').length)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSaveEdit();
                                        }
                                        if (e.key === 'Escape') setIsEditing(false);
                                    }}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(content); }}
                                        className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="text-xs bg-white text-[var(--accent-primary)] px-4 py-1.5 rounded-md font-medium hover:bg-white/90 shadow-sm transition-colors"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap">{content}</div>
                        )}
                        {/* User Actions: Copy + Delete */}
                        <div className="flex items-center justify-end gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ActionButton
                                icon={<Copy size={14} className="text-white/70" />}
                                onClick={() => navigator.clipboard.writeText(content)}
                                label="Copiar"
                                isUserMessage
                            />
                            {deleteMessage && (
                                <ActionButton
                                    icon={<Trash2 size={14} className="text-white/70 hover:text-white" />}
                                    onClick={() => deleteMessage(id)}
                                    label="Eliminar"
                                    isUserMessage
                                    isDanger
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Tool Call / Agent Action Logic */}
                        {content.includes('TOOL_CALL: ') || content.includes(':::TOOL_CALL:::') ? (
                            (() => {
                                try {
                                    let jsonStr = '';
                                    let isComplete = false;

                                    if (content.includes(':::TOOL_CALL:::')) {
                                        const parts = content.split(':::TOOL_CALL:::');
                                        const lastPart = parts[parts.length - 1];
                                        if (lastPart.includes(':::END_TOOL_CALL:::')) {
                                            jsonStr = lastPart.split(':::END_TOOL_CALL:::')[0];
                                            isComplete = true;
                                        } else {
                                            // Incomplete tool call (still streaming)
                                            jsonStr = lastPart;
                                            isComplete = false;
                                        }
                                    } else if (content.includes('TOOL_CALL: ')) {
                                        // Support legacy TOOL_CALL: format
                                        const parts = content.split('TOOL_CALL: ');
                                        jsonStr = parts[parts.length - 1].split('\n')[0];
                                        isComplete = true; // Legacy format is usually single-line
                                    }

                                    if (!jsonStr.trim()) return <ThinkingCard toolName="Pensando..." toolArgs={{}} />;

                                    let cleanJson = jsonStr.trim();
                                    // Remove markdown code blocks if present
                                    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

                                    // If not complete, don't try to parse yet, just show "Thinking"
                                    if (!isComplete) {
                                        // Try a very basic extraction for name if possible to show more info
                                        const nameMatch = cleanJson.match(/"name":\s*"([^"]+)"/);
                                        const toolName = nameMatch ? nameMatch[1] : '...';
                                        return <ThinkingCard toolName={toolName} toolArgs={{}} />;
                                    }

                                    const toolData = JSON.parse(cleanJson.trim());
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
                                    console.error('Tool rendering error:', e);
                                    // If it fails to parse but we are still in a tool call zone, 
                                    // just show Thinking instead of a red error if it's likely still streaming
                                    if (!content.includes(':::END_TOOL_CALL:::')) {
                                        return <ThinkingCard toolName="..." toolArgs={{}} />;
                                    }
                                    return (
                                        <div className="text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20 text-xs">
                                            ⚠️ Error al procesar acción de la IA. Ver consola para detalles.
                                        </div>
                                    );
                                }
                            })()
                        ) : (() => {
                            // Check if content is structured search results
                            let parsedData = null;
                            try {
                                if (content.includes('json_data: ')) {
                                    const parts = content.split('json_data: ');
                                    const jsonPart = parts[parts.length - 1].trim();
                                    parsedData = JSON.parse(jsonPart);
                                } else if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
                                    parsedData = JSON.parse(content);
                                }
                            } catch (e) {
                                // Not JSON
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

                            // If we have image result, render ImageResultCard
                            if (parsedData?.type === 'image_result') {
                                return (
                                    <div className="space-y-4">
                                        <ImageResultCard
                                            url={parsedData.url}
                                            prompt={parsedData.prompt}
                                            aspectRatio={parsedData.aspect_ratio}
                                        />
                                        {parsedData.review && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                                                <ImageReviewCard data={parsedData.review} />
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Otherwise, render as markdown
                            let cleanedContent = content;
                            if (content.includes('json_data: ')) {
                                cleanedContent = content.split('json_data: ')[0].trim();
                            }

                            // Remove internal tool markers from the view
                            cleanedContent = cleanedContent
                                .replace(/IMAGEN_GENERADA: https?:\/\/\S+/g, '')
                                .replace(/TOOL_OUTPUT \([^)]+\):/g, '')
                                .replace(/:::TOOL_CALL:::[\s\S]*?:::END_TOOL_CALL:::/g, '')
                                .replace(/TOOL_CALL: .*/g, '')
                                .trim();

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
                                                if (typeof children === 'string' && children.trim() === '') return null;
                                                return <p className="text-[var(--text-primary)]">{children}</p>;
                                            },
                                            img({ src, alt }: any) {
                                                // If we have an image result type, we already rendered the card above
                                                if (parsedData?.type === 'image_result') return null;

                                                // Upgrade markdown images to premium results if they look like generated images
                                                if (src?.includes('pollinations.ai') || src?.includes('image.pollinations.ai')) {
                                                    return (
                                                        <div className="my-4">
                                                            <ImageResultCard
                                                                url={src}
                                                                prompt={alt || 'Imagen de Nexa'}
                                                                aspectRatio="1:1"
                                                                isMarkdown
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return <OptimizedImage src={src} alt={alt || 'Image'} className="my-4 shadow-2xl rounded-xl border border-white/10" />;
                                            }
                                        }}
                                    >
                                        {cleanedContent}
                                    </ReactMarkdown>
                                </div>
                            );
                        })()}

                        {/* Assistant Actions: Copy, Like, Dislike, Share, Regenerate, More */}
                        <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
                            <ActionButton
                                icon={<Copy size={16} />}
                                onClick={() => navigator.clipboard.writeText(content)}
                                label="Copiar"
                            />
                            <ActionButton
                                icon={<ThumbsUp size={16} />}
                                label="Me gusta"
                            />
                            <ActionButton
                                icon={<ThumbsDown size={16} />}
                                label="No me gusta"
                            />
                            <ActionButton
                                icon={<Share2 size={16} />}
                                label="Compartir"
                            />
                            <ActionButton
                                icon={<RotateCw size={16} />}
                                label="Regenerar"
                                onClick={() => regenerateResponse()}
                            />

                            {/* More Menu Trigger */}
                            <div className="relative" ref={menuRef}>
                                <ActionButton
                                    icon={<MoreHorizontal size={16} />}
                                    label="Más"
                                    onClick={() => {
                                        setShowMoreMenu(!showMoreMenu);
                                        setShowVoiceMenu(false); // Reset
                                    }}
                                    isActive={showMoreMenu}
                                />

                                {/* Dropdown Menu */}
                                {showMoreMenu && (
                                    <div className="absolute top-8 left-0 z-50 min-w-[14rem] max-w-[18rem] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden">
                                        {!showVoiceMenu ? (
                                            <>
                                                <div className="flex items-center w-full gap-1">
                                                    <MenuOption
                                                        icon={<Volume2 size={16} />}
                                                        label="Leer en voz alta"
                                                        onClick={() => {
                                                            setShowMoreMenu(false);
                                                            speak(content);
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowVoiceMenu(true);
                                                        }}
                                                        className="p-2 hover:bg-[var(--card-hover-bg)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                                        title="Configurar voz"
                                                    >
                                                        <Settings size={14} />
                                                    </button>
                                                </div>
                                                <MenuOption
                                                    icon={<Edit2 size={16} />}
                                                    label="Editar"
                                                    onClick={() => {
                                                        setShowMoreMenu(false);
                                                        setEditContent(content); // Reset content just in case
                                                        setIsEditing(true);
                                                    }}
                                                />
                                                <MenuOption
                                                    icon={<GitFork size={16} />}
                                                    label="Rama en nuevo chat"
                                                    onClick={() => {
                                                        setShowMoreMenu(false);
                                                        handleFork();
                                                    }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 px-2 py-1.5 border-b border-[var(--card-border)] mb-1">
                                                    <button
                                                        onClick={() => setShowVoiceMenu(false)}
                                                        className="p-1 -ml-1 hover:bg-[var(--card-hover-bg)] rounded-md text-[var(--text-secondary)]"
                                                    >
                                                        <ChevronLeft size={14} />
                                                    </button>
                                                    <span className="text-xs font-medium text-[var(--text-secondary)]">Seleccionar Voz</span>
                                                </div>
                                                <div className="max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                                    {availableVoices.length === 0 && (
                                                        <div className="px-3 py-2 text-xs text-[var(--text-tertiary)]">Cargando voces...</div>
                                                    )}
                                                    {availableVoices.map((voice) => (
                                                        <button
                                                            key={voice.voiceURI}
                                                            onClick={() => {
                                                                setSelectedVoice(voice.voiceURI);
                                                                // Don't auto-close, let user pick
                                                            }}
                                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition-colors text-left ${selectedVoice === voice.voiceURI
                                                                ? 'bg-[var(--accent-primary)] text-white'
                                                                : 'hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                                                }`}
                                                        >
                                                            <div className="flex flex-col min-w-0 pr-2">
                                                                <span className="truncate font-medium">{voice.name}</span>
                                                                <span className="text-[10px] opacity-70 truncate">{voice.lang}</span>
                                                            </div>
                                                            {selectedVoice === voice.voiceURI && <Check size={12} className="shrink-0" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function ActionButton({ icon, onClick, label, isActive, isDanger, isUserMessage }: { icon: React.ReactNode, onClick?: () => void, label: string, isActive?: boolean, isDanger?: boolean, isUserMessage?: boolean }) {
    const dangerClass = isDanger
        ? (isUserMessage ? 'hover:bg-red-500/20' : 'hover:bg-red-500/10 hover:text-red-500')
        : (isUserMessage ? 'hover:bg-white/20' : 'hover:text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)]');

    const activeClass = isActive
        ? 'bg-[var(--card-hover-bg)] text-[var(--text-primary)] shadow-sm'
        : (isUserMessage ? `text-white ${dangerClass}` : `text-[var(--text-tertiary)] ${dangerClass}`);

    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${activeClass}`}
            title={label}
        >
            {icon}
        </button>
    );
}

function MenuOption({ icon, label, onClick, className }: { icon: React.ReactNode, label: string, onClick?: () => void, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--card-hover-bg)] rounded-lg text-left transition-colors text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${className}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function ImageResultCard({ url, prompt, aspectRatio, isMarkdown }: { url: string, prompt: string, aspectRatio?: string, isMarkdown?: boolean }) {
    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `nexa-image-${Date.now()}.jpg`;
            link.click();
        } catch (e) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={`relative group/img overflow-hidden rounded-xl border border-[var(--card-border)] bg-black/20 shadow-2xl`}>
                <OptimizedImage
                    src={url}
                    alt={prompt}
                    className="w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                />

                {/* Overlay actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <small className="text-white/80 text-[11px] line-clamp-1 italic max-w-[200px]">
                            {prompt}
                        </small>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-all transform active:scale-95"
                            title="Descargar"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => window.open(url, '_blank')}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-all transform active:scale-95"
                            title="Ver original"
                        >
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--vp-accent-purple)] bg-[var(--vp-accent-purple)]/10 px-2 py-0.5 rounded">
                    Generado con Nexa Flux
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--card-border)] px-2 py-0.5 rounded lowercase">
                    {aspectRatio || '1:1'}
                </span>
            </div>
        </div>
    );
}
