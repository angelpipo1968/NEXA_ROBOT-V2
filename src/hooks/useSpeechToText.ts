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
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + ' ' + finalTranscript);
            }
        };

        recognitionRef.current.onend = () => {
            if (isListening) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error('Failed to restart speech recognition:', e);
                }
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech Recognition Error:', event.error);
            if (event.error === 'no-speech') {
                // Silently ignore or handle
            } else {
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
