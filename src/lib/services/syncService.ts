import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

class SyncService {
    private static instance: SyncService;
    private doc: Y.Doc;
    private provider: WebrtcProvider | null = null;
    private roomName: string = 'nexa-os-global';

    private constructor() {
        this.doc = new Y.Doc();
        this.initializeProvider();
    }

    public static getInstance(): SyncService {
        if (!SyncService.instance) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    private initializeProvider() {
        try {
            const signalingServers = [
                'wss://y-webrtc-signaling-eu.herokuapp.com',
                'wss://y-webrtc-signaling-us.herokuapp.com'
            ];
            
            this.provider = new WebrtcProvider(this.roomName, this.doc, {
                signaling: signalingServers
            });

            console.log('[SyncService] 🔌 WebRTC P2P Sync Hub Initialized');

        } catch (error) {
            console.warn('[SyncService] WebRTC sync unvailable, running in local-only mode.');
        }
    }

    public getSharedArray(name: string): Y.Array<any> {
        return this.doc.getArray(name);
    }

    public getSharedMap(name: string): Y.Map<any> {
        return this.doc.getMap(name);
    }

    public disconnect() {
        this.provider?.disconnect();
    }
}

export const syncService = SyncService.getInstance();
