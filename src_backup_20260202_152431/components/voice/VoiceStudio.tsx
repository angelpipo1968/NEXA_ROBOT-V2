'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    SlidersHorizontal, Globe, Mic2, Palette,
    Play, Pause, SkipBack, SkipForward, Download, Share2,
    FileAudio, Activity, Zap, Headphones, BookOpen, Smile, Briefcase, User
} from 'lucide-react';
import styles from './VoiceStudio.module.css';
import { VOICE_LIBRARY, Voice } from '../../data/voice-data';

const NeuralBackground = () => {
    const [elements, setElements] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const newElements = [];
        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

        // Neurons
        for (let i = 0; i < 30; i++) {
            newElements.push(
                <div
                    key={`neuron-${i}`}
                    className={styles.neuron}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)]
                    }}
                />
            );
        }

        // Connections
        for (let i = 0; i < 40; i++) {
            const length = 20 + Math.random() * 80;
            const angle = Math.random() * 360;
            newElements.push(
                <div
                    key={`conn-${i}`}
                    className={styles.connection}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${length}%`,
                        transform: `rotate(${angle}deg)`,
                        animationDelay: `${Math.random() * 3}s`
                    }}
                />
            );
        }

        setElements(newElements);
    }, []);

    return <div className={styles.neuralNetwork}>{elements}</div>;
};

export function VoiceStudio() {
    const [lang, setLang] = useState('es');
    const [gender, setGender] = useState('male');
    const [style, setStyle] = useState('neutral');
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
    const [text, setText] = useState(`La síntesis de voz neuronal ha revolucionado la forma en que interactuamos con la tecnología. Con Nexa Voice Studio Pro, puedes crear narraciones realistas en múltiples idiomas, perfectas para audiolibros, presentaciones y contenido multimedia.\n\nEsta tecnología utiliza redes neuronales profundas entrenadas con miles de horas de audio humano, capturando los matices más sutiles del habla natural.`);

    const [settings, setSettings] = useState({
        speed: 1.0,
        pitch: 0,
        stability: 75
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [showLoader, setShowLoader] = useState(false);
    const [loaderText, setLoaderText] = useState('Analizando texto...');
    const [exportFormat, setExportFormat] = useState('mp3');

    const availableVoices = VOICE_LIBRARY[lang]?.[gender] || [];
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial voice selection
    useEffect(() => {
        if (availableVoices.length > 0 && !availableVoices.find(v => v.id === selectedVoiceId)) {
            setSelectedVoiceId(availableVoices[0].id);
        }
    }, [lang, gender, availableVoices, selectedVoiceId]);

    const handleGenerate = async () => {
        if (!text.trim()) return;

        setShowLoader(true);
        const stages = [
            "Analizando texto...",
            "Procesando prosodia...",
            "Generando entonación...",
            "Aplicando emociones...",
            "Optimizando calidad..."
        ];

        for (let i = 0; i < stages.length; i++) {
            setLoaderText(stages[i]);
            await new Promise(r => setTimeout(r, 600));
        }

        setShowLoader(false);
        setTotalTime(Math.max(30, Math.floor(text.length / 20)));
        setCurrentTime(0);
        alert('Voz neuronal generada exitosamente');
        setIsPlaying(true);
    };

    // Playback simulation
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= totalTime) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, totalTime]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const selectedVoice = availableVoices.find(v => v.id === selectedVoiceId);

    return (
        <div className="relative min-h-full w-full bg-slate-900 text-white overflow-y-auto custom-scrollbar">
            <NeuralBackground />

            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <Activity className="inline-block w-12 h-12 mr-3 text-indigo-500" />
                        NEXA VOICE STUDIO PRO
                    </h1>
                    <div className={styles.tagline}>Síntesis de Voz Neuronal de Última Generación</div>
                    <p className={styles.subtitle}>
                        Transforma tu texto en narraciones realistas con voces neuronales en Español, Inglés y Chino.
                    </p>
                    <div className={styles.aiBadge}>
                        <Activity className="inline-block w-4 h-4 mr-2" />
                        MOTOR NEURONAL V3.5 • 256K CONTEXTO • TIEMPO REAL
                    </div>
                </header>

                <div className={styles.mainApp}>
                    {/* Control Panel */}
                    <div className={styles.panel}>
                        <div className={styles.sectionTitle}>
                            <div className={styles.sectionTitleIcon}><SlidersHorizontal /></div>
                            <span>Configuración de Voz</span>
                        </div>

                        {/* Language */}
                        <div className="mb-6">
                            <label className="text-gray-400 mb-2 block text-sm">Idioma</label>
                            <div className={styles.gridSelector}>
                                <button
                                    className={`${styles.btnSelect} ${lang === 'es' ? styles.active : ''}`}
                                    onClick={() => setLang('es')}
                                >
                                    <span className="text-2xl">🇪🇸</span>
                                    <span className="font-bold">Español</span>
                                </button>
                                <button
                                    className={`${styles.btnSelect} ${lang === 'en' ? styles.active : ''}`}
                                    onClick={() => setLang('en')}
                                >
                                    <span className="text-2xl">🇺🇸</span>
                                    <span className="font-bold">Inglés</span>
                                </button>
                                <button
                                    className={`${styles.btnSelect} ${lang === 'zh' ? styles.active : ''}`}
                                    onClick={() => setLang('zh')}
                                >
                                    <span className="text-2xl">🇨🇳</span>
                                    <span className="font-bold">Chino</span>
                                </button>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="mb-6">
                            <label className="text-gray-400 mb-2 block text-sm">Género</label>
                            <div className={styles.flexSelector}>
                                <button
                                    className={`${styles.btnSelect} ${gender === 'male' ? styles.active : ''}`}
                                    onClick={() => setGender('male')}
                                >
                                    <span className="text-2xl">👨</span>
                                    <span>Masculino</span>
                                </button>
                                <button
                                    className={`${styles.btnSelect} ${gender === 'female' ? styles.active : ''}`}
                                    onClick={() => setGender('female')}
                                >
                                    <span className="text-2xl">👩</span>
                                    <span>Femenino</span>
                                </button>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className={styles.voiceControls}>
                            <div className={styles.controlGroup}>
                                <div className={styles.controlLabel}>
                                    <span>Velocidad</span>
                                    <span className={styles.controlValue}>{settings.speed}x</span>
                                </div>
                                <div className={styles.sliderContainer}>
                                    <input
                                        type="range"
                                        min="0.5" max="2.0" step="0.1"
                                        value={settings.speed}
                                        onChange={(e) => setSettings({ ...settings, speed: parseFloat(e.target.value) })}
                                        className={styles.sliderInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.controlGroup}>
                                <div className={styles.controlLabel}>
                                    <span>Tono</span>
                                    <span className={styles.controlValue}>{settings.pitch}</span>
                                </div>
                                <div className={styles.sliderContainer}>
                                    <input
                                        type="range"
                                        min="-12" max="12" step="1"
                                        value={settings.pitch}
                                        onChange={(e) => setSettings({ ...settings, pitch: parseInt(e.target.value) })}
                                        className={styles.sliderInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.controlGroup}>
                                <div className={styles.controlLabel}>
                                    <span>Estabilidad</span>
                                    <span className={styles.controlValue}>{settings.stability}%</span>
                                </div>
                                <div className={styles.sliderContainer}>
                                    <input
                                        type="range"
                                        min="0" max="100" step="1"
                                        value={settings.stability}
                                        onChange={(e) => setSettings({ ...settings, stability: parseInt(e.target.value) })}
                                        className={styles.sliderInput}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Styles */}
                        <div className="mb-6">
                            <label className="text-gray-400 mb-2 block text-sm">Estilo de Voz</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'neutral', icon: User, label: 'Neutral' },
                                    { id: 'narrator', icon: BookOpen, label: 'Narrador' },
                                    { id: 'excited', icon: Zap, label: 'Entusiasmado' },
                                    { id: 'calm', icon: Smile, label: 'Calmado' },
                                    { id: 'professional', icon: Briefcase, label: 'Profesional' },
                                    { id: 'friendly', icon: Smile, label: 'Amigable' }, // Using smile again as mock
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        className={`${styles.btnSelect} flex-row items-center justify-center p-3 ${style === s.id ? styles.active : ''}`}
                                        onClick={() => setStyle(s.id)}
                                    >
                                        <s.icon className="w-4 h-4" />
                                        <span className="text-sm">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Input */}
                        <div className={styles.textAreaContainer}>
                            <div className={styles.controlLabel}>
                                <span>Texto para Sintetizar</span>
                                <span className={text.length > 5000 ? 'text-red-500' : 'text-indigo-400'}>
                                    {text.length}/5000
                                </span>
                            </div>
                            <textarea
                                className={styles.textArea}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Escribe tu texto aquí..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleGenerate}>
                                <Zap className="w-5 h-5" /> Generar Voz
                            </button>
                            <button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => {
                                alert('Reproduciendo vista previa rápida...');
                                setIsPlaying(!isPlaying);
                            }}>
                                <Play className="w-5 h-5" /> Vista Previa
                            </button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex flex-col gap-6">
                        <div className={`${styles.panel} flex-1 flex flex-col`}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.sectionTitleIcon}><Headphones /></div>
                                <span>Reproductor</span>
                            </div>

                            {/* Visualizer */}
                            <div className={styles.visualizer}>
                                {showLoader ? (
                                    <div className="text-center">
                                        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-indigo-300">{loaderText}</p>
                                    </div>
                                ) : (
                                    <div className={styles.waveform}>
                                        {Array.from({ length: 40 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={styles.waveBar}
                                                style={{
                                                    height: isPlaying ? `${20 + Math.random() * 80}px` : '20px',
                                                    animationDelay: `${i * 0.05}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className={styles.playbackControls}>
                                <button className={styles.playbackBtn} onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                                    <SkipBack />
                                </button>
                                <button className={`${styles.playbackBtn} ${styles.playbackBtnMain}`} onClick={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause /> : <Play />}
                                </button>
                                <button className={styles.playbackBtn} onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 10))}>
                                    <SkipForward />
                                </button>
                            </div>

                            <div className="flex justify-between text-gray-400 font-mono mb-8">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(totalTime)}</span>
                            </div>

                            {/* Voice Selection Cards */}
                            <div className="mt-auto">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Mic2 className="text-indigo-500" />
                                    Voces Disponibles
                                </h3>
                                <div className={styles.voiceGrid}>
                                    {availableVoices.map(voice => (
                                        <div
                                            key={voice.id}
                                            className={`${styles.voiceCard} ${selectedVoiceId === voice.id ? styles.active : ''}`}
                                            onClick={() => setSelectedVoiceId(voice.id)}
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
                                                    {gender === 'male' ? '👨' : '👩'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{voice.name}</h4>
                                                    <p className="text-xs text-gray-400 line-clamp-1">{voice.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-indigo-300">
                                                <span>{voice.style}</span>
                                                <span>{voice.popularity}% Popularidad</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Export Panel */}
                        <div className={styles.panel}>
                            <div className={styles.sectionTitle}>
                                <div className={styles.sectionTitleIcon}><Download /></div>
                                <span>Exportar Audio</span>
                            </div>

                            <div className={styles.gridSelector}>
                                {['mp3', 'wav', 'ogg'].map(fmt => (
                                    <button
                                        key={fmt}
                                        className={`${styles.btnSelect} ${exportFormat === fmt ? styles.active : ''}`}
                                        onClick={() => setExportFormat(fmt)}
                                    >
                                        <FileAudio className="w-8 h-8 text-indigo-400 mb-2" />
                                        <span className="uppercase font-bold">{fmt}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={() => alert(`Descargando audio en formato .${exportFormat}...`)}>
                                    <Download className="w-5 h-5" /> Descargar
                                </button>
                                <button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => alert('Compartiendo...')}>
                                    <Share2 className="w-5 h-5" /> Compartir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
