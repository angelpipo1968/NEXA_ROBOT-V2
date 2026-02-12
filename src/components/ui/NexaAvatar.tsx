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
    const cyan = '#00F2FF';
    const purple = '#8100FF';

    // SVG Paths for morphing
    const paths = useMemo(() => ({
        logo_stroke1: "M80 20 L20 80", // X left-down
        logo_stroke2: "M20 20 L80 80", // X right-down
        face_outline: "M50 10 C 25 10, 10 25, 10 50 C 10 75, 25 90, 50 90 C 75 90, 90 75, 90 50 C 90 25, 75 10, 50 10",
        eye_left: "M35 45 Q 40 45, 40 50 Q 40 55, 35 55 Q 30 55, 30 50 Q 30 45, 35 45",
        eye_right: "M65 45 Q 70 45, 70 50 Q 70 55, 65 55 Q 60 55, 60 50 Q 60 45, 65 45",
        mouth_neutral: "M40 70 Q 50 70, 60 70",
        mouth_happy: "M35 65 Q 50 80, 65 65",
        mouth_thinking: "M45 75 Q 50 75, 55 75",
        mouth_speaking: "M40 70 Q 50 85, 60 70",
    }), []);

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
                    <linearGradient id="avatarGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: cyan, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="avatarGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: purple, stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="avatarGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {state === 'logo' ? (
                    <motion.g filter="url(#avatarGlow)">
                        <motion.path
                            key="stroke1"
                            d={paths.logo_stroke1}
                            stroke="url(#avatarGrad2)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.path
                            key="stroke2"
                            d={paths.logo_stroke2}
                            stroke="url(#avatarGrad1)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    </motion.g>
                ) : (
                    <motion.g filter="url(#avatarGlow)">
                        {/* Robot Head Base */}
                        <motion.path
                            d={paths.face_outline}
                            stroke={cyan}
                            strokeWidth="4"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            fill="rgba(0, 242, 255, 0.05)"
                        />

                        {/* Eyes */}
                        <motion.path
                            d={paths.eye_left}
                            fill={cyan}
                            animate={state === 'thinking' ? { scaleY: [1, 0.2, 1] } : {}}
                            transition={state === 'thinking' ? { repeat: Infinity, duration: 1 } : {}}
                        />
                        <motion.path
                            d={paths.eye_right}
                            fill={cyan}
                            animate={state === 'thinking' ? { scaleY: [1, 0.2, 1] } : {}}
                            transition={state === 'thinking' ? { repeat: Infinity, duration: 1, delay: 0.1 } : {}}
                        />

                        {/* Mouth morphing based on state */}
                        <motion.path
                            d={
                                state === 'happy' ? paths.mouth_happy :
                                    state === 'thinking' ? paths.mouth_thinking :
                                        state === 'speaking' ? paths.mouth_speaking :
                                            paths.mouth_neutral
                            }
                            stroke={cyan}
                            strokeWidth="3"
                            strokeLinecap="round"
                            animate={state === 'speaking' ? {
                                d: [paths.mouth_neutral, paths.mouth_speaking, paths.mouth_neutral],
                                scale: [1, 1.1, 1]
                            } : {}}
                            transition={state === 'speaking' ? { repeat: Infinity, duration: 0.4 } : { duration: 0.3 }}
                        />
                    </motion.g>
                )}
            </motion.svg>

            {/* Ambient Background Glow */}
            <AnimatePresence>
                {state !== 'logo' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 rounded-full bg-[var(--vp-accent-cyan)] blur-2xl -z-10"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
