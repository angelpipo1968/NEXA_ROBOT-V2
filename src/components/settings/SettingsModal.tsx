'use client';

import React, { useState, useEffect } from 'react';
// import { useTheme } from "next-themes"; // Removed for Vite compatibility

import { supabase } from '@/lib/supabase';
// import { useRouter } from 'next/navigation'; // Removed for Vite compatibility
import { useNavigate } from 'react-router-dom'; // Added for Vite
import {
    Monitor,
    User,
    Layers,
    MessageSquare,
    Settings,
    ChevronLeft,
    Info,
    X,
    ChevronRight,
    Palette,
    Mic,
    Shield, // For password management icon
    Trash2,
    LogOut,
    KeyRound
} from 'lucide-react';
import { MCPExplorer } from './MCPExplorer';
import { SearchSettings } from './SearchSettings';
import { MemoryPanel } from './MemoryPanel';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'general' | 'interface' | 'models' | 'chats' | 'personalization' | 'account' | 'about';

// Simple theme hook replacement for Vite (assuming Tailwind dark mode class strategy)
function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (t: 'light' | 'dark') => {
            root.classList.remove('light', 'dark');
            root.classList.add(t);
        };

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            applyTheme(systemTheme);
        } else {
            applyTheme(theme);
        }
    }, [theme]);

    return { theme, setTheme };
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [subTab, setSubTab] = useState<'main' | 'voice' | 'memory'>('main'); // Sub-navigation
    const [selectedVoice, setSelectedVoice] = useState('Katerina');
    const [voiceFilter, setVoiceFilter] = useState<'Female' | 'Male' | 'My Voice'>('Female');
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [isGuest, setIsGuest] = useState(false);

    // Reset sub-tab when main tab changes
    useEffect(() => {
        setSubTab('main');
    }, [activeTab]);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const guest = localStorage.getItem('nexa_guest') === 'true';
            setUser(user);
            setIsGuest(guest);
        };
        fetchUser();
    }, []);

    if (!isOpen) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'interface', label: 'Interface', icon: <Monitor size={18} /> },
        { id: 'models', label: 'Models', icon: <Layers size={18} /> },
        { id: 'chats', label: 'Chats', icon: <MessageSquare size={18} /> },
        { id: 'personalization', label: 'Personalization', icon: <Palette size={18} /> },
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'about', label: 'About', icon: <Info size={18} /> },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex h-[85vh] w-[1000px] overflow-hidden rounded-2xl bg-white dark:bg-[#0f1117] text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-white/10">

                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0f] flex flex-col pt-6 pb-4">
                    <div className="flex items-center gap-3 px-6 mb-8 text-gray-900 dark:text-gray-100">
                        <button onClick={onClose} className="hover:bg-gray-200 dark:hover:bg-white/10 p-1.5 rounded-full text-gray-500 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                    </div>

                    <nav className="flex-1 space-y-0.5 px-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col bg-white dark:bg-[#0f1117]">

                    {/* Header (Hidden mostly or simple close) */}
                    <div className="flex items-center justify-end p-4">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-12 pb-12">
                        {/* Dynamic Title */}
                        <div className="mb-8 flex items-center gap-2">
                            {subTab !== 'main' && (
                                <button
                                    onClick={() => setSubTab('main')}
                                    className="p-1 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <h3 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                                {subTab === 'voice' ? 'Voice' : subTab === 'memory' ? 'Memory' : tabs.find(t => t.id === activeTab)?.label}
                            </h3>
                        </div>

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="max-w-2xl">
                                {subTab === 'main' ? (
                                    <div className="space-y-8">
                                        {/* Theme Row */}
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-base text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                                            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full">
                                                {[
                                                    { id: 'system', label: 'System' },
                                                    { id: 'light', label: 'Light' },
                                                    { id: 'dark', label: 'Dark' },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setTheme(opt.id as any)}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${theme === opt.id
                                                            ? 'bg-white dark:bg-white/10 shadow-sm text-black dark:text-white'
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                                            }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language Row */}
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-base text-gray-700 dark:text-gray-300 font-medium">Language</span>
                                            <div className="relative">
                                                <select className="appearance-none bg-transparent py-2 pl-4 pr-8 text-right text-gray-900 dark:text-gray-200 font-medium focus:outline-none cursor-pointer">
                                                    <option>English (US)</option>
                                                    <option>Español</option>
                                                    <option>中文</option>
                                                </select>
                                                <ChevronDownIcon />
                                            </div>
                                        </div>

                                        {/* Voice Row */}
                                        <div
                                            onClick={() => setSubTab('voice')}
                                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 cursor-pointer group"
                                        >
                                            <span className="text-base text-gray-700 dark:text-gray-300 font-medium">Voice</span>
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                <span className="font-medium">{selectedVoice}</span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Voice Sub-Menu */
                                    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-200">

                                        {/* Spoken Language Dropdown */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Spoken Language</span>
                                                <div className="relative">
                                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        English
                                                        <ChevronDownIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Voice Filters (Female / Male / My Voice) */}
                                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full w-max">
                                            {['Female', 'Male', 'My Voice'].map((filter) => (
                                                <button
                                                    key={filter}
                                                    onClick={() => setVoiceFilter(filter as any)}
                                                    className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${voiceFilter === filter
                                                        ? 'bg-white dark:bg-white/10 shadow-sm text-black dark:text-white'
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                                        }`}
                                                >
                                                    {filter}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Voice List */}
                                        <div className="space-y-2">
                                            {[
                                                { name: 'Katerina', desc: 'A mature and rhythmic female voice.', id: 'katerina', gender: 'Female' },
                                                { name: 'Momo', desc: 'A playful and cute voice to cheer you up.', id: 'momo', gender: 'Female' },
                                                { name: 'Sunny', desc: 'This Sichuan girl is sweet enough to melt your heart.', id: 'sunny', gender: 'Female' },
                                                { name: 'Maia', desc: 'A voice that blends intelligence and gentleness.', id: 'maia', gender: 'Female' },
                                                { name: 'Jennifer', desc: 'A premium, cinematic American English female voice.', id: 'jennifer', gender: 'Female' },
                                                { name: 'David', desc: 'A deep, resonant American male voice.', id: 'david', gender: 'Male' },
                                            ]
                                                .filter(v => v.gender === voiceFilter)
                                                .map((voice) => (
                                                    <div
                                                        key={voice.id}
                                                        onClick={() => setSelectedVoice(voice.name)}
                                                        className={`group relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border ${selectedVoice === voice.name
                                                            ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/30'
                                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                                                            }`}
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className={`text-base font-semibold mb-0.5 ${selectedVoice === voice.name ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                {voice.name}
                                                            </h4>
                                                            <p className={`text-sm ${selectedVoice === voice.name ? 'text-purple-700 dark:text-purple-300/70' : 'text-gray-500'}`}>
                                                                {voice.desc}
                                                            </p>
                                                        </div>
                                                        {selectedVoice === voice.name && (
                                                            <div className="text-purple-600 dark:text-purple-400">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                            {voiceFilter === 'My Voice' && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 text-gray-400">
                                                        <Mic size={24} />
                                                    </div>
                                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Clone your voice</h4>
                                                    <p className="text-sm text-gray-500 mt-1 mb-4 max-w-xs">Create a custom AI voice clone to use in your chats.</p>
                                                    <button className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">
                                                        Create Voice
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}

                        {/* INTERFACE TAB */}
                        {activeTab === 'interface' && (
                            <div className="space-y-8 max-w-3xl">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Chat</h4>
                                    <div className="space-y-1">
                                        {/* Title Auto-Generation */}
                                        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Title Auto-Generation</span>
                                            <ToggleSwitch defaultChecked={true} />
                                        </div>

                                        {/* Auto-Copy Response to Clipboard */}
                                        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Auto-Copy Response to Clipboard</span>
                                            <ToggleSwitch defaultChecked={true} />
                                        </div>

                                        {/* Paste Large Text as File */}
                                        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Paste Large Text as File</span>
                                            <ToggleSwitch defaultChecked={true} />
                                        </div>
                                    </div>
                                </div>

                                {/* Search Settings */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Web Search</h4>
                                    <SearchSettings />
                                </div>
                            </div>
                        )}

                        {/* CHATS TAB */}
                        {activeTab === 'chats' && (
                            <div className="space-y-6 max-w-3xl">
                                {/* Chats Settings List */}
                                <div className="divide-y divide-gray-100 dark:divide-white/5">

                                    {/* Import */}
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Import Chats</span>
                                        <button className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            Import Chats
                                        </button>
                                    </div>

                                    {/* Export */}
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Export Chats</span>
                                        <button className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            Export Chats
                                        </button>
                                    </div>

                                    {/* Archive All */}
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Archive All Chats</span>
                                        <button className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            Archive All Chats
                                        </button>
                                    </div>

                                    {/* Delete All */}
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Delete All Chats</span>
                                        <button className="px-6 py-2 rounded-full border border-red-200 dark:border-red-900/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            Delete Chat
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* PERSONALIZATION TAB */}
                        {activeTab === 'personalization' && (
                            <div className="space-y-12 max-w-3xl">

                                {/* Memory Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Memory</h4>
                                        <button
                                            onClick={() => setSubTab('memory')}
                                            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <Settings size={14} />
                                            Manage
                                        </button>
                                    </div>

                                    {subTab === 'memory' ? (
                                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                            <MemoryPanel />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Reference Saved Memories Toggle */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                                                <div>
                                                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">Reference saved memories</div>
                                                    <div className="text-sm text-gray-500 mt-1">Nexa will save and reference memories when generating replies.</div>
                                                </div>
                                                <ToggleSwitch defaultChecked />
                                            </div>

                                            {/* Reference Chat History Toggle */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
                                                <div>
                                                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">Reference the chat history</div>
                                                    <div className="text-sm text-gray-500 mt-1">Nexa will reference saved memory when generating responses.</div>
                                                </div>
                                                <ToggleSwitch defaultChecked />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Customize Nexa Section */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Customize Nexa</h4>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-base font-medium text-gray-900 dark:text-gray-100">Customize Nexa Profile</span>
                                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <Settings size={14} />
                                            Settings
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <div className="space-y-8 max-w-3xl">

                                {/* User Info Row */}
                                <div className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold text-white uppercase shadow-lg shadow-purple-900/20">
                                            {isGuest ? 'G' : (user?.email?.[0] || 'U')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {isGuest ? 'Invitado' : (user?.user_metadata?.full_name || 'Usuario')}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-500">{isGuest ? 'Sesión de invitado' : (user?.email || 'N/A')}</p>
                                        </div>
                                    </div>
                                    {!isGuest && (
                                        <button
                                            onClick={async () => {
                                                const newName = prompt('Enter new full name:', user?.user_metadata?.full_name || '');
                                                if (newName) {
                                                    const { error } = await supabase.auth.updateUser({
                                                        data: { full_name: newName }
                                                    });
                                                    if (error) alert(error.message);
                                                    else {
                                                        const { data: { user: updatedUser } } = await supabase.auth.getUser();
                                                        setUser(updatedUser);
                                                    }
                                                }
                                            }}
                                            className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Edit name
                                        </button>
                                    )}
                                </div>

                                {/* Password Management */}
                                {!isGuest && (
                                    <div className="flex items-center justify-between py-6 border-t border-gray-100 dark:border-white/5">
                                        <div>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium font-medium">Password management</span>
                                            <p className="text-xs text-zinc-500">Update your account password</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const newPassword = prompt('Enter new password (min 6 chars):');
                                                if (newPassword && newPassword.length >= 6) {
                                                    const { error } = await supabase.auth.updateUser({
                                                        password: newPassword
                                                    });
                                                    if (error) alert(error.message);
                                                    else alert('Contraseña actualizada correctamente.');
                                                }
                                            }}
                                            className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Change password
                                        </button>
                                    </div>
                                )}

                                {/* Sign Out */}
                                {isGuest ? (
                                    <div className="flex flex-col gap-4 py-6 border-t border-gray-100 dark:border-white/5">
                                        <div>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium font-medium">Cuenta Nexa</span>
                                            <p className="text-xs text-zinc-500">Inicia sesión o regístrate para guardar tus chats y acceder a funciones PRO</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { onClose(); navigate('/auth'); }}
                                                className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                Iniciar Sesión
                                            </button>
                                            <button
                                                onClick={() => { onClose(); navigate('/auth?mode=signup'); }}
                                                className="px-6 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Registrarse
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between py-6 border-t border-gray-100 dark:border-white/5">
                                        <div>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Sign Out</span>
                                            <p className="text-xs text-zinc-500">Log out of your current session</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (isGuest) {
                                                    localStorage.removeItem('nexa_guest');
                                                    onClose();
                                                    navigate('/auth');
                                                } else {
                                                    const { error } = await supabase.auth.signOut();
                                                    if (error) alert(error.message);
                                                    else {
                                                        onClose();
                                                        navigate('/auth');
                                                    }
                                                }
                                            }}
                                            className="px-6 py-2 rounded-full border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}

                                {/* Account Management (Delete) */}
                                {!isGuest && (
                                    <div className="flex items-center justify-between py-6 border-t border-gray-100 dark:border-white/5">
                                        <div>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">Danger Zone</span>
                                            <p className="text-xs text-red-500/70">Permanently delete your account and data</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (confirm('WARNING: Are you sure you want to delete your account? This action is irreversible and all your chats and data will be lost.')) {
                                                    // Note: Full deletion usually requires an Edge Function or admin key.
                                                    // For MVP, we'll sign out and mark a flag, or just explain the limitation.
                                                    const { error } = await supabase.auth.signOut(); // Sign out and redirect
                                                    alert('Para una eliminación definitiva de tus datos, por favor contacta a soporte@nexa-ai.dev. Se ha cerrado tu sesión.');
                                                    onClose();
                                                    navigate('/auth');
                                                }
                                            }}
                                            className="px-6 py-2 rounded-full border border-red-200 dark:border-red-900/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                )}

                            </div>
                        )}


                        {/* MODELS TAB */}
                        {activeTab === 'models' && (
                            <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">MCP Tool Explorer</h3>
                                    <p className="text-sm text-gray-400">
                                        Explora y descubre las herramientas disponibles a través de tus servidores Model Context Protocol configurados.
                                    </p>
                                </div>
                                <MCPExplorer />
                            </div>
                        )}

                        {/* OTHER TABS (Placeholders) */}
                        {!['general', 'interface', 'chats', 'personalization', 'account', 'models'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Settings size={48} className="mb-4 opacity-20" />
                                <p>Configuración de {activeTab} próximamente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function ToggleSwitch({ defaultChecked }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked || false);
    return (
        <button
            onClick={() => setChecked(!checked)}
            className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'
                }`} />
        </button>
    );
}
