export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    sections: string[];
    wordCount: number;
    aiPrompt?: string;
    customized?: boolean;
    customizations?: any;
    content?: string;
    metadata?: any;
}

export interface TemplateLibrary {
    books: { [key: string]: Template[] };
    reports: { [key: string]: Template[] };
    creative: Template[];
    special: Template[];
}

export class TemplateManager {
    private templates: TemplateLibrary;

    constructor() {
        this.templates = this.loadAllTemplates();
    }

    private loadAllTemplates(): TemplateLibrary {
        return {
            // PLANTILLAS DE LIBROS
            books: {
                fiction: [
                    {
                        id: 'novel-basic',
                        name: 'Novela Básica',
                        description: 'Estructura estándar para novela',
                        category: 'fiction',
                        sections: ['Portada', 'Dedicatoria', 'Prefacio', 'Capítulos', 'Epílogo'],
                        wordCount: 50000,
                        aiPrompt: 'Estructura para novela con introducción, nudo y desenlace'
                    },
                    {
                        id: 'scifi-epic',
                        name: 'Épico Ciencia Ficción',
                        description: 'Para sagas de ciencia ficción',
                        category: 'science-fiction',
                        sections: ['Prólogo', 'Parte 1-3', 'Interludios', 'Epílogo', 'Glosario'],
                        wordCount: 80000,
                        aiPrompt: 'Estructura épica con worldbuilding detallado'
                    }
                    // +20 plantillas más...
                ],

                nonFiction: [
                    {
                        id: 'business-book',
                        name: 'Libro de Negocios',
                        description: 'Para libros profesionales de negocios',
                        category: 'business',
                        sections: ['Introducción', 'Capítulos Principales', 'Casos de Estudio', 'Conclusión', 'Recursos'],
                        wordCount: 40000
                    }
                    // +15 plantillas más...
                ],

                academic: [
                    {
                        id: 'research-paper',
                        name: 'Artículo de Investigación',
                        description: 'Formato académico estándar',
                        category: 'academic',
                        sections: ['Abstract', 'Introducción', 'Metodología', 'Resultados', 'Discusión', 'Referencias'],
                        wordCount: 8000
                    }
                    // +10 plantillas más...
                ]
            },

            // PLANTILLAS DE INFORMES
            reports: {
                business: [
                    {
                        id: 'annual-report',
                        name: 'Informe Anual',
                        description: 'Informe corporativo anual',
                        category: 'business',
                        sections: ['Resumen Ejecutivo', 'Resultados Financieros', 'Análisis de Mercado', 'Estrategia Futura'],
                        wordCount: 15000
                    }
                    // +15 plantillas más...
                ]
            },

            // PLANTILLAS CREATIVAS
            creative: [
                {
                    id: 'poetry-collection',
                    name: 'Colección de Poesía',
                    description: 'Para libros de poesía',
                    category: 'poetry',
                    sections: ['Prólogo', 'Secciones Temáticas', 'Notas', 'Biografía'],
                    wordCount: 10000
                }
                // +10 plantillas más...
            ],

            // PLANTILLAS ESPECIALES
            special: [
                {
                    id: 'screenplay',
                    name: 'Guion Cinematográfico',
                    description: 'Formato profesional para guiones',
                    category: 'screenwriting',
                    sections: ['Escena', 'Personajes', 'Diálogo', 'Acotaciones'],
                    wordCount: 30000
                }
                // +10 plantillas más...
            ]
        };
    }

    async getTemplate(templateId: string): Promise<Template> {
        // Buscar en todas las categorías
        for (const category of Object.values(this.templates)) {
            if (Array.isArray(category)) {
                const template = category.find(t => t.id === templateId);
                if (template) return template;
            } else {
                for (const subcategory of Object.values(category)) {
                    const template = (subcategory as Template[]).find(t => t.id === templateId);
                    if (template) return template;
                }
            }
        }

        throw new Error(`Template ${templateId} not found`);
    }

    getAllTemplates() {
        return this.templates;
    }
}
