export const publishingRoadmap = [
    {
        week: 1,
        title: "Semana 1: Arranque y Edición",
        description: "Preparación del manuscrito y estructura base.",
        tasks: [
            { id: 'w1-1', label: 'Edición de Estilo (Estilo Rico)', completed: false },
            { id: 'w1-2', label: 'Definir título y subtítulo gancho', completed: false },
            { id: 'w1-3', label: 'Propuesta de concepto de portada', completed: false },
            { id: 'w1-4', label: 'Estructura de metadatos (Keywords)', completed: false }
        ]
    },
    {
        week: 2,
        title: "Semana 2: Maquetación y Diseño",
        description: "Transformando el texto en un producto profesional.",
        tasks: [
            { id: 'w2-1', label: 'Maquetación interior (eBook/Papel)', completed: false },
            { id: 'w2-2', label: 'Diseño de portada finalizado', completed: false },
            { id: 'w2-3', label: 'Revisión de pruebas visuales', completed: false },
            { id: 'w2-4', label: 'Preparación de archivos para KDP', completed: false }
        ]
    },
    {
        week: 3,
        title: "Semana 3: Lanzamiento",
        description: "Publicación global y primeros lectores.",
        tasks: [
            { id: 'w3-1', label: 'Subida a Amazon KDP', completed: false },
            { id: 'w3-2', label: 'Revisión de ficha de producto', completed: false },
            { id: 'w3-3', label: 'Plan de lanzamiento (7 días)', completed: false },
            { id: 'w3-4', label: 'Campaña de anuncios inicial', completed: false }
        ]
    }
];

export const publishingTips = [
    "Recuerda: Velocidad con paz. Mejor hecho que perfecto, pero profesional.",
    "El 100% de las regalías deben ser tuyas. No cedas derechos innecesariamente.",
    "Una buena portada vende el primer clic. Un buen interior vende el siguiente libro.",
    "Concéntrate en el lector: ¿Qué se lleva de tu libro?"
];

export const publishingResources = [
    {
        category: "Autoedición y Servicios",
        items: [
            {
                name: "Editorial Círculo Rojo",
                description: "Líder europeo en autoedición. Servicios integrales con distribución física real.",
                link: "https://editorialcirculorojo.com",
                badge: "Líder Europa"
            },
            {
                name: "Bubok",
                description: "Expertos en tiradas cortas y venta bajo demanda. Distribución en España y Latam.",
                link: "https://www.bubok.es"
            },
            {
                name: "Letrame Grupo",
                description: "Alcance internacional y corrección ortotipográfica incluida en muchos packs.",
                link: "https://letrame.com"
            }
        ]
    },
    {
        category: "Gigantes Digitales",
        items: [
            {
                name: "Amazon KDP",
                description: "El estándar global. 70% de regalías y acceso a millones de lectores en Kindle.",
                link: "https://kdp.amazon.com",
                badge: "Global"
            },
            {
                name: "Wattpad",
                description: "Ideal para construir audiencia antes de vender. Feedback real capítulo a capítulo.",
                link: "https://www.wattpad.com"
            }
        ]
    },
    {
        category: "Grandes Editoriales",
        items: [
            {
                name: "Penguin Random House",
                description: "El 'Big Five'. Requiere propuesta editorial impecable o agente literario.",
                link: "https://www.penguinrandomhouse.com"
            },
            {
                name: "Grupo Planeta / Universo",
                description: "Universo de Letras permite autoeditar con el respaldo de su sello.",
                link: "https://www.universodeletras.com"
            }
        ]
    }
];
