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
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);
    // Use a ref for isListening so callbacks always see the latest value
    // without causing useEffect re-runs or stale closures
    const isListeningRef = useRef(false);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const languageRef = useRef(language);

    // Keep language ref in sync
    useEffect(() => {
        languageRef.current = language;
        if (recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    // Initialize recognition ONCE on mount — never re-create it
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageRef.current;
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                }
            }
            if (finalText) {
                // Wake word logic
                const textLower = finalText.toLowerCase();
                const wakeWords = /oye nexa|despierta nexa|hey nexa|nexa despierta/gi;
                if (wakeWords.test(textLower)) {
                    console.log('[STT] Wake word detected! Interrupting and waking up...');
                    finalText = finalText.replace(wakeWords, '').trim();
                    window.dispatchEvent(new CustomEvent('nexa-wake-word'));
                }
                setTranscript(prev => (prev + ' ' + finalText).trim());
            }
        };

        recognition.onend = () => {
            // Only auto-restart if we're still supposed to be listening
            if (isListeningRef.current) {
                restartTimerRef.current = setTimeout(() => {
                    if (isListeningRef.current && recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (e) {
                            // Ignore "already started" errors
                            const err = e as Error;
                            if (!err.message?.includes('already started')) {
                                console.error('[STT] Restart failed:', e);
                                isListeningRef.current = false;
                                setIsListening(false);
                            }
                        }
                    }
                }, 300);
            } else {
                setIsListening(false);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('[STT] Error:', event.error);
            if (event.error === 'not-allowed') {
                alert('🎤 Micrófono bloqueado. Actívalo en los ajustes del navegador o de la app.');
                isListeningRef.current = false;
                setIsListening(false);
            } else if (
                event.error === 'no-speech' ||
                event.error === 'network' ||
                event.error === 'aborted'
            ) {
                // onend will handle restart, no action needed
            } else {
                console.warn('[STT] Critical error, stopping:', event.error);
                isListeningRef.current = false;
                setIsListening(false);
            }
        };

        // Cleanup when component unmounts — stop recognition but don't re-create
        return () => {
            isListeningRef.current = false;
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            try {
                recognition.stop();
            } catch (_) {}
            recognitionRef.current = null;
        };
    }, []); // Empty deps — runs only once

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListeningRef.current) return;
        isListeningRef.current = true;
        setIsListening(true);
        try {
            recognitionRef.current.lang = languageRef.current;
            recognitionRef.current.start();
        } catch (e) {
            console.error('[STT] Start failed:', e);
            isListeningRef.current = false;
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        setIsListening(false);
        try {
            recognitionRef.current?.stop();
        } catch (_) {}
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { transcript, isListening, startListening, stopListening, resetTranscript, isSupported };
};
