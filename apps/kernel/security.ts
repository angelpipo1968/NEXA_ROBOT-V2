// apps/kernel/security.ts - Cinturón de seguridad para God Mode
export enum TrustLevel {
    READ = 1,        // Solo lectura de archivos/logs
    WRITE_SAFE = 2,  // Escritura en carpetas permitidas (/projects, /docs)
    EXECUTE = 3,     // Ejecución de comandos no críticos
    GOD_MODE = 4     // Deploy, sudo, cambios en sistema
}

export const PERMISSION_RULES: Record<TrustLevel, {
    paths: RegExp[];
    commands: RegExp[];
    requiresApproval: boolean
}> = {
    [TrustLevel.READ]: {
        paths: [/^.*$/], // Todo en lectura
        commands: [/^cat$/, /^ls$/, /^grep$/],
        requiresApproval: false
    },
    [TrustLevel.WRITE_SAFE]: {
        paths: [/^\/projects\//, /^\/docs\//, /^C:\/Users\/pipog\/NEXA_/],
        commands: [/^echo$/, /^write_file$/],
        requiresApproval: true // Notificación, no bloqueo
    },
    [TrustLevel.EXECUTE]: {
        paths: [/^\/projects\//],
        commands: [/^npm$/, /^npx$/, /^python$/, /^node$/],
        requiresApproval: true // Aprobación explícita
    },
    [TrustLevel.GOD_MODE]: {
        paths: [/^.*$/],
        commands: [/^.*$/], // Todos los comandos
        requiresApproval: true // Aprobación con 2FA/biometría
    }
};

export function validatePermission(level: TrustLevel, context: { path?: string; command?: string }) {
    const rules = PERMISSION_RULES[level];

    if (context.path && !rules.paths.some(r => r.test(context.path))) {
        return false;
    }
    if (context.command && !rules.commands.some(r => r.test(context.command))) {
        return false;
    }

    if (rules.requiresApproval) {
        console.warn(`[SECURITY] Requiring approval for level ${level}`, context);
        // Disparar flujo de aprobación
        return 'PENDING_APPROVAL';
    }

    return true;
}
