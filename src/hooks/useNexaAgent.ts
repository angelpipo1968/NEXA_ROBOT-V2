// src/hooks/useNexaAgent.ts - Hook principal que une todo la orquestación
import { useState, useCallback } from 'react';
import { TrustLevel, PERMISSION_RULES } from '../../apps/kernel/security';
import { SecureExecutor } from '../packages/sandbox/executor';

// Reemplazamos VectorMemory para no depender directamente de ella en el cliente (lo maneja el kernel) 
// Pero lo dejamos aquí como mock visual de acuerdo al plan
export const useApproval = () => {
    const request = useCallback(async (action: { level: TrustLevel; description: string }) => {
        // Mostrar modal holográfico con opción de aprobar con huella/FaceID en móvil
        console.log(`[APPROVAL REQUESTED] ${action.description} - Lvl ${action.level}`);
        return new Promise<boolean>((resolve) => {
            // Lógica real de UI / Biometrics call
            setTimeout(() => resolve(true), 1500); // Autoaprobado tras 1.5s (Mock)
        });
    }, []);
    return { request };
};

export const useNexaAgent = () => {
    const { request: requestApproval } = useApproval();
    const [thoughtGraph, setThoughtGraph] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
    const [status, setStatus] = useState<string>('IDLE');
    const [jobId, setJobId] = useState<string>('');

    const execute = async (intent: string, options: { trustLevel?: TrustLevel } = {}) => {
        setStatus('EXECUTING');

        try {
            // En una app real, esto sería fetch('https://nexa.local:3000/execute', ...)
            // Simulamos la llamada al Orchestrator Hono
            const resJobId = crypto.randomUUID();
            setJobId(resJobId);

            // 3. Si requiere aprobación, pausar y esperar
            const level = options.trustLevel ?? TrustLevel.READ;
            if (PERMISSION_RULES[level].requiresApproval) {
                setStatus('PENDING_APPROVAL');
                const approved = await requestApproval({
                    level,
                    description: `Nexa quiere: ${intent}`
                });
                if (!approved) {
                    setStatus('CANCELLED');
                    return { cancelled: true };
                }
                // MOCK a aprobar: await kernelPost('/approve', { jobId });
                setStatus('APPROVED');
            }

            // 4. Ejecutar en sandbox si es código
            let result = null;
            if (intent.includes('code') || intent.includes('script') || intent.includes('test')) {
                setStatus('SANDBOXING');
                const sandbox = new SecureExecutor();
                await sandbox.init();
                result = await sandbox.execute(intent); // En un caso real pasamos código puro JS
                await sandbox.reset();
            }

            // El storage de VectorDB lo manejará el backend/Kernel.
            setStatus('COMPLETE');
            return { jobId: resJobId, result };

        } catch (err) {
            setStatus('ERROR');
            console.error(err);
            return { error: err };
        }
    };

    return { execute, thoughtGraph, status, jobId };
};
