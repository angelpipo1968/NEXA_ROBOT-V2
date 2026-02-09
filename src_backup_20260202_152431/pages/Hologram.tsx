import React from 'react';

export default function HologramPage() {
    return (
        <section className="flex flex-col h-full overflow-hidden relative p-8">
            <div className="max-w-4xl mx-auto w-full">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
                        Nexa Hologram
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Interact with AI avatars and digital personas.
                    </p>
                </header>

                <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center h-[500px] border border-cyan-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>

                    <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)] mb-6 z-10">
                        <span className="text-5xl">👤</span>
                    </div>

                    <h2 className="text-2xl font-semibold z-10">Select an Avatar</h2>
                    <p className="text-gray-500 mt-2 z-10">Choose a persona to begin interaction</p>

                    <button className="mt-8 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition-all z-10">
                        Browse Gallery
                    </button>
                </div>
            </div>
        </section>
    );
}
