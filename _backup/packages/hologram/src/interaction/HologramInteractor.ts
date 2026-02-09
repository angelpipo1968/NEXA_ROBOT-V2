
export class HologramInteractor {
    createInteractionSystem(): any {
        return {
            handleVoiceCommand: async (command: string, confidence: number) => {
                const normalized = command.toLowerCase();

                if (normalized.includes('hola') || normalized.includes('hello')) {
                    return { type: 'greeting', animation: 'greet', response: '¡Hola! Soy tu asistente holográfico.' };
                }
                if (normalized.includes('baila')) {
                    return { type: 'animation', animation: 'excited', response: '¡A bailar!' };
                }

                return { type: 'acknowledge', animation: 'listen', response: `Entendido: ${command}` };
            }
        };
    }
}
