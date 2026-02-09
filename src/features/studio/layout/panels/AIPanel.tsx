
"use client";

import React, { useState } from 'react';
import { useNexa } from '@/context/NexaContext';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    sender: 'user' | 'ai';
    content: string;
}

export default function AIPanel() {
    const { projectData } = useNexa();
    const [messages, setMessages] = useState<ChatMessage[]>([{
        sender: 'ai',
        content: '¡Hola! Soy Nexa, tu asistente de escritura con IA. ¿En qué puedo ayudarte hoy?'
    }]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper to call backend
    const callAI = async (text: string, mode: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mode })
            });
            const data = await res.json();

            if (data.suggestions) {
                const content = data.suggestions.map((s: any) => {
                    if (typeof s === 'string') return s;
                    return `**${s.titulo || 'Idea'}**\n${s.contenido || s.descripcion || s.contexto}`;
                }).join('\n\n');
                return content;
            }
            return "No se generaron resultados.";
        } catch (e) {
            console.error(e);
            return "Error al conectar con el servidor de IA.";
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText;
        setMessages(prev => [...prev, { sender: 'user', content: userMsg }]);
        setInputText('');
        setLoading(true);

        // Call "general" ideas mode effectively as chat for now
        const response = await callAI(userMsg, 'ideas');

        setMessages(prev => [...prev, { sender: 'ai', content: response }]);
        setLoading(false);
    };

    const handleToolClick = async (tool: string) => {
        if (!projectData.content) {
            alert("Escribe algo en el editor primero.");
            return;
        }

        setMessages(prev => [...prev, { sender: 'user', content: `[Herramienta: ${tool}] Analizando texto...` }]);
        const response = await callAI(projectData.content.substring(0, 1000), tool); // Limit context
        setMessages(prev => [...prev, { sender: 'ai', content: response }]);
    };

    return (
        <div className="panel-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
                <h2><i className="fas fa-brain"></i> Asistente de IA</h2>
                <p className="panel-subtitle">Colabora con inteligencia artificial para mejorar tu escritura</p>
            </div>

            <div className="ai-assistant-container">
                <div className="ai-tools">
                    <div className="tool-card" onClick={() => handleToolClick('ideas')}>
                        <div className="tool-header">
                            <div className="tool-icon"><i className="fas fa-lightbulb"></i></div>
                            <div className="tool-title">Expandir Texto</div>
                        </div>
                        <p className="tool-desc">Genera ideas creativas basadas en tu texto.</p>
                    </div>

                    <div className="tool-card" onClick={() => handleToolClick('investigacion')}>
                        <div className="tool-header">
                            <div className="tool-icon"><i className="fas fa-search"></i></div>
                            <div className="tool-title">Investigación</div>
                        </div>
                        <p className="tool-desc">Busca contexto y datos reales (Brave Search).</p>
                    </div>

                    <div className="tool-card" onClick={() => handleToolClick('imagenes')}>
                        <div className="tool-header">
                            <div className="tool-icon"><i className="fas fa-image"></i></div>
                            <div className="tool-title">Inspiración Visual</div>
                        </div>
                        <p className="tool-desc">Encuentra referencias visuales (Google Images).</p>
                    </div>

                    <div className="tool-card" onClick={() => handleToolClick('trama')}>
                        <div className="tool-header">
                            <div className="tool-icon"><i className="fas fa-project-diagram"></i></div>
                            <div className="tool-title">Trama</div>
                        </div>
                        <p className="tool-desc">Estructura puntos de giro y conflictos.</p>
                    </div>
                </div>

                <div className="ai-chat">
                    <div className="chat-header">
                        <h3>Conversación con Nexa IA</h3>
                    </div>

                    <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.sender}`}>
                                <div className="message-sender">{msg.sender === 'user' ? 'Tú' : 'Nexa IA'}</div>
                                <div className="message-bubble">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && <div className="message ai"><div className="message-bubble">Pensando...</div></div>}
                    </div>

                    <div className="chat-input-container">
                        <textarea
                            className="chat-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        ></textarea>
                        <button className="send-btn" onClick={handleSend}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
