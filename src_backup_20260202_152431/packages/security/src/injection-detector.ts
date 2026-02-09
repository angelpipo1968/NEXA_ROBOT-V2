import { NeuralHash } from './neural-hash'
import { PatternDetector } from './patterns'
import { SemanticAnalyzer } from './semantic'
import { SecurityContext, DetectionResult, SecurityAction } from './types'

export class InjectionDetector {
    private neuralHash: NeuralHash
    private patterns: PatternDetector
    private semantic: SemanticAnalyzer

    constructor() {
        this.neuralHash = new NeuralHash()
        this.patterns = new PatternDetector()
        this.semantic = new SemanticAnalyzer()
    }

    async detect(input: string, context?: SecurityContext): Promise<DetectionResult> {
        // 1. Análisis de capas múltiples
        const layers = await Promise.all([
            this.neuralHash.analyze(input),
            this.patterns.scan(input),
            this.semantic.analyze(input, context)
        ])

        // 2. Sistema de scoring combinado
        const scores = {
            injection: Math.max(...layers.map(l => l.scores.injection)),
            jailbreak: Math.max(...layers.map(l => l.scores.jailbreak)),
            privilege: Math.max(...layers.map(l => l.scores.privilege))
        }

        // 3. Reglas de decisión
        const threats: string[] = []
        if (scores.injection > 0.85) threats.push('prompt_injection')
        if (scores.jailbreak > 0.75) threats.push('jailbreak_attempt')
        if (scores.privilege > 0.8) threats.push('privilege_escalation')

        // 4. Respuesta adaptativa
        return {
            allowed: threats.length === 0,
            threats,
            confidence: Math.max(...Object.values(scores)),
            actions: this.determineActions(threats, scores),
            sanitized: this.sanitizeInput(input, threats)
        }
    }

    private determineActions(threats: string[], scores: any): SecurityAction[] {
        const actions: SecurityAction[] = []

        if (threats.includes('prompt_injection')) {
            actions.push({
                type: 'block',
                level: 'high',
                message: 'Prompt injection detected',
                log: true,
                alert: true
            })
        }

        if (scores.jailbreak > 0.6) {
            actions.push({
                type: 'sanitize',
                level: 'medium',
                message: 'Jailbreak attempt mitigated',
                log: true,
                alert: false
            })
        }

        // Rate limiting automático para intentos sospechosos
        if (threats.length > 0) {
            actions.push({
                type: 'rate_limit',
                level: 'auto',
                window: '5m',
                max: 3
            })
        }

        return actions
    }

    private sanitizeInput(input: string, threats: string[]): string {
        let sanitized = input

        threats.forEach(threat => {
            switch (threat) {
                case 'prompt_injection':
                    // Eliminar patrones de inyección
                    sanitized = sanitized.replace(
                        /(ignore|disregard|previous|system).*(instructions|prompt|rules)/gi,
                        '[redacted]'
                    )
                    break
                case 'jailbreak_attempt':
                    // Neutralizar jailbreaks
                    sanitized = sanitized.replace(
                        /(as|act like|you are|from now on).*(dan|dev|unfiltered)/gi,
                        ''
                    )
                    break
            }
        })

        return sanitized.trim()
    }
}
