import React, { useState } from 'react';
import { Menu, Plus, MessageSquare, Layout, Globe } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MiniSidebar() {
    const { clearMessages } = useChatStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { id: 'chat', label: 'Nexa Chat', icon: MessageSquare, path: '/' },
        { id: 'studio', label: 'Nexa Studio', icon: Layout, path: '/studio' },
        { id: 'webdev', label: 'Web Dev', icon: Globe, path: '/webdev' },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <aside className="h-screen w-[70px] flex flex-col items-center py-6 z-50 glass-panel border-r border-white/5 fixed left-0 top-0">
            {/* Top: Menu (Hamburger) with Popover */}
            <div className="mb-8 relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 transition-colors rounded-lg ${isMenuOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white'}`}
                >
                    <Menu size={24} />
                </button>

                {/* Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-0 left-14 ml-4 w-56 glass-panel rounded-xl py-2 px-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in slide-in-from-left-4 duration-200 bg-[#0a0a0f] backdrop-blur-xl">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${location.pathname === item.path
                                    ? 'bg-purple-500/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Top-Middle: New Chat (Plus) */}
            <div className="flex-1 flex flex-col gap-6">
                <button
                    onClick={() => {
                        clearMessages();
                        navigate('/');
                    }}
                    className="mini-sidebar-plus"
                    title="Nuevo Chat"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* Bottom: User Avatar */}
            <div className="mt-auto mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1a1b26] border border-white/10 flex items-center justify-center text-white font-medium shadow-lg hover:border-white/20 transition-all cursor-pointer">
                    N
                </div>
            </div>
        </aside>
    );
}
