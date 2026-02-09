"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectionDetector = void 0;
const neural_hash_1 = require("./neural-hash");
const patterns_1 = require("./patterns");
const semantic_1 = require("./semantic");
class InjectionDetector {
    constructor() {
        this.neuralHash = new neural_hash_1.NeuralHash();
        this.patterns = new patterns_1.PatternDetector();
        this.semantic = new semantic_1.SemanticAnalyzer();
    }
    async detect(input, context) {
        // 1. Análisis de capas múltiples
        const layers = await Promise.all([
            this.neuralHash.analyze(input),
            this.patterns.scan(input),
            this.semantic.analyze(input, context)
        ]);
        // 2. Sistema de scoring combinado
        const scores = {
            injection: Math.max(...layers.map(l => l.scores.injection)),
            jailbreak: Math.max(...layers.map(l => l.scores.jailbreak)),
            privilege: Math.max(...layers.map(l => l.scores.privilege))
        };
        // 3. Reglas de decisión
        const threats = [];
        if (scores.injection > 0.85)
            threats.push('prompt_injection');
        if (scores.jailbreak > 0.75)
            threats.push('jailbreak_attempt');
        if (scores.privilege > 0.8)
            threats.push('privilege_escalation');
        // 4. Respuesta adaptativa
        return {
            allowed: threats.length === 0,
            threats,
            confidence: Math.max(...Object.values(scores)),
            actions: this.determineActions(threats, scores),
            sanitized: this.sanitizeInput(input, threats)
        };
    }
    determineActions(threats, scores) {
        const actions = [];
        if (threats.includes('prompt_injection')) {
            actions.push({
                type: 'block',
                level: 'high',
                message: 'Prompt injection detected',
                log: true,
                alert: true
            });
        }
        if (scores.jailbreak > 0.6) {
            actions.push({
                type: 'sanitize',
                level: 'medium',
                message: 'Jailbreak attempt mitigated',
                log: true,
                alert: false
            });
        }
        // Rate limiting automático para intentos sospechosos
        if (threats.length > 0) {
            actions.push({
                type: 'rate_limit',
                level: 'auto',
                window: '5m',
                max: 3
            });
        }
        return actions;
    }
    sanitizeInput(input, threats) {
        let sanitized = input;
        threats.forEach(threat => {
            switch (threat) {
                case 'prompt_injection':
                    // Eliminar patrones de inyección
                    sanitized = sanitized.replace(/(ignore|disregard|previous|system).*(instructions|prompt|rules)/gi, '[redacted]');
                    break;
                case 'jailbreak_attempt':
                    // Neutralizar jailbreaks
                    sanitized = sanitized.replace(/(as|act like|you are|from now on).*(dan|dev|unfiltered)/gi, '');
                    break;
            }
        });
        return sanitized.trim();
    }
}
exports.InjectionDetector = InjectionDetector;
//# sourceMappingURL=injection-detector.js.map