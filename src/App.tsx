import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NexaSidebar from '@/components/layout/NexaSidebar';
import { WelcomeScreen } from './components/layout/WelcomeScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { SearchCardTest } from './components/debug/SearchCardTest';
import DemoLanding from './pages/DemoLanding';
import { useUIStore } from '@/store/useUIStore';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load heavy pages
const ChatPage = React.lazy(() => import('./pages/Chat'));
const StudioPage = React.lazy(() => import('./pages/Studio'));

function Layout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useUIStore();

    return (
        <div className="vp-app flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">


            {/* WelcomeScreen REMOVED from here to Context/App level if possible, or just kept here */}
            {/* New Qwen-Style Sidebar with Branding */}
            <NexaSidebar />

            {/* Main Content - Adjusted padding for wider sidebar */}
            <main
                className={`vp-main flex-1 relative h-full overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'
                    }`}
            >
                <Suspense fallback={<LoadingSpinner />}>
                    {children}
                </Suspense>
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
        <>
            <WelcomeScreen />
            <ErrorBoundary>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<ChatPage />} />
                            <Route path="/home" element={<ChatPage />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/webdev" element={<ChatPage />} />
                            <Route path="/studio" element={<StudioPage />} />
                            <Route path="/projects" element={<div className="p-8 text-white">Projects Placeholder</div>} />
                            <Route path="/test-search" element={<SearchCardTest />} />
                            <Route path="/landing-demo" element={<DemoLanding />} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </ErrorBoundary>
        </>
    );
}

export default App;
