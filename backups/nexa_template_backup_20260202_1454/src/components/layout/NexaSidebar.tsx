import React, { useState, useRef, useEffect } from 'react';
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


export default function NexaSidebar() {
    const { clearMessages } = useChatStore();
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Toggle states for collapsible sections
    const [isProjectsOpen, setIsProjectsOpen] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

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
            className={`fixed left-0 top-0 h-screen bg-[#0a0a0f]/95 backdrop-blur-md border-r border-white/5 flex flex-col z-50 transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'
                }`}
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
                                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Nexa+AI&background=0D8ABC&color=fff';
                                }}
                            />
                            <span className="font-bold text-xl tracking-tight text-white">NEXA AI</span>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                </div>

                <button
                    onClick={() => {
                        clearMessages();
                        navigate('/');
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white group ${isSidebarOpen ? 'w-full' : 'w-full justify-center px-0'
                        }`}
                >
                    <Plus size={20} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                    {isSidebarOpen && <span className="font-medium">Nuevo Chat</span>}
                </button>

                {isSidebarOpen && (
                    <div className="mt-4 relative animate-in fade-in duration-300">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Chats de búsqueda..."
                            className="w-full bg-transparent border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 placeholder-gray-600"
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
                    <NavItem
                        icon={Layout}
                        label="Nexa Studio"
                        active={location.pathname === '/studio'}
                        onClick={() => handleNavigation('/studio')}
                        collapsed={!isSidebarOpen}
                    />
                    <NavItem
                        icon={Bot}
                        label="Nexa Hologram"
                        active={location.pathname === '/hologram'}
                        onClick={() => handleNavigation('/hologram')}
                        collapsed={!isSidebarOpen}
                    />
                </div>

                {isSidebarOpen && (
                    <>
                        {/* Projects Section */}
                        <div className="animate-in fade-in duration-300">
                            <button
                                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors mb-2"
                            >
                                <span>Proyectos</span>
                                {isProjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isProjectsOpen && (
                                <div className="space-y-1">
                                    <NavItem icon={Box} label="Nuevo Proyecto" active={false} onClick={() => { }} collapsed={false} />
                                </div>
                            )}
                        </div>

                        {/* Recent History Section */}
                        <div className="animate-in fade-in duration-300">
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors mb-2"
                            >
                                <span>Todas las conversaciones</span>
                                {isHistoryOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isHistoryOpen && (
                                <div className="space-y-1">
                                    <HistoryItem label="NEXA OS: Programación To..." />
                                    <HistoryItem label="Aplicación Móvil para NEXA" />
                                    <HistoryItem label="SOS Sistema Corrupto PC" />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer: User Profile */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0f] absolute bottom-0 left-0 w-full" ref={userMenuRef}>

                {/* User Settings Menu Popover */}
                {showUserMenu && isSidebarOpen && (
                    <div className="absolute bottom-full left-4 mb-2 w-64 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                        <div className="p-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    AG
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white truncate">pipogon0361@gmail.com</div>
                                    <div className="text-xs text-gray-500 truncate">Free Plan</div>
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

                <div
                    onClick={() => isSidebarOpen && setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        AG
                    </div>
                    {isSidebarOpen && (
                        <>
                            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                                <div className="text-sm font-medium text-white truncate">Angel Gongora</div>
                                <div className="text-xs text-gray-500 truncate">Pro Account</div>
                            </div>
                            <Settings size={16} className="text-gray-500" />
                        </>
                    )}
                </div>
            </div>


        </aside>
    );
}

// Helper Component for Navigation Items
function NavItem({ icon: Icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
    return (
        <button
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active
                ? 'bg-purple-500/20 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                } ${collapsed ? 'w-full justify-center' : 'w-full'}`}
        >
            <Icon size={18} />
            {!collapsed && <span className="text-sm font-medium animate-in fade-in duration-200">{label}</span>}
        </button>
    );
}

// Helper Component for History Items with Context Menu
function HistoryItem({ label }: { label: string }) {
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
                className={`px-3 py-2 flex items-center justify-between text-sm rounded-lg cursor-pointer transition-colors ${showMenu ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                    className="absolute right-2 top-8 w-56 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] overflow-visible p-1 animate-in zoom-in-95 duration-100 origin-top-right transform"
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
                                <div className="absolute left-full top-0 ml-1 w-48 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1 z-[110] animate-in slide-in-from-left-2 duration-150">
                                    <button
                                        onClick={() => handleDownload('json')}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <FileJson size={14} />
                                        <span>Exportar chat (.json)</span>
                                    </button>
                                    <button
                                        onClick={() => handleDownload('txt')}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <FileText size={14} />
                                        <span>Texto plano (.txt)</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-white/5 my-1" />
                        <MenuItem icon={FolderInput} label="Mover a Proyecto" />
                        <MenuItem icon={Trash2} label="Eliminar" isDanger />
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
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-2">
                <Icon size={14} />
                <span>{label}</span>
            </div>
            {hasSubmenu && <ChevronRight size={12} className="text-gray-500" />}
        </button>
    );
}
