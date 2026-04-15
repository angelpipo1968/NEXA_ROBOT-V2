/**
 * WritingTemplate - Templates for the ModernStudio writing system
 */
export interface WritingTemplate {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    genre: string;
    iconClass?: string;
    chapters: number;
    time: string;
    structure: string[];
    characters: string[];
    tips: string;
}

export const WRITING_TEMPLATES: WritingTemplate[] = [
    {
        id: 'fantasy-novel',
        title: 'Novela de Fantasía',
        subtitle: 'Un mundo épico de magia y aventura',
        description: 'Crea una historia de fantasía con construcción de mundo detallada, sistemas de magia y un viaje heroico.',
        genre: 'Fantasía',
        iconClass: 'fas fa-hat-wizard',
        chapters: 20,
        time: '6 meses',
        structure: [
            'Prólogo: El mundo antes del caos',
            'Acto I: El llamado del destino (Caps 1-5)',
            'Acto II: El viaje y las pruebas (Caps 6-14)',
            'Acto III: La batalla final (Caps 15-20)'
        ],
        characters: [
            'Protagonista: El héroe elegido',
            'Mentor: Sabio guía misterioso',
            'Antagonista: Señor oscuro',
            'Compañero: Aliado leal'
        ],
        tips: 'Construye tu sistema de magia con reglas claras. Los mundos creíbles tienen limitaciones, no solo poderes.'
    },
    {
        id: 'thriller',
        title: 'Thriller Psicológico',
        subtitle: 'Suspenso que atrapa desde la primera página',
        description: 'Una historia de suspense con giros inesperados y tensión psicológica constante.',
        genre: 'Thriller',
        iconClass: 'fas fa-skull',
        chapters: 15,
        time: '4 meses',
        structure: [
            'Acto I: El incidente detonante (Caps 1-3)',
            'Acto II: La investigación (Caps 4-10)',
            'Acto III: La revelación (Caps 11-15)'
        ],
        characters: [
            'Protagonista: Detective o víctima',
            'Sospechoso: Personaje ambiguo',
            'Antagonista: Mente criminal',
            'Aliado: Compañero inesperado'
        ],
        tips: 'Planta pistas falsas (red herrings) para mantener al lector adivinando. El mejor giro es el que el lector no ve venir pero que tiene perfecto sentido en retrospectiva.'
    },
    {
        id: 'romance',
        title: 'Romance Contemporáneo',
        subtitle: 'Una historia de amor moderna y emotiva',
        description: 'Desarrolla una relación romántica convincente con personajes complejos y emociones auténticas.',
        genre: 'Romance',
        iconClass: 'fas fa-heart',
        chapters: 18,
        time: '4 meses',
        structure: [
            'Acto I: El encuentro (Caps 1-4)',
            'Acto II: Atracción y conflicto (Caps 5-12)',
            'Acto III: Separación y reconciliación (Caps 13-18)'
        ],
        characters: [
            'Protagonista A: Personaje principal',
            'Protagonista B: Interés romántico',
            'Mejor amigo/a: Confidente',
            'Obstáculo: Ex o rival'
        ],
        tips: 'La química entre personajes se construye con diálogos naturales y momentos de vulnerabilidad compartida.'
    },
    {
        id: 'scifi',
        title: 'Ciencia Ficción',
        subtitle: 'El futuro está en tus manos',
        description: 'Explora conceptos científicos y tecnológicos en una narrativa que desafía los límites de la imaginación.',
        genre: 'Sci-Fi',
        iconClass: 'fas fa-rocket',
        chapters: 22,
        time: '7 meses',
        structure: [
            'Acto I: El mundo del mañana (Caps 1-5)',
            'Acto II: El descubrimiento (Caps 6-15)',
            'Acto III: Las consecuencias (Caps 16-22)'
        ],
        characters: [
            'Protagonista: Científico o explorador',
            'IA/Compañero: Entidad tecnológica',
            'Antagonista: Corporación o amenaza alien',
            'Mentor: Figura del viejo mundo'
        ],
        tips: 'La mejor ciencia ficción usa la tecnología como espejo de la humanidad. La pregunta no es "¿qué puede hacer la tecnología?" sino "¿qué nos hace a nosotros?"'
    }
];
