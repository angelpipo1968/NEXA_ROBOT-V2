import React from 'react';

export default function StudioPage() {
    return (
        <section className="flex flex-col h-full overflow-hidden relative p-8">
            <div className="max-w-4xl mx-auto w-full">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                        Nexa Studio
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Create, write, and design with advanced AI tools.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Placeholder Cards */}
                    <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">✍️</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Writing Assistant</h3>
                        <p className="text-sm text-gray-500">Draft articles, stories, and documents.</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🎨</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Image Gen</h3>
                        <p className="text-sm text-gray-500">Create stunning visuals from text.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
