import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    MessageSquare,
    Layout,
    Bot,
    ChevronDown,
    ChevronRight,
    Clock,
    Settings,
    MoreHorizontal,
    Box,
    PanelLeftClose,
    PanelLeftOpen,
    Pin,
    PencilLine,
    Copy,
    Archive,
    Share,
    Download,
    FolderInput,
    Trash2,
    FileJson,
    FileText,
    LogOut,
    User
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useUIStore } from '@/store/useUIStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EditProjectDialog } from '@/components/chat/EditProjectDialog';


export default function NexaSidebar() {
    const { clearMessages, projects, addProject, deleteProject } = useChatStore();
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

    // Toggle states for collapsible sections
    const [isProjectsOpen, setIsProjectsOpen] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [historyItems, setHistoryItems] = useState([
        { id: '1', label: "NEXA OS: Programación To..." },
        { id: '2', label: "Aplicación Móvil para NEXA" },
        { id: '3', label: "SOS Sistema Corrupto PC" }
    ]);

    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <aside
            className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 flex flex-col border-r shadow-xl ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'
                } bg-[var(--bg-secondary)] border-[var(--border-color)]`}
        >
            {/* Header: Logo & New Chat */}
            <div className="p-4">
                <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} mb-6 px-2`}>
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3">
                            <img
                                src="/nexa-logo.jpg"
                                alt="Nexa AI"
                                className="w-8 h-8 rounded-lg object-cover"
                                onError={(e) => {
                                    // Fallback if image fails
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Nexa+AI&background=2563eb&color=fff`;
                                }}
                            />
                            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">NEXA AI</span>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                </div>

                <motion.button
                    onClick={() => {
                        clearMessages();
                        navigate('/');
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--card-hover-bg)] border border-[var(--border-color)] transition-all text-[var(--text-primary)] shadow-sm hover:shadow-md group ${isSidebarOpen ? 'w-full' : 'w-full justify-center px-0'
                        }`}
                >
                    <Plus size={20} className="text-[var(--vp-accent-purple)] group-hover:scale-110 transition-transform" />
                    {isSidebarOpen && <span className="font-medium">Nuevo Chat</span>}
                </motion.button>

                {isSidebarOpen && (
                    <div className="mt-4 relative animate-in fade-in duration-300">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Chats de búsqueda..."
                            className="w-full bg-transparent border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--vp-accent-purple)] placeholder-[var(--text-muted)]"
                        />
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 custom-scrollbar pb-20">

                {/* Navigation Links (The "Three Things") */}
                <div className="space-y-1">
                    <NavItem
                        icon={MessageSquare}
                        label="Nexa Chat"
                        active={location.pathname === '/' || location.pathname === '/home' || location.pathname === '/chat'}
                        onClick={() => handleNavigation('/')}
                        collapsed={!isSidebarOpen}
                    />
                </div>

                {isSidebarOpen && (
                    <>
                        {/* Projects Section */}
                        <div className="animate-in fade-in duration-300">
                            <button
                                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors mb-2"
                            >
                                <span>Proyectos</span>
                                {isProjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isProjectsOpen && (
                                <div className="space-y-1">
                                    <NavItem
                                        icon={Box}
                                        label="Nuevo Proyecto"
                                        active={false}
                                        onClick={() => setIsProjectDialogOpen(true)}
                                        collapsed={false}
                                    />
                                    {projects.map(project => (
                                        <HistoryItem
                                            key={project.id}
                                            label={project.name}
                                            onDelete={() => deleteProject(project.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent History Section */}
                        <div className="animate-in fade-in duration-300">
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors mb-2"
                            >
                                <span>Todas las conversaciones</span>
                                {isHistoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isHistoryOpen && (
                                <div className="space-y-1">
                                    {historyItems.map(item => (
                                        <HistoryItem
                                            key={item.id}
                                            label={item.label}
                                            onDelete={() => setHistoryItems(prev => prev.filter(i => i.id !== item.id))}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer: Theme Toggle & User Profile */}
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] absolute bottom-0 left-0 w-full" ref={userMenuRef}>

                {/* Theme Toggle - Only show when sidebar is open */}
                {isSidebarOpen && (
                    <div className="mb-3 animate-in fade-in duration-300">
                        <ThemeToggle />
                    </div>
                )}

                {/* User Settings Menu Popover */}
                {showUserMenu && isSidebarOpen && (
                    <div className="absolute bottom-full left-4 mb-2 w-64 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                        <div className="p-3 border-b border-[var(--border-color)]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--vp-accent-purple)] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                                    AG
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">pipogon0361@gmail.com</div>
                                    <div className="text-xs text-[var(--text-tertiary)] truncate">Free Plan</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-1 space-y-0.5">
                            <MenuItem
                                icon={Settings}
                                label="Settings"
                                onClick={() => {
                                    setShowUserMenu(false);
                                    useUIStore.getState().setSettingsOpen(true);
                                }}
                            />
                            <MenuItem icon={Archive} label="Archived Chats" />
                            <div className="h-px bg-white/5 my-1" />
                            <MenuItem icon={LogOut} label="Log out" />
                        </div>
                    </div>
                )}

                <motion.div
                    onClick={() => isSidebarOpen && setShowUserMenu(!showUserMenu)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--card-hover-bg)] cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-[var(--vp-accent-purple)] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                        AG
                    </div>
                    {isSidebarOpen && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-[var(--text-primary)]">Angel Gongora</p>
                                <p className="text-[10px] text-[var(--text-muted)] truncate uppercase tracking-wider font-bold">NEXA PRO</p>
                            </div>
                            <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                        </>
                    )}
                </motion.div>

                <EditProjectDialog
                    open={isProjectDialogOpen}
                    onOpenChange={setIsProjectDialogOpen}
                    onSave={(newTitle) => {
                        addProject(newTitle);
                        setIsProjectDialogOpen(false);
                    }}
                />
            </div>
        </aside >
    );
}

// Helper Component for Navigation Items
function NavItem({ icon: Icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
    return (
        <button
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active
                ? 'bg-[var(--vp-accent-purple)]/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)]'
                } ${collapsed ? 'w-full justify-center' : 'w-full'}`}
        >
            <Icon size={18} className={active ? 'text-[var(--vp-accent-purple)]' : ''} />
            {!collapsed && <span className="text-sm font-medium animate-in fade-in duration-200">{label}</span>}
        </button>
    );
}

// Helper Component for History Items with Context Menu
function HistoryItem({ label, onDelete }: { label: string, onDelete: () => void }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDownloadSubMenu, setShowDownloadSubMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
                setShowDownloadSubMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDownload = (format: 'json' | 'txt') => {
        const content = format === 'json'
            ? JSON.stringify({ chat: "Mock chat con data", messages: [] }, null, 2)
            : "Mock chat log\nUser: Hello\nAI: Hi there!";

        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexa-chat-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowMenu(false); // Close menu after action
    };

    return (
        <div className="relative group">
            <div
                className={`px-3 py-2 flex items-center justify-between text-sm rounded-lg cursor-pointer transition-colors ${showMenu ? 'bg-[var(--card-hover-bg)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
                    }`}
            >
                <div className="truncate flex-1 pr-2">{label}</div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={`p-1 rounded-md hover:bg-white/10 transition-colors ${showMenu ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-500'
                        }`}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Context Menu */}
            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute right-2 top-8 w-56 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] z-[100] overflow-visible p-1 animate-in zoom-in-95 duration-100 origin-top-right transform"
                >
                    <div className="space-y-0.5">
                        <MenuItem icon={Pin} label="Alfiler" />
                        <MenuItem icon={PencilLine} label="Renombrar" />
                        <MenuItem icon={Copy} label="Clonar" />
                        <MenuItem icon={Archive} label="Archivar" />
                        <div className="h-px bg-white/5 my-1" />
                        <MenuItem icon={Share} label="Compartir" />

                        {/* Download Item with Submenu Logic */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowDownloadSubMenu(true)}
                            onMouseLeave={() => setShowDownloadSubMenu(false)}
                        >
                            <MenuItem icon={Download} label="Descargar" hasSubmenu />

                            {/* Submenu */}
                            {showDownloadSubMenu && (
                                <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] p-1 z-[110] animate-in slide-in-from-left-2 duration-150">
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() => handleDownload('json')}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <FileJson size={14} />
                                        <span>Exportar chat (.json)</span>
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() => handleDownload('txt')}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <FileText size={14} />
                                        <span>Texto plano (.txt)</span>
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-white/5 my-1" />
                        <MenuItem icon={FolderInput} label="Mover a Proyecto" />
                        <MenuItem
                            icon={Trash2}
                            label="Eliminar"
                            isDanger
                            onClick={onDelete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuItem({ icon: Icon, label, isDanger, hasSubmenu, onClick }: { icon: any, label: string, isDanger?: boolean, hasSubmenu?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium transition-colors ${isDanger
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-[var(--text-secondary)] hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)]'
                }`}
        >
            <div className="flex items-center gap-2">
                <Icon size={14} className={!isDanger ? 'text-[var(--text-tertiary)]' : ''} />
                <span>{label}</span>
            </div>
            {hasSubmenu && <ChevronRight size={12} className="text-[var(--text-muted)]" />}
        </button>
    );
}
