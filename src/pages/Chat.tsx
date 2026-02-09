import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChatStore } from '@/store/useChatStore';
import { ChatContainer } from '@/components/chat/container';

export default function ChatPage() {
    const location = useLocation();
    const { setActiveModule } = useChatStore();

    useEffect(() => {
        if (location.pathname === '/webdev') {
            setActiveModule('dev');
        } else if (['/', '/chat', '/home'].includes(location.pathname)) {
            setActiveModule('chat');
        }
    }, [location.pathname, setActiveModule]);

    return (
        <div className="h-screen w-full bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white transition-colors duration-300">
            <ChatContainer />
        </div>
    );
}
