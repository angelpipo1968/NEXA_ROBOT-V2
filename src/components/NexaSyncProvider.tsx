import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useChatStore } from '@/store/useChatStore';

interface NexaSyncContextType {
    doc: Y.Doc;
    provider: WebsocketProvider | null;
    status: 'connecting' | 'connected' | 'disconnected';
}

const NexaSyncContext = createContext<NexaSyncContextType | null>(null);

export const useNexaSync = () => {
    const context = useContext(NexaSyncContext);
    if (!context) throw new Error("useNexaSync must be used within NexaSyncProvider");
    return context;
};

export const NexaSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const [doc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

    useEffect(() => {
        console.log('[SWARM] Inicializando Mente Enjambre via CRDT (Yjs)...');
        setStatus('connecting');

        // URL provisional (Webrtc o websocket relay). En producción usar api.nexa.os/sync
        const wsProvider = new WebsocketProvider(
            'wss://demos.yjs.dev', // Default Yjs public demo server for rapid local testing
            'nexa-swarm-kernel-v1',
            doc,
            { connect: true }
        );

        wsProvider.on('status', (event: { status: 'connecting' | 'connected' | 'disconnected' }) => {
            console.log(`[SWARM] Estado: ${event.status}`);
            setStatus(event.status);

            // Emitimos log de terminal al store si cambia el status
            try {
                useChatStore.getState().addTerminalLog(`[CRDT SYNC] Enjambre ${event.status === 'connected' ? 'Enlazado' : 'Perdido'}`);
            } catch (e) { }
        });

        const yMessages = doc.getArray('shared-messages');

        // Sincronizar logs de terminal como prueba de concepto CRDT
        doc.getText('nexa-kernel-logs').observe((event) => {
            // Future implementation: synchronize React state with distributed state
        });

        setProvider(wsProvider);

        return () => {
            console.log('[SWARM] Desconectando nodos...');
            wsProvider.disconnect();
            wsProvider.destroy();
            doc.destroy();
        };
    }, [doc]);

    return (
        <NexaSyncContext.Provider value={{ doc, provider, status }}>
            {children}
            {/* Visual indicator of Swarm Status */}
            {status !== 'connected' && (
                <div className="fixed bottom-12 right-4 z-50 text-[9px] font-mono text-cyan-400 bg-black/60 px-2 py-1 rounded backdrop-blur border border-cyan-500/20 animate-pulse">
                    SWARM_SYNC: {status.toUpperCase()}
                </div>
            )}
        </NexaSyncContext.Provider>
    );
};
