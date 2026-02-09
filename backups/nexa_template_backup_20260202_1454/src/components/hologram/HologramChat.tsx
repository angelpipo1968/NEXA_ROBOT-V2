'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './HologramChat.module.css';
import { Mic, MicOff, User, Sparkles, Send, Bot, MessageSquare, Brain, Volume2, Globe, Expand } from 'lucide-react';

// Predefined AI responses
const AI_RESPONSES = [
    "Interesante pregunta. Déjame analizarlo... La IA holográfica como yo puede procesar información en tiempo real y adaptarse a diferentes contextos de conversación.",
    "¡Excelente punto! La tecnología holográfica combinada con IA permite crear experiencias inmersivas que antes solo existían en la ciencia ficción.",
    "Basándome en mis algoritmos de aprendizaje, puedo decirte que la interacción humano-IA está evolucionando rápidamente hacia interfaces más naturales como esta.",
    "La holografía digital ha avanzado significativamente en los últimos años. Ahora podemos crear representaciones visuales en 3D que responden en tiempo real.",
    "Como asistente holográfico, puedo ayudarte con tareas complejas, explicar conceptos difíciles o simplemente mantener una conversación amena.",
    "La ventaja de un sistema como este es la combinación de interfaz visual atractiva con capacidades de procesamiento de lenguaje natural avanzadas."
];

// Available avatars
const AVATARS = [
    "https://cdn.pixabay.com/photo/2023/02/15/17/59/ai-generated-7792246_1280.png",
    "https://cdn.pixabay.com/photo/2023/03/27/18/53/ai-generated-7881122_1280.png",
    "https://cdn.pixabay.com/photo/2023/05/20/16/28/ai-generated-8006439_1280.png",
    "https://cdn.pixabay.com/photo/2023/04/05/20/12/ai-generated-7901881_1280.png"
];

// Effect colors
const EFFECT_COLORS = [
    'rgba(0, 150, 255, 0.2)',
    'rgba(0, 255, 150, 0.2)',
    'rgba(255, 0, 200, 0.2)',
    'rgba(255, 150, 0, 0.2)'
];

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    isVoice?: boolean;
}

export function HologramChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "¡Hola! Soy Nexa, tu asistente holográfico de IA. ¿En qué puedo ayudarte hoy? Puedo responder preguntas, ayudarte con tareas o simplemente conversar contigo.",
            sender: 'ai'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [effectColor, setEffectColor] = useState('rgba(0, 150, 255, 0.2)');
    const [isAnimatingAvatar, setIsAnimatingAvatar] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLImageElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI delay and response
        const randomDelay = 1500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, randomDelay));

        const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
        const newAiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: randomResponse,
            sender: 'ai'
        };

        setMessages(prev => [...prev, newAiMessage]);
        setIsTyping(false);
        animateAvatar();

        if (voiceEnabled) {
            simulateVoice(randomResponse);
        }
    };

    const animateAvatar = () => {
        setIsAnimatingAvatar(true);
        setTimeout(() => setIsAnimatingAvatar(false), 800);
    };

    const changeAvatar = () => {
        setCurrentAvatarIndex((prev) => (prev + 1) % AVATARS.length);
        setIsAnimatingAvatar(true);
        setTimeout(() => setIsAnimatingAvatar(false), 300);
    };

    const changeEffect = () => {
        const randomColor = EFFECT_COLORS[Math.floor(Math.random() * EFFECT_COLORS.length)];
        setEffectColor(randomColor);
    };

    const toggleVoice = () => {
        setVoiceEnabled(!voiceEnabled);
        if (!voiceEnabled) {
            // If turning on, verify last message
            const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
            if (lastAiMessage) {
                simulateVoice(lastAiMessage.text);
            }
        }
    };

    const simulateVoice = (text: string) => {
        console.log("Speaking:", text);
        // Visual indicator for voice
        const voiceMsg: Message = {
            id: Date.now().toString(),
            text: "Reproduciendo respuesta por voz...",
            sender: 'ai',
            isVoice: true
        };
        setMessages(prev => [...prev, voiceMsg]);

        // Remove voice indicator after a few seconds
        setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== voiceMsg.id));
        }, 3000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}><Bot className="inline-block mr-2" size={40} /> NEXA HOLOGRAMA CHAT</h1>
                <p className={styles.tagline}>Conversa con un asistente holográfico de inteligencia artificial</p>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.hologramContainer}>
                    <div
                        className={styles.hologramDisplay}
                        style={{ borderColor: effectColor, boxShadow: `0 0 30px ${effectColor}` }}
                    >
                        <div className={styles.hologramEffect}></div>
                        <div className={styles.avatar}>
                            <img
                                ref={avatarRef}
                                src={AVATARS[currentAvatarIndex]}
                                alt="Avatar holográfico"
                                className={styles.avatarImg}
                                style={{
                                    transform: isAnimatingAvatar ? 'scale(1.1)' : 'scale(1)',
                                    filter: isAnimatingAvatar ? 'drop-shadow(0 0 25px rgba(0, 255, 255, 0.9))' : 'drop-shadow(0 0 20px rgba(0, 200, 255, 0.7))'
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.avatarControls}>
                        <button className={styles.controlBtn} onClick={changeAvatar}>
                            <User size={18} /> Cambiar Avatar
                        </button>
                        <button className={styles.controlBtn} onClick={changeEffect}>
                            <Sparkles size={18} /> Efectos
                        </button>
                        <button
                            className={styles.controlBtn}
                            onClick={toggleVoice}
                            style={{
                                background: voiceEnabled ? 'rgba(0, 200, 100, 0.5)' : undefined
                            }}
                        >
                            {voiceEnabled ? <MicOff size={18} /> : <Mic size={18} />}
                            {voiceEnabled ? 'Silenciar' : 'Voz'}
                        </button>
                    </div>
                </div>

                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        <h2><MessageSquare className="inline-block mr-2" /> Chat con Nexa</h2>
                        <div className={styles.status}>
                            <div className={styles.statusDot}></div>
                            <span>En línea • Listo para conversar</span>
                        </div>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.message} ${msg.sender === 'ai' ? styles.aiMessage : styles.userMessage}`}>
                                <div className={styles.messageSender}>
                                    {msg.sender === 'ai' ? <><Bot size={14} /> Nexa IA {msg.isVoice && '(Voz)'}</> : <><User size={14} /> Tú</>}
                                </div>
                                <div className={styles.messageBubble}>
                                    {msg.isVoice && <Volume2 className="inline-block mr-2" size={14} />}
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className={styles.typingIndicator}>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                                <span className="text-sm text-cyan-300 ml-2">Nexa está escribiendo...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className={styles.chatInputContainer}>
                        <input
                            type="text"
                            className={styles.chatInput}
                            placeholder="Escribe tu mensaje aquí..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className={styles.sendBtn} onClick={handleSendMessage}>
                            <Send size={18} /> Enviar
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.features}>
                <div className={styles.feature}>
                    <Brain className="mx-auto mb-2 text-cyan-400" size={32} />
                    <h3>IA Avanzada</h3>
                    <p>Modelo de lenguaje potente y contextual</p>
                </div>
                <div className={styles.feature}>
                    <Volume2 className="mx-auto mb-2 text-cyan-400" size={32} />
                    <h3>Voz Natural</h3>
                    <p>Síntesis de voz realista</p>
                </div>
                <div className={styles.feature}>
                    <Expand className="mx-auto mb-2 text-cyan-400" size={32} />
                    <h3>Holograma 3D</h3>
                    <p>Visualización interactiva en 3D</p>
                </div>
                <div className={styles.feature}>
                    <Globe className="mx-auto mb-2 text-cyan-400" size={32} />
                    <h3>Multilenguaje</h3>
                    <p>Soporte para múltiples idiomas</p>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>Nexa Holograma Chat • Tecnología de IA de última generación • © 2026</p>
            </footer>
        </div>
    );
}
