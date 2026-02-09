export interface WritingTemplate {
    id: number;
    title: string;
    subtitle: string;
    genre: string;
    // Map font-awesome icons to emojis or use a mapping component later
    // The user provided font-awesome classes e.g., "fas fa-dragon".
    // I will keep the className string for now and Render icons using a mapping or a generic Icon component if available,
    // or fall back to emoji mapping if FA is not installed.
    // Given the previous files used emojis, I might want to map these FA classes to emojis for consistency,
    // OR just use the class names if I can add FA.
    // Looking at the QuickStart.tsx, it uses emojis.
    // But the user requested "Professional", so maybe I should try to specific icons.
    // For now, let's store the FA class and I'll handle rendering in the component.
    iconClass: string;
    words: string;
    chapters: number;
    time: string;
    description: string;
    features: string[];
    structure: string[];
    characters: string[];
    tips: string;
}

export const WRITING_TEMPLATES: WritingTemplate[] = [
    {
        id: 1,
        title: "Novela de Fantasía Épica",
        subtitle: "Una aventura de magia, héroes y reinos perdidos",
        genre: "fantasia",
        iconClass: "fas fa-dragon",
        words: "80,000-120,000",
        chapters: 24,
        time: "6-9 meses",
        description: "Una plantilla completa para una novela de fantasía épica con worldbuilding detallado, sistema de magia y arcos de personajes complejos.",
        features: [
            "Worldbuilding completo con mapas y culturas",
            "Sistema de magia balanceado y único",
            "Arquetipos de personajes (héroe, mentor, villano)",
            "Estructura de 3 actos épica",
            "Guía para razas y criaturas fantásticas"
        ],
        structure: [
            "Acto I: El llamado a la aventura",
            "Cap. 1-4: Mundo ordinario y llamado",
            "Cap. 5-8: Rechazo y encuentro con mentor",
            "Cap. 9-12: Cruzando el umbral",
            "Acto II: Pruebas, aliados y enemigos",
            "Cap. 13-16: Pruebas y encuentro con aliados",
            "Cap. 17-20: Acercamiento a la caverna más profunda",
            "Cap. 21-24: Prueba suprema y recompensa",
            "Acto III: El camino de vuelta",
            "Cap. 25-28: Camino de vuelta y resurrección",
            "Cap. 29-32: Regreso con el elixir"
        ],
        characters: [
            "El héroe/protagonista con un vacío interno",
            "El mentor sabio pero imperfecto",
            "El villano con motivaciones comprensibles",
            "El aliado cómico o leal",
            "El interés amoroso con agencia propia",
            "El traidor con redención posible"
        ],
        tips: "Desarrolla primero tu sistema de magia y sus limitaciones. Crea culturas basadas en geografía y recursos. Los mejores villanos creen que son los héroes."
    },
    {
        id: 2,
        title: "Thriller Psicológico",
        subtitle: "Suspenso, giros y mentes fracturadas",
        genre: "misterio",
        iconClass: "fas fa-brain",
        words: "70,000-90,000",
        chapters: 28,
        time: "4-6 meses",
        description: "Para crear tensión constante, personajes no confiables y giros argumentales que mantengan al lector adivinando hasta la última página.",
        features: [
            "Estructura de tensión creciente",
            "Personajes narradores no confiables",
            "Pistas y foreshadowing sutil",
            "Giros argumentales impactantes",
            "Finales abiertos a interpretación"
        ],
        structure: [
            "Introducción: Establecer normalidad perturbada",
            "Cap. 1-3: Presentación del misterio principal",
            "Cap. 4-7: Primer giro y falsa solución",
            "Cap. 8-12: Profundización psicológica",
            "Cap. 13-16: Revelación de secretos ocultos",
            "Cap. 17-20: Punto de no retorno",
            "Cap. 21-24: Confrontación principal",
            "Cap. 25-28: Resolución y consecuencias"
        ],
        characters: [
            "Protagonista con un pasado oscuro",
            "Antagonista carismático pero peligroso",
            "Aliado que podría ser traidor",
            "Víctima con secretos propios",
            "Detective o investigador intuitivo",
            "Testigo que sabe más de lo que dice"
        ],
        tips: "Planta pistas desde el primer capítulo. Los mejores thrillers psicológicos exploran temas universales a través de situaciones extremas."
    },
    {
        id: 3,
        title: "Ciencia Ficción Hard",
        subtitle: "Tecnología plausible y especulación científica",
        genre: "ciencia-ficcion",
        iconClass: "fas fa-rocket",
        words: "90,000-130,000",
        chapters: 26,
        time: "9-12 meses",
        description: "Para historias basadas en ciencia real o extrapolaciones plausibles, con atención al detalle técnico y sus implicaciones sociales.",
        features: [
            "Investigación científica rigurosa",
            "Tecnología extrapolada de avances actuales",
            "Consecuencias sociales de descubrimientos",
            "Sistemas políticos futuros creíbles",
            "Ética tecnológica y dilemas morales"
        ],
        structure: [
            "Parte I: El descubrimiento",
            "Cap. 1-5: Establecimiento del statu quo",
            "Cap. 6-10: Descubrimiento científico",
            "Cap. 11-13: Implicaciones iniciales",
            "Parte II: Consecuencias",
            "Cap. 14-18: Respuesta social y política",
            "Cap. 19-22: Conflictos y aplicaciones",
            "Cap. 23-26: Resolución y nuevo paradigma"
        ],
        characters: [
            "Científico/investigador especializado",
            "Político o administrador pragmático",
            "Éticista o filósofo tecnológico",
            "Técnico o ingeniero práctico",
            "Skeptic o opositor al cambio",
            "Visionario que ve más allá"
        ],
        tips: "Investiga a fondo el campo científico que tratas. La tecnología debe afectar la sociedad de manera lógica y consistente."
    },
    {
        id: 4,
        title: "Romance Contemporáneo",
        subtitle: "Amor, conflictos y finales satisfactorios",
        genre: "novela",
        iconClass: "fas fa-heart",
        words: "60,000-80,000",
        chapters: 22,
        time: "3-5 meses",
        description: "Estructura probada para historias de amor con química entre personajes, obstáculos creíbles y desarrollo emocional.",
        features: [
            "Estructura de encuentro-conflicto-resolución",
            "Desarrollo de química entre personajes",
            "Obstáculos internos y externos",
            "Puntos de vista duales",
            "Finales emocionalmente satisfactorios"
        ],
        structure: [
            "Acto I: El encuentro",
            "Cap. 1-4: Presentación de protagonistas",
            "Cap. 5-7: Primer encuentro y atracción",
            "Cap. 8-10: Desarrollando conexión",
            "Acto II: El conflicto",
            "Cap. 11-13: Primer obstáculo",
            "Cap. 14-17: Desarrollando relación",
            "Cap. 18-20: Punto de quiebre",
            "Acto III: La resolución",
            "Cap. 21-22: Reconciliación y futuro"
        ],
        characters: [
            "Protagonista A con herida emocional",
            "Protagonista B que complementa/sana",
            "Amigo confidente o cómico",
            "Ex pareja o obstáculo romántico",
            "Familiar que apoya o se opone",
            "Tercero en discordia opcional"
        ],
        tips: "La clave está en la química entre personajes. Los obstáculos deben ser significativos pero superables. El crecimiento personal es tan importante como la relación."
    },
    {
        id: 5,
        title: "Novela Histórica",
        subtitle: "Precisión histórica con narrativa emocional",
        genre: "novela",
        iconClass: "fas fa-landmark",
        words: "100,000-150,000",
        chapters: 32,
        time: "12-18 meses",
        description: "Combina investigación histórica rigurosa con personajes ficticios o históricos en períodos específicos, balanceando educación y entretenimiento.",
        features: [
            "Investigación histórica extensa",
            "Personajes históricos y ficticios integrados",
            "Lenguaje y detalles de época",
            "Eventos históricos como telón de fondo",
            "Notas del autor sobre licencias creativas"
        ],
        structure: [
            "Parte I: El mundo de ayer",
            "Cap. 1-6: Establecimiento de época y personajes",
            "Cap. 7-12: Vida cotidiana y conflictos iniciales",
            "Parte II: Tiempos de cambio",
            "Cap. 13-18: Eventos históricos afectan personajes",
            "Cap. 19-24: Conflictos personales e históricos",
            "Parte III: Legado",
            "Cap. 25-30: Resolución de arcos",
            "Cap. 31-32: Epílogo histórico"
        ],
        characters: [
            "Protagonista testigo de la historia",
            "Figura histórica con voz auténtica",
            "Antagonista representando la época",
            "Familiar que muestra costumbres",
            "Amigo de diferente clase social",
            "Mentor con sabiduría de época"
        ],
        tips: "Investiga primero, escribe después. Los personajes deben pensar como personas de su tiempo, no con mentalidad moderna. Los detalles pequeños crean autenticidad."
    },
    {
        id: 6,
        title: "Distopía Juvenil",
        subtitle: "Sociedades rotas y jóvenes rebeldes",
        genre: "ciencia-ficcion",
        iconClass: "fas fa-city",
        words: "70,000-90,000",
        chapters: 27,
        time: "5-7 meses",
        description: "Para crear sociedades futuras distópicas con sistemas de control, jóvenes que cuestionan el orden establecido y rebeliones que cambian el mundo.",
        features: [
            "Sistemas políticos distópicos detallados",
            "Tecnología de control y vigilancia",
            "Protagionista joven que cuestiona el sistema",
            "Grupos de resistencia y rebelión",
            "Temas de identidad y libertad"
        ],
        structure: [
            "Fase 1: La ilusión de utopía",
            "Cap. 1-5: Vida en el sistema",
            "Cap. 6-9: Primera grieta en la realidad",
            "Fase 2: El despertar",
            "Cap. 10-14: Descubriendo la verdad",
            "Cap. 15-18: Encuentro con la resistencia",
            "Fase 3: La rebelión",
            "Cap. 19-23: Planificación y acción",
            "Cap. 24-27: Confrontación y nuevo comienzo"
        ],
        characters: [
            "Protagonista joven insatisfecho",
            "Amigo leal o familiar en peligro",
            "Líder carismático de la resistencia",
            "Autoridad distópica con ideología",
            "Traidor o doble agente",
            "Mentor que conoce la verdad"
        ],
        tips: "La distopía debe reflejar problemas actuales exagerados. El sistema debe tener lógica interna. La rebelión debe tener costos reales."
    },
    {
        id: 7,
        title: "Misterio de Asesinato",
        subtitle: "Crímenes, pistas y detectives astutos",
        genre: "misterio",
        iconClass: "fas fa-search",
        words: "65,000-85,000",
        chapters: 25,
        time: "4-6 meses",
        description: "Estructura clásica de novela de misterio con crimen, investigación, sospechosos y revelación final que sorprende pero es justa.",
        features: [
            "Reglas del juego justo para el lector",
            "Pistas y foreshadowing medidos",
            "Sospechosos con motivos y oportunidades",
            "Detective con método único",
            "Escena de revelación satisfactoria"
        ],
        structure: [
            "Cap. 1-3: El crimen y presentación",
            "Cap. 4-8: Investigación inicial y sospechosos",
            "Cap. 9-13: Desarrollo de pistas",
            "Cap. 14-18: Giros y falsas pistas",
            "Cap. 19-22: Eliminación de sospechosos",
            "Cap. 23-25: Revelación y resolución"
        ],
        characters: [
            "Detective profesional o aficionado",
            "Víctima con vida secreta",
            "Sospechoso principal (falso culpable)",
            "Culpable real con buen alibi",
            "Ayudante o compañero",
            "Autoridad que obstaculiza"
        ],
        tips: "Planta todas las pistas necesarias para resolver el misterio. El culpable debe estar entre los personajes presentados. La solución debe sorprender pero ser lógica en retrospectiva."
    },
    {
        id: 8,
        title: "Realismo Mágico",
        subtitle: "Lo cotidiano mezclado con lo maravilloso",
        genre: "fantasia",
        iconClass: "fas fa-magic",
        words: "70,000-100,000",
        chapters: 24,
        time: "6-8 meses",
        description: "Para integrar elementos mágicos o fantásticos en un mundo realista, donde lo extraordinario se acepta como parte de la cotidianidad.",
        features: [
            "Elementos mágicos tratados como normales",
            "Ambientes realistas con toques fantásticos",
            "Temas sociales y políticos con lente mágico",
            "Personajes que aceptan lo sobrenatural",
            "Narrativa lírica y descriptiva"
        ],
        structure: [
            "Introducción: Mundo aparentemente normal",
            "Cap. 1-6: Elemento mágico introducido naturalmente",
            "Cap. 7-12: Desarrollo y aceptación",
            "Cap. 13-18: Conflictos y consecuencias",
            "Cap. 19-24: Integración y nueva normalidad"
        ],
        characters: [
            "Protagonista que experimenta lo mágico",
            "Familiar que normaliza lo extraordinario",
            "Vecino/comunidad que acepta",
            "Forastero que cuestiona",
            "Ser mágico integrado en sociedad",
            "Antagonista que teme el cambio"
        ],
        tips: "La magia no debe explicarse demasiado. Debe servir para explorar temas humanos. El tono debe ser de aceptación, no de asombro constante."
    },
    {
        id: 9,
        title: "Aventura de Viajes en el Tiempo",
        subtitle: "Pasado, presente y paradojas",
        genre: "ciencia-ficcion",
        iconClass: "fas fa-clock",
        words: "75,000-95,000",
        chapters: 26,
        time: "5-7 meses",
        description: "Explora las consecuencias de viajar en el tiempo, paradojas temporales y cómo pequeñas acciones pueden cambiar grandes eventos.",
        features: [
            "Reglas consistentes de viaje temporal",
            "Consecuencias de cambiar el pasado",
            "Paradojas lógicas y su resolución",
            "Diferentes líneas temporales",
            "Ética de la manipulación temporal"
        ],
        structure: [
            "Parte I: El descubrimiento",
            "Cap. 1-5: Vida normal y descubrimiento",
            "Cap. 6-9: Primeros viajes y reglas",
            "Parte II: Las consecuencias",
            "Cap. 10-15: Cambios no intencionados",
            "Cap. 16-20: Intentos de corrección",
            "Parte III: La resolución",
            "Cap. 21-26: Solución final y nuevo equilibrio"
        ],
        characters: [
            "Protagonista que viaja en el tiempo",
            "Científico/mentor que comprende las reglas",
            "Ser querido afectado por cambios",
            "Antagonista que abusa del poder",
            "Aliado en diferentes épocas",
            "Figura histórica encontrada"
        ],
        tips: "Establece reglas claras desde el principio y síguelas. Los cambios temporales deben tener consecuencias lógicas. Explora paradojas de manera consistente."
    },
    {
        id: 10,
        title: "Novela de Formación (Bildungsroman)",
        subtitle: "Crecimiento, aprendizaje y madurez",
        genre: "novela",
        iconClass: "fas fa-user-graduate",
        words: "80,000-110,000",
        chapters: 28,
        time: "6-9 meses",
        description: "Sigue el desarrollo moral y psicológico del protagonista desde la juventud hasta la madurez, a través de experiencias formativas.",
        features: [
            "Arco de crecimiento completo",
            "Experiencias formativas significativas",
            "Conflicto entre individualidad y sociedad",
            "Momentos clave de autodescubrimiento",
            "Reflexión sobre valores y creencias"
        ],
        structure: [
            "Infancia: Semillas del carácter",
            "Cap. 1-6: Contexto familiar y social",
            "Cap. 7-10: Primeras experiencias formativas",
            "Adolescencia: Búsqueda de identidad",
            "Cap. 11-16: Conflictos y rebelión",
            "Cap. 17-20: Primeras responsabilidades",
            "Madurez: Integración y sabiduría",
            "Cap. 21-28: Aceptación y legado"
        ],
        characters: [
            "Protagonista en desarrollo",
            "Familiar que representa tradición",
            "Amigo que influye en el camino",
            "Mentor que guía el crecimiento",
            "Amor que desafía o confirma",
            "Figura que representa lo rechazado"
        ],
        tips: "El cambio debe ser gradual y creíble. Cada experiencia debe contribuir al crecimiento. El final debe mostrar madurez ganada, no impuesta."
    },
    {
        id: 11,
        title: "Space Opera",
        subtitle: "Épica interestelar con conflictos galácticos",
        genre: "ciencia-ficcion",
        iconClass: "fas fa-star",
        words: "120,000-180,000",
        chapters: 35,
        time: "12-18 meses",
        description: "Grandes escalas, imperios galácticos, razas alienígenas y conflictos que abarcan sistemas estelares, con énfasis en personajes en medio de eventos épicos.",
        features: [
            "Worldbuilding a escala galáctica",
            "Sistemas políticos interestelares",
            "Razas alienígenas únicas y creíbles",
            "Tecnología avanzada pero comprensible",
            "Temas de imperialismo y libertad"
        ],
        structure: [
            "Libro I: La amenaza emergente",
            "Cap. 1-8: Establecimiento del universo",
            "Cap. 9-15: Primer conflicto",
            "Libro II: La guerra galáctica",
            "Cap. 16-24: Escalada y batallas",
            "Cap. 25-30: Punto de inflexión",
            "Libro III: Resolución y nuevo orden",
            "Cap. 31-35: Conclusión y legado"
        ],
        characters: [
            "Héroe de humilde origen",
            "Comandante militar estratega",
            "Político idealista o pragmático",
            "Alienígena con cultura única",
            "Ingeniero/tecnólogo creativo",
            "Espía o diplomático astuto"
        ],
        tips: "Equilibra escala épica con momentos personales. Las culturas alienígenas deben ser consistentes. La tecnología debe servir a la historia, no dominarla."
    },
    {
        id: 12,
        title: "No Ficción Creativa",
        subtitle: "Hechos reales con narrativa literaria",
        genre: "no-ficcion",
        iconClass: "fas fa-pen-fancy",
        words: "50,000-80,000",
        chapters: 20,
        time: "4-8 meses",
        description: "Para contar historias reales usando técnicas narrativas de ficción, manteniendo veracidad mientras se crea una experiencia de lectura envolvente.",
        features: [
            "Investigación rigurosa y verificación",
            "Estructura narrativa atractiva",
            "Desarrollo de personajes reales",
            "Diálogos reconstruidos respetuosamente",
            "Notas sobre fuentes y métodos"
        ],
        structure: [
            "Introducción: Presentación del tema",
            "Cap. 1-4: Contexto histórico/social",
            "Cap. 5-9: Desarrollo de la historia principal",
            "Cap. 10-14: Conflictos y desafíos",
            "Cap. 15-18: Clímax y resolución",
            "Cap. 19-20: Reflexiones y legado"
        ],
        characters: [
            "Figura principal real",
            "Personajes secundarios históricos",
            "Comunidad o grupo afectado",
            "Oponentes o críticos",
            "Aliados y colaboradores",
            "Narrador/investigador (opcional)"
        ],
        tips: "Respeta la verdad histórica mientras haces la narrativa atractiva. Sé transparente sobre lagunas en la información. Elige momentos significativos, no intentes cubrir todo."
    },
    {
        id: 13,
        title: "Horror Cósmico",
        subtitle: "Terror de lo inconcebible y lo antiguo",
        genre: "misterio",
        iconClass: "fas fa-eye",
        words: "60,000-80,000",
        chapters: 22,
        time: "5-7 meses",
        description: "Terror que viene de fuerzas cósmicas indiferentes, conocimientos que destruyen la cordura y criaturas más allá de la comprensión humana.",
        features: [
            "Terror psicológico sobre gore",
            "Conocimientos que dañan la mente",
            "Seres cósmicos indiferentes",
            "Atmósfera de inevitable fatalidad",
            "Finales ambiguos o trágicos"
        ],
        structure: [
            "Fase 1: Presagios y anomalías",
            "Cap. 1-5: Vida normal con grietas",
            "Cap. 6-8: Descubrimiento inicial",
            "Fase 2: Descenso a la locura",
            "Cap. 9-14: Investigación y revelaciones",
            "Cap. 15-18: Confrontación parcial",
            "Fase 3: Consecuencias",
            "Cap. 19-22: Resolución trágica o ambigua"
        ],
        characters: [
            "Protagonista curioso/investigador",
            "Científico/estudioso que comprende demasiado",
            "Víctima de conocimiento cósmico",
            "Cultista que acepta la verdad",
            "Aliado que comparte el destino",
            "Ser cósmico (mostrado parcialmente)"
        ],
        tips: "Menos es más. Sugiere, no muestres completamente. El terror viene de lo desconocido e incomprensible. Los personajes son insignificantes frente a fuerzas cósmicas."
    },
    {
        id: 14,
        title: "Comedia Romántica",
        subtitle: "Amor y risas en igual medida",
        genre: "novela",
        iconClass: "fas fa-laugh",
        words: "65,000-85,000",
        chapters: 24,
        time: "4-6 meses",
        description: "Combina romance genuino con humor orgánico, situaciones cómicas derivadas de caracteres y conflictos que se resuelven con risas y amor.",
        features: [
            "Humor derivado de personajes, no situaciones",
            "Química romántica genuina",
            "Conflicto cómico pero significativo",
            "Diálogos ingeniosos y divertidos",
            "Finales felices satisfactorios"
        ],
        structure: [
            "Acto I: Encuentro cómico",
            "Cap. 1-5: Presentación y primer encuentro",
            "Cap. 6-9: Atracción y resistencia",
            "Acto II: Complicaciones divertidas",
            "Cap. 10-14: Desarrollo con obstáculos cómicos",
            "Cap. 15-18: Punto bajo humorístico",
            "Acto III: Resolución feliz",
            "Cap. 19-24: Reconciliación y futuro risueño"
        ],
        characters: [
            "Protagonista A con defectos encantadores",
            "Protagonista B que los complementa",
            "Amigo cómico o confidente",
            "Familiar excéntrico",
            "Ex pareja ridícula",
            "Jefe o figura de autoridad absurda"
        ],
        tips: "El humor debe surgir de los personajes, no forzarse. El romance debe ser creíble. Equilibra momentos cómicos con escenas románticas sinceras."
    },
    {
        id: 15,
        title: "Novela de Arte y Música",
        subtitle: "Creatividad, pasión y expresión artística",
        genre: "otros",
        iconClass: "fas fa-palette",
        words: "75,000-100,000",
        chapters: 26,
        time: "6-9 meses",
        description: "Explora el proceso creativo, la lucha artística, la inspiración y cómo el arte transforma tanto al creador como al espectador.",
        features: [
            "Procesos creativos auténticos",
            "Comunidad artística vibrante",
            "Conflictos entre arte y comercio",
            "Descripciones sensoriales ricas",
            "Temas de expresión y autenticidad"
        ],
        structure: [
            "Parte I: La llama creativa",
            "Cap. 1-6: Descubrimiento del talento/pasión",
            "Cap. 7-11: Aprendizaje y desarrollo",
            "Parte II: La lucha",
            "Cap. 12-17: Desafíos y obstáculos",
            "Cap. 18-21: Crisis creativa",
            "Parte III: La expresión",
            "Cap. 22-26: Resolución y obra maestra"
        ],
        characters: [
            "Artista en desarrollo",
            "Mentor maestro",
            "Mecenas o promotor",
            "Crítico o opositor",
            "Colega que inspira o compite",
            "Ser querido que apoya o no comprende"
        ],
        tips: "Investiga el medio artístico. Describe el proceso creativo con autenticidad. El arte debe transformar al personaje, no solo ser una habilidad."
    },
    // Nuevas Plantillas Migradas desde TemplateManager
    {
        id: 16,
        title: "Libro de Negocios / Liderazgo",
        subtitle: "Estrategias, gestión y crecimiento profesional",
        genre: "negocios",
        iconClass: "fas fa-chart-line",
        words: "40,000-60,000",
        chapters: 12,
        time: "3-6 meses",
        description: "Estructura profesional para compartir conocimientos de negocios, metodologías de liderazgo o estrategias corporativas de alto impacto.",
        features: [
            "Metodologías probadas y prácticas",
            "Casos de estudio reales",
            "Estructura orientada a la acción",
            "Gráficos y visualizaciones de datos",
            "Resúmenes ejecutivos por capítulo"
        ],
        structure: [
            "Introducción: El problema y la promesa",
            "Parte I: Fundamentos y Mentalidad",
            "Parte II: La Metodología / Estrategia",
            "Parte III: Implementación y Ejecución",
            "Parte IV: Casos de Éxito y Errores Comunes",
            "Conclusión: El llamado a la acción"
        ],
        characters: [
            "El Autor (como guía experto)",
            "El Lector (como héroe que aprende)",
            "Empresas Ejemplo (casos de éxito)",
            "El 'Villano' (malas prácticas/problemas)",
            "Expertos invitados (citas/entrevistas)"
        ],
        tips: "Centra cada capítulo en un problema y su solución. Usa un lenguaje claro y evita la jerga innecesaria. Los ejemplos reales son clave para la credibilidad."
    },
    {
        id: 17,
        title: "Informe Anual Corporativo",
        subtitle: "Transparencia, logros y visión de futuro",
        genre: "negocios",
        iconClass: "fas fa-building",
        words: "15,000-25,000",
        chapters: 8,
        time: "1-2 meses",
        description: "Plantilla formal para presentar el desempeño anual de una organización, destacando hitos financieros, impacto social y objetivos estratégicos.",
        features: [
            "Presentación de datos financieros clave",
            "Narrativa de logros y desafíos",
            "Mensaje del CEO/Presidente",
            "Visión estratégica a futuro",
            "Impacto y responsabilidad social"
        ],
        structure: [
            "1. Carta del Presidente/CEO",
            "2. Resumen Ejecutivo del Año",
            "3. Hitos Operativos y Estratégicos",
            "4. Análisis Financiero Detallado",
            "5. Gobierno Corporativo",
            "6. Sostenibilidad e Impacto",
            "7. Perspectivas para el Próximo Año"
        ],
        characters: [
            "La Empresa (protagonista)",
            "Accionistas e Inversores (audiencia)",
            "Clientes y Empleados (beneficiarios)",
            "El Mercado (contexto/desafío)"
        ],
        tips: "La consistencia en los datos es vital. Balancea los números fríos con historias humanas de impacto. El diseño visual es tan importante como el texto."
    },
    {
        id: 18,
        title: "Artículo de Investigación (Paper)",
        subtitle: "Rigor científico y contribución académica",
        genre: "academico",
        iconClass: "fas fa-microscope",
        words: "5,000-10,000",
        chapters: 6,
        time: "2-4 meses",
        description: "Formato estándar IMRaD (Introducción, Métodos, Resultados y Discusión) para publicaciones científicas y académicas revisadas por pares.",
        features: [
            "Estándar IMRaD riguroso",
            "Citas y referencias bibliográficas",
            "Claridad y precisión técnica",
            "Análisis estadístico o cualitativo",
            "Contribución original al campo"
        ],
        structure: [
            "Abstract: Resumen conciso",
            "1. Introducción: Contexto e Hipótesis",
            "2. Metodología: Diseño y Procedimientos",
            "3. Resultados: Hallazgos Clave",
            "4. Discusión: Interpretación e Implicaciones",
            "5. Conclusión y Futuras Líneas",
            "Referencias Bibliográficas"
        ],
        characters: [
            "El Investigador (observador objetivo)",
            "El Fenómeno (objeto de estudio)",
            "La Comunidad Académica (revisores)",
            "Investigaciones Previas (contexto)"
        ],
        tips: "La claridad es reina; evita la ambigüedad. Asegura que tus resultados soporten directamente tus conclusiones. Revisa exhaustivamente las referencias."
    },
    {
        id: 19,
        title: "Colección de Poesía",
        subtitle: "Lirismo, ritmo y emoción condensada",
        genre: "poesia",
        iconClass: "fas fa-feather-alt",
        words: "10,000-20,000",
        chapters: 50,
        time: "3-6 meses",
        description: "Estructura para recopilar poemas en una obra cohesiva, organizada por temáticas, estilos o una narrativa emocional subyacente.",
        features: [
            "Organización temática o cronológica",
            "Uso del espacio en blanco y ritmo",
            "Variedad de formas (verso libre, soneto, etc.)",
            "Cohesión emocional del conjunto",
            "Prólogo o introducción del autor"
        ],
        structure: [
            "Prólogo / Arte Poética",
            "Sección I: El Despertar / Origen",
            "Sección II: El Conflicto / Dolor",
            "Sección III: La Transformación / Amor",
            "Sección IV: La Resolución / Calma",
            "Epílogo / Poema Final"
        ],
        characters: [
            "El Yo Lírico (voz principal)",
            "El 'Tú' (objeto de deseo/interlocutor)",
            "La Naturaleza/Entorno (reflejo emocional)",
            "El Tiempo (tema recurrente)"
        ],
        tips: "El orden de los poemas cuenta una historia en sí misma. No temas dejar espacio en blanco. Lee en voz alta para asegurar el ritmo y la musicalidad."
    },
    {
        id: 20,
        title: "Guion Cinematográfico",
        subtitle: "Narrativa visual para la pantalla grande",
        genre: "guion",
        iconClass: "fas fa-film",
        words: "20,000-30,000",
        chapters: 120,
        time: "2-4 meses",
        description: "Formato estándar de la industria para guiones de cine o TV, enfocado en acción visual, diálogo nítido y estructura de escenas.",
        features: [
            "Formato estándar de guion",
            "Narrativa puramente visual y auditiva",
            "Diálogos concisos y subtexto",
            "Estructura de 3 actos / secuencias",
            "Descripciones de acción dinámicas"
        ],
        structure: [
            "Acto I: Planteamiento (pág. 1-30)",
            " - Incidente Incitador",
            " - Primer Punto de Giro",
            "Acto II: Confrontación (pág. 30-90)",
            " - Midpoint (Punto Medio)",
            " - Segundo Punto de Giro",
            "Acto III: Resolución (pág. 90-120)",
            " - Clímax",
            " - Resolución"
        ],
        characters: [
            "Protagonista visualmente activo",
            "Antagonista formidable",
            "Personajes de soporte funcionales",
            "El Escenario (como personaje)",
            "Elementos visuales recurrentes"
        ],
        tips: "¡Muestra, no cuentes! Escribe solo lo que se puede ver o escuchar. Mantén las descripciones de acción breves (máx 3-4 líneas). Una página = un minuto."
    },
    {
        id: 21,
        title: "Maestría en Marketing Digital",
        subtitle: "Guía práctica para el crecimiento empresarial moderno",
        genre: "negocios",
        iconClass: "fas fa-hashtag",
        words: "30,000-40,000",
        chapters: 10,
        time: "3-5 meses",
        description: "Transforma tu negocio con una gestión estratégica de redes sociales. Una guía paso a paso para dominar las plataformas digitales.",
        features: [
            "Casos de estudio reales",
            "Guías de configuración por plataforma",
            "Plantillas de calendario de contenido",
            "Hojas de cálculo de retorno de inversión (ROI)",
            "Estrategias de gestión de crisis"
        ],
        structure: [
            "Cap. 1: Fundamentos del Marketing Social",
            "Cap. 2: Construyendo tu Estrategia",
            "Cap. 3: Creación de Contenido de Impacto",
            "Cap. 4: Dominando Facebook e Instagram",
            "Cap. 5: Estrategias B2B en LinkedIn",
            "Cap. 6: Publicidad Social (Ads)",
            "Cap. 7: Gestión de Comunidades",
            "Cap. 8: Analítica y Optimización",
            "Cap. 9: Herramientas y Automatización",
            "Cap. 10: Futuro del Social Media"
        ],
        characters: [
            "El Emprendedor (Lector)",
            "El Cliente Ideal (Target)",
            "La Marca (Identidad)",
            "La Competencia",
            "El Algoritmo (Desafío)"
        ],
        tips: "La consistencia vence a la viralidad. Enfócate en aportar valor real a tu audiencia antes de intentar vender. Usa datos para pivotar tu estrategia."
    }
];
