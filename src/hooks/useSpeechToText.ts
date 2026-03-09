import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextReturn {
    transcript: string;
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
}

export const useSpeechToText = (language: string = 'es-ES'): UseSpeechToTextReturn => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
        }

        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    setTranscript(prev => prev + ' ' + result);
                } else {
                    currentTranscript += result;
                }
            }
            if (currentTranscript) {
                // For interim results, we could set a separate state, 
                // but let's just make sure final results are captured correctly.
            }
        };

        recognitionRef.current.onend = () => {
            if (isListening) {
                // Use a small timeout to prevent rapid-fire restart loops
                setTimeout(() => {
                    if (isListening) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) {
                            console.error('Failed to restart speech recognition:', e);
                        }
                    }
                }, 500);
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech Recognition Error:', event.error);

            if (event.error === 'not-allowed') {
                alert("🎤 ACCESO DENEGADO: El navegador bloqueó el micrófono. Por favor, actívalo en los ajustes de tu navegador o barra de direcciones.");
                setIsListening(false);
            } else if (event.error === 'no-speech' || event.error === 'network' || event.error === 'aborted') {
                console.warn(`[VOICE] Transient error (${event.error}), maintaining state for auto-restart.`);
                // We keep isListening=true so onend() can restart it automatically
                // but we add a small delay in onend to avoid CPU spikes.
            } else {
                console.warn(`[VOICE] Critical Speech Error: ${event.error}`);
                setIsListening(false);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, isListening]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error('Failed to start speech recognition:', e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { transcript, isListening, startListening, stopListening, resetTranscript, isSupported };
};
