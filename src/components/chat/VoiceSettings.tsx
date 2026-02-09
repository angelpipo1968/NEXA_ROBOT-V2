'use client';

import { useState, useEffect } from 'react';
import { NexaVoice, VoiceInfo } from '@/lib/voice/TextToSpeech';

export function VoiceSettings() {
    const [voice, setVoice] = useState<NexaVoice | null>(null);
    const [voices, setVoices] = useState<VoiceInfo[]>([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [speed, setSpeed] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);
    const [volume, setVolume] = useState(1.0);

    useEffect(() => {
        const init = async () => {
            if (typeof window === 'undefined') return;

            const nexaVoice = new NexaVoice();
            await nexaVoice.loadVoices();
            setVoice(nexaVoice);
            setVoices(nexaVoice.getAvailableVoices());

            // Cargar configuración guardada
            const saved = localStorage.getItem('nexa-voice-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                setSelectedVoice(settings.voice || '');
                setSpeed(settings.speed || 1.0);
                setPitch(settings.pitch || 1.0);
                setVolume(settings.volume || 1.0);
            }
        };

        init();
    }, []);

    const saveSettings = () => {
        const settings = { voice: selectedVoice, speed, pitch, volume };
        localStorage.setItem('nexa-voice-settings', JSON.stringify(settings));

        // Mostrar confirmación
        alert('Configuración de voz guardada');
    };

    const testVoice = () => {
        if (voice) {
            voice.speak('Esta es una prueba de la voz configurada', {
                speed,
                pitch,
                volume,
                voiceName: selectedVoice
            });
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-md">
            <h3 className="text-lg font-semibold dark:text-gray-100">Configuración de Voz</h3>

            {/* Selección de voz */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Voz
                </label>
                <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                    <option value="">Voz predeterminada</option>
                    {voices.map((v, i) => (
                        <option key={i} value={v.name}>
                            {v.name} ({v.lang})
                        </option>
                    ))}
                </select>
            </div>

            {/* Velocidad */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Velocidad: {speed.toFixed(1)}x
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full text-blue-500"
                />
            </div>

            {/* Tono */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Tono: {pitch.toFixed(1)}
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full text-blue-500"
                />
            </div>

            {/* Volumen */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Volumen: {Math.round(volume * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full text-blue-500"
                />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={testVoice}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                    Probar voz
                </button>
                <button
                    onClick={saveSettings}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
                >
                    Guardar
                </button>
            </div>
        </div>
    );
}
