import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarState = 'logo' | 'thinking' | 'speaking' | 'happy' | 'warning' | 'idle';

interface NexaAvatarProps {
    state?: AvatarState;
    size?: number;
    className?: string;
}

export const NexaAvatar: React.FC<NexaAvatarProps> = ({ state = 'logo', size = 64, className = '' }) => {
    // Colors from the theme
    const accent = '#8ab4f8';
    const secondary = '#1a73e8';

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={false}
                animate={state}
            >
                <defs>
                    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: accent, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: secondary, stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {state === 'logo' || state === 'idle' ? (
                    <motion.path
                        d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z"
                        fill="url(#avatarGrad)"
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 4,
                            ease: "easeInOut"
                        }}
                    />
                ) : (
                    <motion.g>
                        {/* Clean minimal head */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#avatarGrad)"
                            strokeWidth="3"
                            fill="rgba(138, 180, 248, 0.05)"
                        />
                        {/* Eyes */}
                        <motion.circle
                            cx="35"
                            cy="45"
                            r="4"
                            fill={accent}
                            animate={state === 'thinking' ? { scaleY: [1, 0.2, 1] } : {}}
                            transition={state === 'thinking' ? { repeat: Infinity, duration: 1 } : {}}
                        />
                        <motion.circle
                            cx="65"
                            cy="45"
                            r="4"
                            fill={accent}
                            animate={state === 'thinking' ? { scaleY: [1, 0.2, 1] } : {}}
                            transition={state === 'thinking' ? { repeat: Infinity, duration: 1, delay: 0.1 } : {}}
                        />
                        {/* Mouth */}
                        <motion.path
                            d={state === 'speaking' ? "M40 70 Q 50 85, 60 70" : "M40 70 Q 50 70, 60 70"}
                            stroke={accent}
                            strokeWidth="3"
                            strokeLinecap="round"
                            animate={state === 'speaking' ? {
                                d: ["M40 70 Q 50 70, 60 70", "M40 70 Q 50 85, 60 70", "M40 70 Q 50 70, 60 70"],
                            } : {}}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        />
                    </motion.g>
                )}
            </motion.svg>
        </div>
    );
};
