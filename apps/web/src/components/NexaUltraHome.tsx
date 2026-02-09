'use client';

import { useRouter } from 'next/navigation';

export default function NexaUltraHome() {
    const router = useRouter();

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black text-white select-none">

            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-10 animate-fadeIn">
                <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl">
                    <span className="text-4xl font-bold tracking-widest">N</span>
                </div>

                <h1 className="text-3xl font-semibold mt-6 opacity-90">
                    Nexa‑Ultra
                </h1>

                <p className="text-lg mt-2 text-neutral-300">
                    ¿Cómo puedo ayudarte hoy?
                </p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-6 animate-slideUp">
                <button
                    onClick={() => router.push('/chat')}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/20 backdrop-blur-xl shadow-lg"
                >
                    Pensamiento
                </button>

                <button
                    onClick={() => router.push('/studio')}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/20 backdrop-blur-xl shadow-lg"
                >
                    Studio
                </button>

                <button
                    onClick={() => router.push('/hologram')}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/20 backdrop-blur-xl shadow-lg"
                >
                    Hologram
                </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-neutral-500 mt-10 animate-fadeInSlow">
                AI-generated content may be incorrect
            </p>
        </div>
    );
}
