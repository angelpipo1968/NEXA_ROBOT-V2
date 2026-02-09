'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { VoiceSettings } from '@/components/chat/VoiceSettings';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Monitor,
    User,
    Volume2,
    LayoutGrid,
    Layers,
    MessageSquare,
    Settings,
    ChevronLeft,
    Info,
    X,
    Globe,
    Sun,
    Moon,
    FileDown,
    Trash2
} from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'general' | 'interface' | 'models' | 'chats' | 'customization' | 'account' | 'about';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    const handleUpdateName = async () => {
        if (!user) return;
        const { error } = await supabase.auth.updateUser({
            data: { full_name: newName }
        });
        if (error) {
            alert('Error updating name: ' + error.message);
        } else {
            setIsEditingName(false);
            // Optimistic update
            setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: newName } });
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password', // Ensure this route exists or update later
        });
        if (error) alert('Error sending reset email: ' + error.message);
        else alert('Password reset email sent to ' + user.email);
    };

    const handleDeleteAccount = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.\n\n(Nota: Por seguridad, esto cerrará tu sesión y requerirá contacto con soporte para eliminación completa de datos en el servidor).')) {
            await supabase.auth.signOut();
            localStorage.clear();
            onClose();
            router.push('/');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onClose();
        router.push('/');
        router.refresh();
    };

    if (!isOpen) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'interface', label: 'Interfaz', icon: <Monitor size={18} /> },
        { id: 'models', label: 'Modelos', icon: <Layers size={18} /> },
        { id: 'chats', label: 'Chats', icon: <MessageSquare size={18} /> },
        { id: 'customization', label: 'Personalización', icon: <LayoutGrid size={18} /> }, // Using LayoutGrid for shapes/grid
        { id: 'account', label: 'Cuenta', icon: <User size={18} /> },
        { id: 'about', label: 'Sobre nosotros', icon: <Info size={18} /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex h-[600px] w-[800px] overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] dark:text-gray-100 shadow-2xl">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151515] p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-6 px-2 text-gray-700 dark:text-gray-200">
                        <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-lg font-semibold">Configuración</h2>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-8 py-4">
                        <h3 className="text-lg font-medium capitalize">{tabs.find(t => t.id === activeTab)?.label}</h3>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <div>
                                    <h4 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Language
                                    </h4>
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                        <Globe size={20} className="text-gray-500" />
                                        <select className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100">
                                            <option>English</option>
                                            <option>Español</option>
                                            <option>中文</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'interface' && (
                            <div className="space-y-8">
                                <div>
                                    <h4 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Theme
                                    </h4>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'light', icon: <Sun size={20} />, label: 'Light' },
                                            { id: 'dark', icon: <Moon size={20} />, label: 'Dark' },
                                            { id: 'system', icon: <Monitor size={20} />, label: 'System' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setTheme(opt.id as any)}
                                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${theme === opt.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                {opt.icon}
                                                <span className="text-sm font-medium">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'models' && (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Configuración de modelos próximamente.</p>
                            </div>
                        )}

                        {activeTab === 'chats' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="mb-2 text-base font-medium">Export Data</h4>
                                    <p className="mb-4 text-sm text-gray-500">Download all your chat history and settings.</p>
                                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                                        <FileDown size={18} />
                                        Export to JSON
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                                    <h4 className="mb-2 text-base font-medium text-red-500">Danger Zone</h4>
                                    <p className="mb-4 text-sm text-gray-500">Permanently delete all data. This action cannot be undone.</p>
                                    <button className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                        <Trash2 size={18} />
                                        Delete All Data
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'customization' && (
                            <VoiceSettings />
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                {/* Sección de Cuenta */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Cuenta
                                    </h4>
                                    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-xl font-bold text-white uppercase">
                                                {user?.email?.[0] || 'U'}
                                            </div>
                                            <div>
                                                {isEditingName ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                            className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-[200px]"
                                                        />
                                                        <button onClick={handleUpdateName} className="text-xs text-green-600 hover:text-green-500 whitespace-nowrap">Guardar</button>
                                                        <button onClick={() => setIsEditingName(false)} className="text-xs text-red-500 hover:text-red-400 whitespace-nowrap">Cancelar</button>
                                                    </div>
                                                ) : (
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Name'}
                                                    </h3>
                                                )}
                                                <p className="text-sm text-gray-500">{user?.email || 'email@example.com'}</p>
                                            </div>
                                        </div>
                                        {!isEditingName && (
                                            <button
                                                onClick={() => {
                                                    setNewName(user?.user_metadata?.full_name || '');
                                                    setIsEditingName(true);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Sección de Gestión de contraseñas */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Seguridad
                                    </h4>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <span className="text-sm">Contraseña</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                    <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePasswordReset}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                </div>

                                {/* Sección de Gestión de cuentas */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                                        Zona de Peligro
                                    </h4>
                                    <div className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-red-700 dark:text-red-400">Eliminar cuenta</h3>
                                                <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-1">
                                                    Esta acción es permanente.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="text-center space-y-4 mt-8">
                                <div className="mx-auto h-20 w-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center shadow-md">
                                    <span className="text-3xl font-bold text-white dark:text-black">N</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Nexa OS</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Versión 1.0.0 (Beta)</p>
                                </div>
                                <div className="pt-8 text-sm text-gray-400 space-y-2 flex flex-col items-center">
                                    <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Términos de servicio</a>
                                    <a href="#" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Política de privacidad</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
