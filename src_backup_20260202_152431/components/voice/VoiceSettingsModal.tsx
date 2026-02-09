'use client';

import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface VoiceOption {
    id: string;
    name: string;
    description: string;
    gender: 'female' | 'male';
}

const VOICE_OPTIONS: VoiceOption[] = [
    {
        id: 'sonrisa',
        name: 'Sonrisa',
        description: 'Una mujer latinoamericana cálida y alegre',
        gender: 'female'
    },
    {
        id: 'katerina',
        name: 'Katerina',
        description: 'Una voz femenina madura y rítmica.',
        gender: 'female'
    },
    {
        id: 'aiden',
        name: 'Aiden',
        description: 'Un joven estadounidense que es un gran cocinero.',
        gender: 'male'
    },
    {
        id: 'li',
        name: 'Li',
        description: 'Un profesor de yoga paciente.',
        gender: 'male'
    }
];

interface VoiceSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (voiceId: string) => void;
}

export function VoiceSettingsModal({ isOpen, onClose, onSave }: VoiceSettingsModalProps) {
    const [selectedVoice, setSelectedVoice] = useState<string>('sonrisa');
    const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female'>('all');
    const [language, setLanguage] = useState('Español');

    if (!isOpen) return null;

    const filteredVoices = VOICE_OPTIONS.filter(voice => {
        if (activeTab === 'all') return true;
        return voice.gender === activeTab;
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Voz</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Language Selector */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Lenguaje</label>
                            <div className="relative group cursor-pointer text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                                {language}
                                <ChevronDown size={16} className="text-gray-400" />
                                {/* Simplified dropdown for now since it's just visually matching */}
                            </div>
                        </div>
                        <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-1.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'all'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Todo
                        </button>
                        <button
                            onClick={() => setActiveTab('male')}
                            className={`flex-1 py-1.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'male'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Masculino
                        </button>
                        <button
                            onClick={() => setActiveTab('female')}
                            className={`flex-1 py-1.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'female'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Femenino
                        </button>
                    </div>

                    {/* Voice List */}
                    <div className="space-y-4">
                        {filteredVoices.map((voice) => (
                            <div
                                key={voice.id}
                                onClick={() => setSelectedVoice(voice.id)}
                                className={`cursor-pointer group py-2 border-b last:border-0 border-gray-100 dark:border-gray-800 transition-colors ${selectedVoice === voice.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-semibold ${selectedVoice === voice.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {voice.name}
                                    </h3>
                                    {selectedVoice === voice.id && (
                                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {voice.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(selectedVoice)}
                        className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Inicia un nuevo chat
                    </button>
                </div>

            </div>
        </div>
    );
}
