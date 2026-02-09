export interface Voice {
    id: string;
    name: string;
    description: string;
    age: string;
    accent: string;
    style: string;
    sample: string;
    popularity: number;
}

export interface VoiceLibrary {
    [lang: string]: {
        [gender: string]: Voice[];
    };
}

export const VOICE_LIBRARY: VoiceLibrary = {
    es: {
        male: [
            {
                id: "es_male_1",
                name: "Carlos",
                description: "Voz profesional para narraciones",
                age: "35-45",
                accent: "Español neutro",
                style: "Neutral",
                sample: "Hola, soy Carlos. Una voz clara y profesional para tus proyectos.",
                popularity: 95
            },
            {
                id: "es_male_2",
                name: "Antonio",
                description: "Voz cálida y amigable",
                age: "40-50",
                accent: "Español peninsular",
                style: "Amigable",
                sample: "Me encanta contar historias con calidez y cercanía.",
                popularity: 87
            },
            {
                id: "es_male_3",
                name: "David",
                description: "Voz energética para contenido dinámico",
                age: "25-35",
                accent: "Español latino",
                style: "Entusiasmado",
                sample: "¡Hola! Vamos a crear contenido vibrante y emocionante.",
                popularity: 92
            }
        ],
        female: [
            {
                id: "es_female_1",
                name: "Elena",
                description: "Voz clara para audiolibros",
                age: "30-40",
                accent: "Español neutro",
                style: "Narrador",
                sample: "Bienvenidos a esta historia. Mi voz les guiará en este viaje.",
                popularity: 98
            },
            {
                id: "es_female_2",
                name: "Sofía",
                description: "Voz suave y calmada",
                age: "25-35",
                accent: "Español mexicano",
                style: "Calmado",
                sample: "Relájense y disfruten de una experiencia auditiva serena.",
                popularity: 85
            },
            {
                id: "es_female_3",
                name: "Laura",
                description: "Voz profesional corporativa",
                age: "35-45",
                accent: "Español internacional",
                style: "Profesional",
                sample: "Para presentaciones ejecutivas y contenido corporativo.",
                popularity: 90
            }
        ]
    },
    en: {
        male: [
            {
                id: "en_male_1",
                name: "Michael",
                description: "Professional narration voice",
                age: "30-40",
                accent: "American English",
                style: "Neutral",
                sample: "Hello, I'm Michael. A clear voice for your professional projects.",
                popularity: 96
            },
            {
                id: "en_male_2",
                name: "James",
                description: "Warm and trustworthy voice",
                age: "40-50",
                accent: "British English",
                style: "Friendly",
                sample: "Trust me to deliver your message with warmth and credibility.",
                popularity: 88
            },
            {
                id: "en_male_3",
                name: "Robert",
                description: "Energetic for dynamic content",
                age: "25-35",
                accent: "Australian English",
                style: "Excited",
                sample: "Let's create some amazing content together!",
                popularity: 91
            }
        ],
        female: [
            {
                id: "en_female_1",
                name: "Emma",
                description: "Crystal clear for audiobooks",
                age: "28-38",
                accent: "American English",
                style: "Narrator",
                sample: "Welcome to our story. I'll be your guide through this journey.",
                popularity: 97
            },
            {
                id: "en_female_2",
                name: "Charlotte",
                description: "Soft and calming voice",
                age: "30-40",
                accent: "British English",
                style: "Calm",
                sample: "Relax and enjoy a serene auditory experience.",
                popularity: 89
            },
            {
                id: "en_female_3",
                name: "Olivia",
                description: "Corporate professional voice",
                age: "35-45",
                accent: "International English",
                style: "Professional",
                sample: "Perfect for executive presentations and corporate content.",
                popularity: 93
            }
        ]
    },
    zh: {
        male: [
            {
                id: "zh_male_1",
                name: "李伟",
                description: "专业叙述声音",
                age: "35-45",
                accent: "普通话",
                style: "中性",
                sample: "你好，我是李伟。为您提供清晰专业的语音服务。",
                popularity: 94
            },
            {
                id: "zh_male_2",
                name: "张明",
                description: "温暖友好的声音",
                age: "40-50",
                accent: "标准普通话",
                style: "友好",
                sample: "用温暖和可信的声音传递您的信息。",
                popularity: 86
            }
        ],
        female: [
            {
                id: "zh_female_1",
                name: "王芳",
                description: "有声书清晰声音",
                age: "30-40",
                accent: "普通话",
                style: "叙述者",
                sample: "欢迎来到我们的故事。我将引导您完成这段旅程。",
                popularity: 95
            },
            {
                id: "zh_female_2",
                name: "刘婷",
                description: "柔和平静的声音",
                age: "25-35",
                accent: "标准普通话",
                style: "平静",
                sample: "放松身心，享受宁静的听觉体验。",
                popularity: 87
            }
        ]
    }
};
