// NEXA OS SINGULARITY v3.0.1 [STABLE-P2P]
import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
const FuturisticDashboard = React.lazy(() => import('./components/dev/FuturisticDashboard'));
const GmailPage = React.lazy(() => import('./components/widgets/GmailHub'));

import { MobileTopBar } from '@/components/layout/MobileTopBar';

import CyberpunkParticles from '@/components/ui/CyberpunkParticles';
import { dreamResearchService } from '@/lib/services/dreamResearch';
import { autonomyService } from '@/lib/services/AutonomyService';
import { heartbeatService } from '@/lib/services/HeartbeatService';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

function Layout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const { syncUser } = useChatStore();
    const navigate = useNavigate();
    const [isGuest, setIsGuest] = React.useState(false);

    React.useEffect(() => {
        // Initialize native platform features
        if (Capacitor.isNativePlatform()) {
            StatusBar.setOverlaysWebView({ overlay: false }).catch(() => { });
            StatusBar.setBackgroundColor({ color: '#030305' }).catch(() => { });
            StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
            // KeyboardResize.Body ensures the view shrinks correctly on Samsung WebViews
            Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => { });
        }

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
        });

        // Start El Sueño Indexador (Dream Research REM Phase)
        dreamResearchService.startMonitoring();

        // Start Inmortal Mode (Foreground Service for 24/7 autonomy)
        autonomyService.startInmortalMode();

        // Start Heartbeat (Autonomous reflection and research)
        heartbeatService.start();

        return () => subscription.unsubscribe();
    }, [syncUser, navigate]);
    return (
        <div className="vp-app flex w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Global Visual Effects */}
            <CyberpunkParticles />
            <div className="cyber-overlay" />
            <div className="scanline" />

            {/* New Nexa-Style Sidebar with Branding */}
            <NexaSidebar />

            {/* Mobile Optimized Header */}
            <MobileTopBar isGuest={isGuest} onPlusClick={() => {
                useChatStore.getState().clearMessages();
                navigate('/');
            }} />

            {/* Main Content - Adjusted padding for wider sidebar */}
            <main
                className={`vp-main flex-1 relative h-full overflow-hidden transition-all duration-300 w-full pt-[3.5rem] md:pt-0 ${isSidebarOpen ? 'md:pl-[280px]' : 'pl-[0px] md:pl-[80px]'
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

function AppRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><ChatPage /></PageTransition>} />
                <Route path="/home" element={<PageTransition><ChatPage /></PageTransition>} />
                <Route path="/chat" element={<PageTransition><ChatPage /></PageTransition>} />
                <Route path="/webdev" element={<PageTransition><ChatPage /></PageTransition>} />
                <Route path="/studio" element={<PageTransition><StudioPage /></PageTransition>} />
                <Route path="/projects" element={<PageTransition><div className="p-8 text-white">Projects Placeholder</div></PageTransition>} />
                <Route path="/test-search" element={<PageTransition><SearchCardTest /></PageTransition>} />
                <Route path="/landing-demo" element={<PageTransition><DemoLanding /></PageTransition>} />
                <Route path="/generator" element={<PageTransition><MediaGeneratorPage /></PageTransition>} />
                <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
                <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><FuturisticDashboard /></PageTransition>} />
                <Route path="/gmail" element={<PageTransition><GmailPage /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
}

function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <HashRouter>
                <Layout>
                    <AppRoutes />
                </Layout>
            </HashRouter>
        </ErrorBoundary>
    );
}

export default App;
