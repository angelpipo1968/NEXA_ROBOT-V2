import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SupabaseChatService } from '@/services/chat/supabase-chat.service';
import { Conversation, ChatMessage } from '@/types/chat';

export function useChat() {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión al cargar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            if (session?.user) {
                loadConversations(session.user.id);
            }
            setLoading(false);
        });

        // Escuchar cambios en auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                if (session?.user) {
                    // Only reload if user changed or was null
                    if (user?.id !== session.user.id) {
                        loadConversations(session.user.id);
                    }
                } else {
                    setConversations([]);
                    setMessages([]);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [user?.id]); // Add dependency on user.id to avoid infinite re-loops if logic is slightly off

    const loadConversations = async (userId: string) => {
        const service = new SupabaseChatService(userId);
        const convs = await service.getConversations();
        setConversations(convs);
    };

    const loadMessages = async (conversationId: string) => {
        if (!user) return;

        const service = new SupabaseChatService(user.id);
        const msgs = await service.getMessages(conversationId);
        setMessages(msgs);

        // Actualizar conversación actual
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) setCurrentConversation(conv);
    };

    const sendMessage = async (content: string) => {
        if (!user || !currentConversation) return;

        const service = new SupabaseChatService(user.id);

        // Guardar mensaje del usuario
        const userMessage = await service.saveMessage(
            currentConversation.id,
            'user',
            content,
            0 // tokens calculados después/estimados
        );

        // Actualizar estado local inmediato
        setMessages(prev => [...prev, userMessage]);

        // Obtener respuesta de API (local proxy to Ollama or similar)
        // Assuming /api/chat exists independently or we call Ollama directly. 
        // The user code suggests /api/chat.
        try {
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    conversationId: currentConversation.id,
                    userId: user.id
                })
            });

            const { response, tokens } = await aiResponse.json();

            // Guardar respuesta de la IA
            const aiMessage = await service.saveMessage(
                currentConversation.id,
                'assistant',
                response,
                tokens || 0
            );

            setMessages(prev => [...prev, aiMessage]);
            return aiResponse;

        } catch (e) {
            console.error("Error sending message to AI", e);
            // Handle error state in UI
        }
    };

    const createNewConversation = async (title: string = 'Nueva Conversación') => {
        if (!user) return;

        const service = new SupabaseChatService(user.id);
        const conversation = await service.createConversation(title);

        setConversations(prev => [conversation, ...prev]);
        setCurrentConversation(conversation);
        setMessages([]);

        return conversation;
    };

    const deleteConversation = async (conversationId: string) => {
        if (!user) return;

        const service = new SupabaseChatService(user.id);
        await service.deleteConversation(conversationId);

        setConversations(prev => prev.filter(c => c.id !== conversationId));

        if (currentConversation?.id === conversationId) {
            setCurrentConversation(null);
            setMessages([]);
        }
    };

    return {
        user,
        conversations,
        currentConversation,
        messages,
        loading,
        loadMessages,
        sendMessage,
        createNewConversation,
        deleteConversation
    };
}
