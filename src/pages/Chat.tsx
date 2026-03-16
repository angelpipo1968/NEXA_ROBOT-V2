import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { ChatContainer } from '@/components/chat/container';

export default function ChatPage() {
    const location = useLocation();
    const { setActiveModule } = useUIStore();

    useEffect(() => {
        if (location.pathname === '/webdev') {
            setActiveModule('dev');
        } else if (['/', '/chat', '/home'].includes(location.pathname)) {
            setActiveModule('chat');
        }
    }, [location.pathname, setActiveModule]);

    return (
        <div className="h-[100dvh] w-full bg-transparent text-[var(--text-primary)] transition-colors duration-300">
            <ChatContainer />
        </div>
    );
}
