"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NexaContextType {
    // UI State
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    
    // Config
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
}

const NexaContext = createContext<NexaContextType | undefined>(undefined);

export function NexaProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Global theme listener or sync logic could go here
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return (
        <NexaContext.Provider value={{
            isSidebarOpen,
            setSidebarOpen,
            theme,
            setTheme
        }}>
            {children}
        </NexaContext.Provider>
    );
}

export const useNexa = () => {
    const context = useContext(NexaContext);
    if (context === undefined) {
        throw new Error('useNexa must be used within a NexaProvider');
    }
    return context;
};
