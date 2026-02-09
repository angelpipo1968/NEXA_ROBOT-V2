import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import './ThemeToggle.css';

export function ThemeToggle() {
    const { theme, effectiveTheme, setTheme, toggleTheme } = useThemeStore();

    const isDark = effectiveTheme === 'dark';

    return (
        <div className="theme-toggle-container">
            <motion.button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label="Toggle theme"
                title={`Current: ${theme} mode`}
                whileHover={{ scale: 1.05, backgroundColor: 'var(--card-hover-bg)' }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    className="theme-toggle-icon-wrapper"
                    initial={false}
                    animate={{
                        rotate: isDark ? 180 : 0,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    {isDark ? (
                        // Moon icon
                        <svg
                            className="theme-toggle-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                                fill="currentColor"
                            />
                        </svg>
                    ) : (
                        // Sun icon
                        <svg
                            className="theme-toggle-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="12" cy="12" r="5" fill="currentColor" />
                            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </motion.div>

                <span className="theme-toggle-label">
                    {isDark ? 'Dark' : 'Light'}
                </span>
            </motion.button>
        </div>
    );
}
