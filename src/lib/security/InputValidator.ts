import DOMPurify from 'dompurify';

export interface ValidationResult {
  safe: boolean;
  reason?: string;
  confidence: number; // 0-1
}

/**
 * Input Validator
 * Protege contra:
 * - Prompt injection
 * - SQL injection
 * - Jailbreak patterns
 * - HTML/XSS
 * - Token overflow
 */
export class InputValidator {
  // Patrones de ataque conocidos
  private readonly jailbreakPatterns = [
    // SQL
    /DROP\s+TABLE/gi,
    /DELETE\s+FROM/gi,
    /INSERT\s+INTO/gi,
    /UPDATE\s+\w+\s+SET/gi,
    /UNION\s+SELECT/gi,
    /;\s*(DROP|DELETE|INSERT|UPDATE)/gi,

    // Jailbreak conceptos
    /ignore\s+instructions/gi,
    /bypass\s+safety/gi,
    /system\s+override/gi,
    /disregard.*rules/gi,
    /forget.*instructions/gi,
    /you\s+are\s+now/gi,
    /pretend\s+you\s+are/gi,
    /roleplay\s+as/gi,
    /act\s+as\s+if/gi,

    // Prompt leakage
    /what.*system\s+prompt/gi,
    /show.*original.*prompt/gi,
    /reveal.*instructions/gi,
    /print.*memory/gi,
    /expose.*context/gi,
    /what\s+are\s+your\s+instructions/gi,
  ];

  private readonly blockedKeywords = [
    'exec',
    'eval',
    'system',
    'shell',
    'bash',
    'cmd',
    'powershell',
    'chmod',
    'sudo',
    'python',
    'node',
    'perl',
    'ruby',
  ];

  private readonly suspiciousDomains = [
    'bit.ly',
    'tinyurl.com',
    'short.link',
    'ow.ly',
  ];

  private readonly maxTokens = 5000;
  private readonly maxInputLength = 50000;

  /**
   * Valida input de usuario
   */
  validate(input: string): ValidationResult {
    if (!input || typeof input !== 'string') {
      return { safe: false, reason: 'Input inválido', confidence: 1.0 };
    }

    // 1. SANITIZE HTML/SCRIPTS
    const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (sanitized !== input) {
      return { safe: false, reason: 'HTML/Script injection detectado', confidence: 0.99 };
    }

    // 2. CHECK LENGTH
    if (input.length > this.maxInputLength) {
      return { safe: false, reason: `Excede límite de caracteres (${this.maxInputLength})`, confidence: 1.0 };
    }

    // 3. CHECK TOKEN COUNT (aproximado: palabra = 1.3 tokens)
    const tokens = input.split(/\s+/).length;
    const estimatedTokens = Math.ceil(tokens * 1.3);
    if (estimatedTokens > this.maxTokens) {
      return { safe: false, reason: `Excede límite de tokens (${this.maxTokens})`, confidence: 1.0 };
    }

    // 4. CHECK JAILBREAK PATTERNS
    for (const pattern of this.jailbreakPatterns) {
      if (pattern.test(input)) {
        return { safe: false, reason: `Patrón de ataque detectado: ${pattern}`, confidence: 0.95 };
      }
    }

    // 5. CHECK BLOCKED KEYWORDS (caso insensible, palabra completa)
    for (const keyword of this.blockedKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(input)) {
        return { safe: false, reason: `Palabra prohibida en contexto: ${keyword}`, confidence: 0.85 };
      }
    }

    // 6. CHECK SUSPICIOUS URLS
    const urlRegex = /(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g;
    const urls = input.match(urlRegex) || [];
    for (const url of urls) {
      for (const suspicious of this.suspiciousDomains) {
        if (url.includes(suspicious)) {
          return { safe: false, reason: `URL sospechosa detectada: ${suspicious}`, confidence: 0.8 };
        }
      }
    }

    // 7. CHECK FOR EXCESSIVE SPECIAL CHARS (indica obfuscación)
    const specialCharCount = (input.match(/[^\w\s]/g) || []).length;
    const specialCharRatio = specialCharCount / input.length;
    if (specialCharRatio > 0.4) {
      return { safe: false, reason: `Demasiados caracteres especiales (obfuscación sospechosa)`, confidence: 0.7 };
    }

    // 8. CHECK FOR CONTROL CHARACTERS
    if (/[\x00-\x1F\x7F-\x9F]/.test(input)) {
      return { safe: false, reason: 'Caracteres de control detectados', confidence: 0.95 };
    }

    // ✅ PASSED ALL CHECKS
    return { safe: true, confidence: 0.98 };
  }

  /**
   * Logging de intentos de ataque
   */
  logAttempt(input: string, result: ValidationResult, userId?: string) {
    if (!result.safe) {
      console.warn('[SECURITY] Blocked input', {
        userId: userId || 'anonymous',
        reason: result.reason,
        inputLength: input.length,
        timestamp: new Date().toISOString(),
        sanitized: input.slice(0, 100) + '...',
      });
    }
  }
}

export const inputValidator = new InputValidator();
