import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NexaSidebar from '@/components/layout/NexaSidebar';
import ChatPage from './pages/Chat';
import ErrorBoundary from './components/ErrorBoundary';

import StudioPage from './pages/Studio';
import HologramPage from './pages/Hologram';

import { useUIStore } from '@/store/useUIStore';
import { SettingsModal } from '@/components/settings/SettingsModal';

function Layout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useUIStore();

    return (
        <div className="vp-app flex h-screen w-full overflow-hidden bg-[#050505]">
            {/* Background Effects */}
            <div className="vp-bg-glow vp-bg-glow--left opacity-50" />
            <div className="vp-bg-glow vp-bg-glow--right opacity-30" />

            {/* New Qwen-Style Sidebar with Branding */}
            <NexaSidebar />

            {/* Main Content - Adjusted padding for wider sidebar */}
            <main
                className={`vp-main flex-1 relative h-full overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'
                    }`}
            >
                {children}
            </main>

            {/* Global Modals */}
            <SettingsModal
                isOpen={useUIStore((state) => state.isSettingsOpen)}
                onClose={() => useUIStore.getState().setSettingsOpen(false)}
            />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<ChatPage />} />
                        <Route path="/home" element={<ChatPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/studio" element={<StudioPage />} />
                        <Route path="/hologram" element={<HologramPage />} />
                        <Route path="/projects" element={<div className="p-8 text-white">Projects Placeholder</div>} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
