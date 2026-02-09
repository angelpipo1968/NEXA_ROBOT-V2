'use client';

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Home,
    MessageSquare,
    Folder,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: MessageSquare, label: 'Nuevo chat', href: '/chat' },
        { icon: Folder, label: 'Proyectos', href: '/projects' },
    ];

    return (
        <aside
            className={cn(
                "vp-sidebar",
                isCollapsed && "collapsed"
            )}
        >
            {/* Logo Section */}
            <div className="vp-logo">
                <div className="vp-logo-orb" />
                <div className={cn("vp-logo-text", isCollapsed && "hidden")}>
                    <span className="vp-logo-title">NEXA OS</span>
                    <span className="vp-logo-sub">Intelligent Creation System</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="vp-nav">
                <p className={cn("vp-nav-label", isCollapsed && "hidden")}>Navegación</p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "vp-nav-item group",
                                isActive && "vp-nav-item--active"
                            )}
                        >
                            <item.icon size={18} className={cn("shrink-0", isActive ? "text-cyan-400" : "text-gray-400 group-hover:text-white")} />
                            <span className={cn(
                                "ml-3 transition-opacity duration-300",
                                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions / Plan */}
            <div className="mt-auto flex flex-col gap-2 p-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex justify-center p-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors self-end"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className={cn("vp-plan", isCollapsed && "justify-center p-2 mx-2")}>
                    <div className={cn("flex flex-col", isCollapsed && "hidden")}>
                        <p className="vp-plan-user">Ángel</p>
                        <p className="vp-plan-tier">Plan Free · Nexa-Ultra</p>
                    </div>
                    {isCollapsed ? (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    ) : (
                        <div className="vp-plan-pill">Activo</div>
                    )}
                </div>
            </div>
        </aside>
    );
}
