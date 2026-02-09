export interface BookTemplate {
    id: string;
    name: string;
    description: string;
    structure: string;
    icon: string;
}

export const BOOK_TEMPLATES: BookTemplate[] = [
    {
        id: 'novel',
        name: 'Novela de Ficción',
        description: 'Estructura clásica en tres actos para narrativas cautivadoras.',
        icon: '📚',
        structure: `# Título de la Novela\n\n## Acto I: El Planteamiento\n- Introducción de personajes\n- El incidente incitante\n\n## Acto II: El Nudo\n- Desarrollo del conflicto\n- Punto de no retorno\n\n## Acto III: El Desenlace\n- Clímax\n- Resolución`
    },
    {
        id: 'biography',
        name: 'Biografía / Memoria',
        description: 'Cronología de una vida, desde los orígenes hasta el legado.',
        icon: '👤',
        structure: `# Biografía de [Nombre]\n\n## Infancia y Orígenes\n## Años de Formación\n## Hitos y Logros\n## Desafíos Superados\n## Legado y Reflexiones`
    },
    {
        id: 'essay',
        name: 'Ensayo / No Ficción',
        description: 'Ideal para libros técnicos, de autoayuda o investigación.',
        icon: '💡',
        structure: `# Título del Libro\n\n## Introducción\n- Tesis principal\n- Por qué este libro es importante\n\n## Capítulos Temáticos\n- Concepto 1\n- Concepto 2\n\n## Conclusión y Aplicación Práctica`
    },
    {
        id: 'script',
        name: 'Guion Cinematográfico',
        description: 'Formato estándar para cine y televisión.',
        icon: '🎬',
        structure: `ESC. 1 - INTERIOR - DÍA\n\n[PERSONAJE]\n(emocionado)\n¡Esta es la gran revelación!`
    },
    {
        id: 'visionary',
        name: 'Novela Visionaria',
        description: 'Enfoque en mundos profundos, realismo mágico y descripciones vívidas.',
        icon: '✨',
        structure: `# El Umbral de lo Invisible\n\n## Prólogo: El Susurro del Bosque\n(Aquí el autor debe enfocarse en la fluidez sensorial...)\n\n## Capítulo 1: La Anciana de los Tiempos\n- Encuentro en el claro del bosque\n- El realismo de las arrugas y la historia.`
    },
    {
        id: 'business',
        name: 'Libro Profesional / Negocios',
        description: 'Estructura analítica, elegante y directa para el mundo corporativo.',
        icon: '📊',
        structure: `# Estrategias de Vanguardia\n\n## Introducción: El Nuevo Paradigma\n## Capítulo 1: Análisis de Mercado\n## Capítulo 2: Ejecución Perfecta\n## Conclusiones Ejecutivas`
    }
];
