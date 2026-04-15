import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { Capacitor } from '@capacitor/core';

export class AutonomyService {
    private static instance: AutonomyService;
    private isStarted = false;

    private constructor() { }

    public static getInstance(): AutonomyService {
        if (!AutonomyService.instance) {
            AutonomyService.instance = new AutonomyService();
        }
        return AutonomyService.instance;
    }

    /**
     * Inicia el modo Inmortal en Android (Foreground Service)
     * Esto evita que el sistema operativo mate a Nexa para ahorrar batería.
     */
    public async startInmortalMode() {
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
            console.log('[AutonomyService] ℹ️ Inmortal Mode solo disponible en Android nativo.');
            return;
        }

        if (this.isStarted) return;

        try {
            // Verificar si ya está corriendo para evitar duplicados
            const { display } = await ForegroundService.requestPermissions();
            if (display !== 'granted') {
                console.warn('[AutonomyService] ⚠️ Permisos de notificación no concedidos.');
            }

            await ForegroundService.startForegroundService({
                id: 1988,
                title: 'Nexa OS v4.0 "Singularity"',
                body: 'Protocolo de Autonomía Activo • Monitoreo 24/7',
                smallIcon: 'nexa_logo', // Debe coincidir con el recurso en Android
            });

            this.isStarted = true;
            console.log('[AutonomyService] 🚀 MODO INMORTAL ACTIVADO. Nexa no será detenida por el sistema.');
        } catch (error) {
            console.error('[AutonomyService] ❌ Fallo al iniciar Foreground Service:', error);
        }
    }

    public async stopInmortalMode() {
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
            await ForegroundService.stopForegroundService();
            this.isStarted = false;
        }
    }
}

export const autonomyService = AutonomyService.getInstance();
