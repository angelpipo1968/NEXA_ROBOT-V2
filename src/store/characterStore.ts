import { create } from 'zustand';

export interface Character {
    id: string;
    name: string;
    role: string;
    description: string;
    traits: string[];
    evolution?: string;
    imageUrl?: string;
}

interface CharacterState {
    characters: Character[];
    addCharacter: (char: Character) => void;
    updateCharacter: (id: string, char: Partial<Character>) => void;
    removeCharacter: (id: string) => void;
    analyzeCharactersInStory: (storyContent: string) => Promise<void>;
}

export const useCharacterStore = create<CharacterState>((set) => ({
    characters: [],

    addCharacter: (char) =>
        set((state) => ({ characters: [char, ...state.characters] })),

    updateCharacter: (id, updates) =>
        set((state) => ({
            characters: state.characters.map((c) =>
                c.id === id ? { ...c, ...updates } : c
            )
        })),

    removeCharacter: (id) =>
        set((state) => ({
            characters: state.characters.filter((c) => c.id !== id)
        })),

    analyzeCharactersInStory: async (storyContent: string) => {
        if (!storyContent || storyContent.trim() === '') return;

        try {
            const prompt = `Analiza el siguiente texto literario y extrae los personajes principales. 
            Para cada personaje, identifica: nombre, rol (protagonista, antagonista, secundario), una descripción breve y Rasgos de personalidad.
            
            Texto: "${storyContent.substring(0, 4000)}"
            
            Responde ÚNICAMENTE en formato JSON: 
            { "characters": [ { "name": "...", "role": "...", "description": "...", "traits": ["rasgo1", "rasgo2"] } ] }`;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    engine: 'ollama'
                })
            });

            const data = await response.json();
            const rawText = data.reply || "{}";
            const content = rawText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(content);

            if (parsed.characters) {
                const newChars = parsed.characters.map((c: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    ...c
                }));

                set((state) => {
                    const existingNames = new Set(state.characters.map(pc => pc.name.toLowerCase()));
                    const uniqueNew = newChars.filter((nc: any) => !existingNames.has(nc.name.toLowerCase()));
                    return { characters: [...state.characters, ...uniqueNew] };
                });
            }
        } catch (error) {
            console.error("Error analyzing characters:", error);
        }
    }
}));
