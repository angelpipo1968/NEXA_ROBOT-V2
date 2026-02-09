'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatContainer } from '@/components/chat/container';
// Reusing ChatContainer partially or implementing Hero directly? 
// User asked to "Copy content of main section". 
// Previous 'page.tsx' logic used ChatContainer.
// I'll make Home serve as the Landing/Hero and use the ChatInput to redirect.

import { useChatStore } from '@/store/useChatStore';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const setInput = useChatStore(state => state.setInput);
  const [localInput, setLocalInput] = useState('');

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && localInput.trim()) {
      setInput(localInput);
      router.push('/chat'); // Navigate to chat with input pre-filled in store
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in-95 duration-700 relative">
      {/* Hero styling from previous container.tsx */}
      <div className="vp-hero flex-col text-center min-h-[auto] p-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="vp-card-label text-[10px] m-0">Sistema Operativo v1.0</span>
        </div>

        <h1 className="vp-hero-title mb-6">
          NEXA OS
        </h1>

        <p className="vp-hero-subtitle mx-auto text-center mb-12">
          Tu centro de comando para la inteligencia artificial. <br />
          Diseño. Código. Visión.
        </p>

        {/* Input Simulation for Home */}
        <div className="vp-input-section w-full max-w-2xl px-0 mb-12">
          <div className="vp-input-shell">
            <div className="vp-input-bar">
              <input
                className="vp-input"
                placeholder="Escribe un mensaje o describe tu proyecto..."
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyDown={handleInputEnter}
                autoFocus
              />
              <div className="vp-input-right">
                <button
                  className="vp-send"
                  onClick={() => {
                    if (localInput.trim()) {
                      setInput(localInput);
                      router.push('/chat');
                    }
                  }}
                >
                  Comenzar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="vp-actions justify-center gap-6 mt-8">
          <div className="vp-card vp-card--small cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/projects')}>
            <p className="vp-card-label">Módulo</p>
            <p className="vp-card-value">Proyectos</p>
          </div>
          <div className="vp-card vp-card--small cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push('/studio')}>
            <p className="vp-card-label">Módulo</p>
            <p className="vp-card-value">Studio</p>
          </div>
          <div className="vp-card vp-card--small cursor-pointer hover:bg-white/5 transition-colors" onClick={() => window.open('https://github.com/nexa-ai', '_blank')}>
            <p className="vp-card-label">Recurso</p>
            <p className="vp-card-value">Documentación</p>
          </div>
        </div>
      </div>
    </div>
  );
}
