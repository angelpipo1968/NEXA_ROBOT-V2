
'use client';

import React from 'react';
import { AvatarEditor } from '@nexa/hologram';

export default function AvatarEditorPage() {
    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white">
            <header className="p-6 border-b border-gray-900 bg-gray-900/50 backdrop-blur">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Nexa Avatar Studio
                    </h1>
                    <nav className="flex gap-4 text-sm text-gray-400">
                        <a href="/hologram-chat" className="hover:text-white transition-colors">Chat</a>
                        <a href="/avatar-editor" className="text-cyan-400">Editor</a>
                    </nav>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full">
                    <AvatarEditor
                        onSave={(config) => {
                            console.log('Saved config:', config);
                            alert('Avatar configuration saved! (Check console)');
                        }}
                    />
                </div>
            </main>
        </div>
    );
}
