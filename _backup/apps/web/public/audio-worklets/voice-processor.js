// Audio Worklet para procesamiento en tiempo real
class VoiceProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        // Aplicar efectos en tiempo real
        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; ++i) {
                // Efecto futurista: modulación de frecuencia
                const futuristicEffect = Math.sin(i * 0.01) * 0.1;

                // Efecto en vivo: leve distorsión
                const liveEffect = Math.tanh(inputChannel[i] * 1.2) * 0.9;

                // Combinar efectos
                outputChannel[i] = (inputChannel[i] + futuristicEffect + liveEffect) * 0.8;
            }
        }

        return true;
    }
}

registerProcessor('voice-processor', VoiceProcessor);
