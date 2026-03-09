import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

class SyncService {
    private static instance: SyncService;
    private doc: Y.Doc;
    private provider: WebsocketProvider | null = null;
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
            // Local fallback if no env defined or production sync server
            const wsServer = import.meta.env.VITE_WS_SYNC_SERVER || 'wss://demos.yjs.dev';
            this.provider = new WebsocketProvider(wsServer, this.roomName, this.doc);

            this.provider.on('status', (event: any) => {
                console.log(`[SyncService] 🔌 Connection Status: ${event.status}`);
            });

        } catch (error) {
            console.warn('[SyncService] WebSocket sync unvailable, running in local-only mode.');
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
