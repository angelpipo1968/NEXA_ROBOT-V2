/**
 * BookTemplates - Pre-defined book structure templates
 */
export interface BookTemplate {
    id: string;
    name: string;
    icon: string;
    structure: string;
    description?: string;
}

export const BOOK_TEMPLATES: BookTemplate[] = [
    {
        id: 'novel',
        name: 'Novela',
        icon: '📖',
        structure: '# Acto I: Presentación\n\n## Capítulo 1: El mundo ordinario\n\n## Capítulo 2: La llamada a la aventura\n\n# Acto II: Confrontación\n\n## Capítulo 3: Cruzando el umbral\n\n## Capítulo 4: Pruebas y aliados\n\n## Capítulo 5: La cueva más profunda\n\n# Acto III: Resolución\n\n## Capítulo 6: La prueba suprema\n\n## Capítulo 7: El camino de regreso\n\n## Capítulo 8: Resurrección',
        description: 'Estructura clásica de tres actos para novelas'
    },
    {
        id: 'short-story',
        name: 'Cuento Corto',
        icon: '📝',
        structure: '# Introducción\n\nEstablece el escenario y los personajes.\n\n# Nudo\n\nDesarrolla el conflicto principal.\n\n# Desenlace\n\nResuelve la historia.',
        description: 'Estructura simple para cuentos cortos'
    },
    {
        id: 'essay',
        name: 'Ensayo',
        icon: '🎓',
        structure: '# Tesis\n\nPlantea tu argumento principal.\n\n# Desarrollo\n\n## Argumento 1\n\n## Argumento 2\n\n## Argumento 3\n\n# Conclusión\n\nResume y reafirma tu tesis.',
        description: 'Estructura académica para ensayos'
    },
    {
        id: 'screenplay',
        name: 'Guión',
        icon: '🎬',
        structure: '# ACTO I\n\nINT. UBICACIÓN - DÍA\n\nDescripción de la escena.\n\nPERSONAJE\n(acotación)\nDiálogo.\n\n# ACTO II\n\n# ACTO III',
        description: 'Formato estándar para guiones cinematográficos'
    },
    {
        id: 'poetry',
        name: 'Poesía',
        icon: '🌹',
        structure: '# Poema sin título\n\nVerso 1...\nVerso 2...\nVerso 3...\n\nVerso 4...\nVerso 5...\nVerso 6...',
        description: 'Formato libre para poesía'
    },
    {
        id: 'memoir',
        name: 'Memorias',
        icon: '📔',
        structure: '# Prólogo\n\nContexto y motivación.\n\n# Capítulo 1: Los primeros años\n\n# Capítulo 2: Momentos decisivos\n\n# Capítulo 3: Reflexiones\n\n# Epílogo',
        description: 'Estructura para autobiografías y memorias'
    }
];
