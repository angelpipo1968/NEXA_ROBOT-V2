
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';

export class NexaAIService {
    private genAI: GoogleGenerativeAI;
    private braveApiKey: string;
    private googleCseApiKey: string;
    private googleCseId: string;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.braveApiKey = process.env.BRAVE_API_KEY || '';
        this.googleCseApiKey = process.env.GOOGLE_CSE_API_KEY || '';
        this.googleCseId = process.env.GOOGLE_CSE_ID || '';
    }

    // =====================
    // 1. GENERACIÓN CREATIVA
    // =====================

    async generarIdeas(texto: string, tipo: 'ideas' | 'personajes' | 'trama' | 'general' = 'general') {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API Key missing");
            return [];
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompts: Record<string, string> = {
                ideas: `Como asistente creativo literario, genera 5 ideas originales para expandir este texto:
          
          TEXTO: "${texto}"
          
          Formato de respuesta:
          1. [Título de la idea]
          2. [Desarrollo breve]
          3. [Beneficio para la historia]
          
          Sé específico y creativo.`,

                personajes: `Analiza los personajes implícitos y sugiere desarrollo:
          
          TEXTO: "${texto}"
          
          Sugiere para cada personaje detectado:
          - Arco de desarrollo posible
          - Conflicto interno/externo
          - Relaciones a explorar`,

                trama: `Propón desarrollos de trama para este segmento:
          
          TEXTO: "${texto}"
          
          Considera:
          - Giro argumental sorprendente
          - Subtrama interesante
          - Tensión dramática
          - Resolución satisfactoria`
            };

            const prompt = prompts[tipo] || prompts.ideas;
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return this.formatearIdeas(response.text(), tipo);
        } catch (error) {
            console.error("Gemini Error:", error);
            return [];
        }
    }

    // =====================
    // 2. INVESTIGACIÓN CON BRAVE
    // =====================

    async investigarContexto(consulta: string, tipoConsulta: string = 'general') {
        if (!this.braveApiKey) return [];

        try {
            const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(consulta)}&count=8`;

            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Subscription-Token': this.braveApiKey
                }
            });

            const resultados = response.data.web?.results || [];

            return resultados.map((result: any) => ({
                titulo: result.title,
                url: result.url,
                descripcion: result.description,
                relevancia: this.calcularRelevancia(result.description, consulta),
                categoria: this.clasificarResultado(result.description),
                utilidad: this.sugerirUtilidad(result.description, tipoConsulta),
                tipo: 'investigacion' // Helper for UI
            })).sort((a: any, b: any) => b.relevancia - a.relevancia).slice(0, 5);

        } catch (error) {
            console.error("Error en búsqueda Brave:", error);
            return [];
        }
    }

    // =====================
    // 3. BÚSQUEDA DE IMÁGENES REFERENCIA
    // =====================

    async buscarImagenesInspiracion(termino: string, contextoLibro: string = '') {
        if (!this.googleCseApiKey || !this.googleCseId) return [];

        try {
            const query = `${termino} ${contextoLibro} inspiración artística referencia visual`;
            const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleCseApiKey}&cx=${this.googleCseId}&q=${encodeURIComponent(query)}&searchType=image&num=8&imgSize=medium`;

            const response = await axios.get(url);
            const items = response.data.items || [];

            return items.map((item: any) => ({
                url: item.link,
                thumbnail: item.image?.thumbnailLink,
                titulo: item.title || termino,
                contexto: item.snippet?.substring(0, 150) + '...',
                estilo: this.detectarEstiloVisual(item.link),
                utilidad: "Para descripciones de ambiente, personajes o escenarios",
                tipo: 'imagenes', // Helper for UI
                imageUrl: item.link // Normalized for UI
            }));

        } catch (error) {
            console.error("Error en búsqueda de imágenes:", error);
            return [];
        }
    }

    // =====================
    // 4. ASISTENTE COMPLETO "EXPANDIR"
    // =====================

    async asistenteExpandirCompleto(textoSeleccionado: string, opciones: any = {}) {
        const {
            incluirIdeas = true,
            incluirInvestigacion = true,
            incluirImagenes = false,
            genero = 'general',
            tono = 'neutral'
        } = opciones;

        // Use parallel execution where possible
        const promises: Promise<any>[] = [];

        if (incluirIdeas) {
            promises.push(this.generarIdeas(textoSeleccionado, 'ideas').then(res => ({ type: 'ideas', data: res })));
            promises.push(this.generarIdeas(textoSeleccionado, 'personajes').then(res => ({ type: 'personajes', data: res })));
            promises.push(this.generarIdeas(textoSeleccionado, 'trama').then(res => ({ type: 'trama', data: res })));
        }

        if (incluirInvestigacion) {
            const terminosClave = this.extraerTerminosClave(textoSeleccionado);
            if (terminosClave.length > 0) {
                promises.push(this.investigarContexto(terminosClave[0], genero).then(res => ({ type: 'investigacion', data: res })));
            }
        }

        if (incluirImagenes) {
            const terminosVisuales = this.extraerTerminosVisuales(textoSeleccionado);
            if (terminosVisuales.length > 0) {
                promises.push(this.buscarImagenesInspiracion(terminosVisuales[0], genero).then(res => ({ type: 'imagenes', data: res })));
            }
        }

        const results = await Promise.all(promises);

        // Flatten results into a single suggestions array for the UI
        let allSuggestions: any[] = [];
        results.forEach(r => {
            if (r.data) allSuggestions = allSuggestions.concat(r.data);
        });

        return allSuggestions;
    }

    // =====================
    // MÉTODOS AUXILIARES
    // =====================

    public extraerTerminosClave(texto: string) {
        const palabrasComunes = new Set(['el', 'la', 'los', 'las', 'de', 'en', 'y', 'que', 'se', 'un', 'una', 'con', 'por', 'para']);
        const palabras = texto.toLowerCase()
            .replace(/[^\w\sáéíóú]/g, '')
            .split(/\s+/)
            .filter(palabra =>
                palabra.length > 4 &&
                !palabrasComunes.has(palabra) &&
                !/\d/.test(palabra)
            );

        const frecuencia: Record<string, number> = {};
        palabras.forEach(palabra => {
            frecuencia[palabra] = (frecuencia[palabra] || 0) + 1;
        });

        return Object.entries(frecuencia)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([palabra]) => palabra);
    }

    private formatearIdeas(textoRespuesta: string, tipo: string) {
        const lineas = textoRespuesta.split('\n').filter(l => l.trim());
        const ideas: any[] = [];
        let ideaActual: any = { titulo: '', contenido: [], tipo };

        lineas.forEach(linea => {
            const matchNumero = linea.match(/^(\d+)[\.\)]\s*(.+)/);
            const matchGuion = linea.match(/^[-•]\s*(.+)/);
            const matchBold = linea.match(/^\*\*(.+)\*\*/);

            if (matchNumero) {
                if (ideaActual.titulo) {
                    ideaActual.contenido = ideaActual.contenido.join(' ');
                    ideas.push({ ...ideaActual });
                }
                ideaActual = {
                    titulo: matchNumero[2].replace(/\*\*/g, ''),
                    contenido: [],
                    tipo,
                    id: `idea_${Date.now()}_${ideas.length}`
                };
            } else if (matchGuion) {
                ideaActual.contenido.push(matchGuion[1]);
            } else if (matchBold && !ideaActual.titulo) {
                // Handle cases where numbering might be missing but bold titles exist
                if (ideaActual.titulo) {
                    ideaActual.contenido = ideaActual.contenido.join(' ');
                    ideas.push({ ...ideaActual });
                }
                ideaActual = {
                    titulo: matchBold[1],
                    contenido: [],
                    tipo,
                    id: `idea_${Date.now()}_${ideas.length}`
                }
            } else if (linea.trim() && !linea.toLowerCase().includes('texto:') && ideaActual.titulo) {
                ideaActual.contenido.push(linea.trim());
            }
        });

        if (ideaActual.titulo) {
            ideaActual.contenido = typeof ideaActual.contenido === 'string' ? ideaActual.contenido : ideaActual.contenido.join(' ');
            ideas.push(ideaActual);
        }
        return ideas.slice(0, 5);
    }

    private calcularRelevancia(descripcion: string, consulta: string) {
        const palabrasConsulta = consulta.toLowerCase().split(' ');
        const palabrasDesc = descripcion.toLowerCase();

        let coincidencias = 0;
        palabrasConsulta.forEach(palabra => {
            if (palabrasDesc.includes(palabra) && palabra.length > 3) {
                coincidencias++;
            }
        });

        return (coincidencias / palabrasConsulta.length) * 100;
    }

    private clasificarResultado(descripcion: string) {
        const lowerDesc = descripcion.toLowerCase();

        if (lowerDesc.includes('historia') || lowerDesc.includes('histórico')) return 'histórico';
        if (lowerDesc.includes('científico') || lowerDesc.includes('estudio')) return 'científico';
        if (lowerDesc.includes('cultural') || lowerDesc.includes('tradición')) return 'cultural';
        if (lowerDesc.includes('artículo') || lowerDesc.includes('noticia')) return 'actualidad';

        return 'general';
    }

    private sugerirUtilidad(descripcion: string, tipoConsulta: string) {
        const utilidades: Record<string, string> = {
            novela: "Para autenticidad en ambientación histórica",
            fantasia: "Inspiración para worldbuilding y criaturas",
            scifi: "Base científica para tecnología futurista",
            misterio: "Casos reales para complejidad de trama",
            romance: "Contexto social y emocional"
        };

        return utilidades[tipoConsulta] || "Contexto para enriquecer la narrativa";
    }

    private detectarEstiloVisual(url: string) {
        if (url.includes('pintura') || url.includes('painting')) return 'pintura';
        if (url.includes('fotografía') || url.includes('photo')) return 'fotografía';
        if (url.includes('ilustración') || url.includes('illustration')) return 'ilustración';
        if (url.includes('digital') || url.includes('concept')) return 'arte digital';
        return 'desconocido';
    }

    public extraerTerminosVisuales(texto: string) {
        const terminosVisuales = ['montaña', 'río', 'ciudad', 'bosque', 'castillo', 'nave', 'rostro', 'edificio', 'paisaje', 'interior', 'habitación', 'cielo', 'mar', 'fuego', 'noche', 'luz'];
        return this.extraerTerminosClave(texto).filter(termino =>
            terminosVisuales.some(visual => termino.includes(visual) || visual.includes(termino))
        );
    }
}
