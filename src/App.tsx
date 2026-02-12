import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import NexaSidebar from '@/components/layout/NexaSidebar';
import { Menu } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { SearchCardTest } from './components/debug/SearchCardTest';
import DemoLanding from './pages/DemoLanding';
import { useUIStore } from '@/store/useUIStore';
import { useChatStore } from '@/store/useChatStore';
import { supabase } from '@/lib/supabase';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load heavy pages
const ChatPage = React.lazy(() => import('./pages/Chat'));
const StudioPage = React.lazy(() => import('./pages/Studio'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const AuthCallback = React.lazy(() => import('./components/auth/AuthCallback'));
const MediaGeneratorPage = React.lazy(() => import('./pages/Generator'));

import { MobileTopBar } from '@/components/layout/MobileTopBar';

import CyberpunkParticles from '@/components/ui/CyberpunkParticles';

function Layout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const { syncUser } = useChatStore();
    const navigate = useNavigate();
    const [isGuest, setIsGuest] = React.useState(false);

    React.useEffect(() => {
        setIsGuest(localStorage.getItem('nexa_guest') === 'true');

        // Sync user on initial load and handle redirect
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const isGuest = localStorage.getItem('nexa_guest') === 'true';

            if (user) {
                localStorage.removeItem('nexa_guest');
                await syncUser();
            } else if (!isGuest && !window.location.hash.includes('/auth')) {
                // Si no hay usuario ni es invitado, entrar como invitado automáticamente
                localStorage.setItem('nexa_guest', 'true');
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                localStorage.removeItem('nexa_guest');
                syncUser();
            }
            if (event === 'SIGNED_OUT') {
                const isGuest = localStorage.getItem('nexa_guest') === 'true';
                if (!isGuest) {
                    navigate('/auth');
                }
            }
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/auth?mode=reset');
            }
        });

        return () => subscription.unsubscribe();
    }, [syncUser, navigate]);
    return (
        <div className="vp-app flex h-screen w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Global Visual Effects */}
            <CyberpunkParticles />
            <div className="cyber-overlay" />
            <div className="scanline" />

            {/* New Qwen-Style Sidebar with Branding */}
            <NexaSidebar />

            {/* Mobile Optimized Header */}
            <MobileTopBar isGuest={isGuest} onPlusClick={() => {
                useChatStore.getState().clearMessages();
                navigate('/');
            }} />

            {/* Main Content - Adjusted padding for wider sidebar */}
            <main
                className={`vp-main flex-1 relative h-full overflow-hidden transition-all duration-300 w-full ${isSidebarOpen ? 'md:pl-[280px]' : 'pl-[0px] md:pl-[80px]'
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
            <ErrorBoundary>
                <HashRouter>
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
                            <Route path="/generator" element={<MediaGeneratorPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                        </Routes>
                    </Layout>
                </HashRouter>
            </ErrorBoundary>
        </>
    );
}

export default App;
