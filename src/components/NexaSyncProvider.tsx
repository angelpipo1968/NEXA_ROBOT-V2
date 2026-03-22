import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useChatStore } from '@/store/useChatStore';

interface NexaSyncContextType {
    doc: Y.Doc;
    provider: WebrtcProvider | null;
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
    const [provider, setProvider] = useState<WebrtcProvider | null>(null);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

    useEffect(() => {
        console.log('[SWARM] Inicializando Mente Enjambre via P2P (WebRTC)...');
        setStatus('connecting');

        // Signaling servers para WebRTC (P2P).
        const signalingServers = [
            'wss://y-webrtc-signaling-eu.herokuapp.com',
            'wss://y-webrtc-signaling-us.herokuapp.com'
        ];

        const webrtcProvider = new WebrtcProvider(
            'nexa-swarm-kernel-v1',
            doc,
            { 
                signaling: signalingServers,
                peerOpts: {
                    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
                }
            }
        );

        const handleStatus = (event: any) => {
            // webrtc provider peer count access
            const providerAny = webrtcProvider as any;
            const peerCount = providerAny.room ? providerAny.room.webrtcConns.size : 0;
            console.log(`[SWARM] P2P Peers: ${peerCount}`);
            
            // For UI simplicity, if we are active, we show as 'connected'
            setStatus('connected');

            try {
                useChatStore.getState().addTerminalLog(`[P2P SYNC] Enjambre Online (${peerCount} pares)`);
            } catch (e) { }
        };

        webrtcProvider.on('status', handleStatus);
        webrtcProvider.on('peers', handleStatus);

        const yMessages = doc.getArray('shared-messages');

        // Sincronizar logs de terminal como prueba de concepto CRDT
        doc.getText('nexa-kernel-logs').observe((event) => {
            // Future implementation: synchronize React state with distributed state
        });

        setProvider(webrtcProvider);

        return () => {
            console.log('[SWARM] Desconectando nodos P2P...');
            webrtcProvider.destroy();
            doc.destroy();
        };
    }, [doc]);

    return (
        <NexaSyncContext.Provider value={{ doc, provider, status }}>
            {children}
                    {/* Visual indicator of Swarm Status */}
                    {status !== 'connected' && (
                        <div className="absolute bottom-12 right-4 z-50 text-[9px] font-mono text-cyan-400 bg-black/60 px-2 py-1 rounded backdrop-blur border border-cyan-500/20 animate-pulse">
                            SWARM_SYNC: {status.toUpperCase()}
                        </div>
                    )}
        </NexaSyncContext.Provider>
    );
};
