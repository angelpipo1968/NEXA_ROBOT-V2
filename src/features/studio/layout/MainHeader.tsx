import { useProjectStore } from '@/store/projectStore';
"use client";

import React from 'react';

import { motion } from 'framer-motion';
import { MoonStars, PenNib } from '@phosphor-icons/react';

export default function MainHeader() {
        const { projectData } = useProjectStore();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between px-8 py-5 border-b border-white/5 glass-panel z-10 sticky top-0"
        >
            <div className="flex flex-col gap-1">
                <motion.h1
                    id="bookTitle"
                    layoutId="bookTitle"
                    className="text-2xl font-bold tracking-tight text-white flex items-center gap-3"
                >
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(0,150,255,0.1)]">
                        <PenNib size={20} weight="duotone" />
                    </div>
                    {projectData.title}
                </motion.h1>
                <p id="bookSubtitle" className="text-sm font-medium text-white/40 ml-11">
                    Escribe, corrige y publica con inteligencia artificial avanzada
                </p>
            </div>

            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="header-actions"
            >
                <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors px-6 py-2.5 rounded-full border border-white/10 text-sm font-semibold text-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md cursor-pointer group">
                    <MoonStars
                        size={18}
                        weight="duotone"
                        className="text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                    <span>Modo Nocturno <span className="text-white/30 mx-1">•</span> Enfoque Total</span>
                </button>
            </motion.div>
        </motion.header>
    );
}
