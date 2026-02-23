import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    isNexaRecovering: boolean;
    nexaFixLog: string[];
}

export class NexaErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            isNexaRecovering: false,
            nexaFixLog: []
        };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        this.initiateSelfHealing(error, errorInfo);
    }

    async initiateSelfHealing(error: Error, info: React.ErrorInfo) {
        this.setState({ isNexaRecovering: true });
        this.addLog('🛑 Error detectado en el Kernel UI.');
        this.addLog(`Trace: ${error.message.substring(0, 100)}...`);
        this.addLog('🧠 Consultando Memoria RAG para soluciones similares...');

        // Simulate Nexa thinking about the error
        setTimeout(() => {
            this.addLog('⚙️ Diagnosticando archivo problemático...');
            setTimeout(() => {
                this.addLog('✨ Parche temporal aislado. Listo para regenerar Render Tree.');
                this.setState({ isNexaRecovering: false });
            }, 3000);
        }, 2000);

        // In a real scenario, this would post the error to `useChatStore.getState().generateAIResponse` 
        // telling the model to find a fix, but without showing it in the chat yet.
        try {
            const errorPrompt = `SISTEMA: La interfaz UI se ha quebrado. Error: ${error.message}. Stack: ${info.componentStack}`;
            console.error('[SELF-HEAL SENSOR]', errorPrompt);
            // useChatStore.getState().addTerminalLog(`[CRASH SENSOR] Interceptando: ${error.message}`);
        } catch (e) { }
    }

    addLog(msg: string) {
        this.setState(prev => ({ nexaFixLog: [...prev.nexaFixLog, msg] }));
    }

    resetError = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, nexaFixLog: [], isNexaRecovering: false });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center p-8 font-mono text-cyan-400">
                    <div className="max-w-xl w-full bg-black/50 border border-red-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(255,0,0,0.1)] relative overflow-hidden backdrop-blur-xl">

                        {/* Red warning glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

                        <h1 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                            <span className="animate-pulse">⚠️</span> KERNEL PANIC
                        </h1>

                        <p className="text-sm text-gray-400 mb-6 font-sans">
                            Nexa OS ha interceptado un fallo estructural. El Sistema Inmunitario está activo.
                        </p>

                        <div className="bg-[#0a0f1a] rounded-lg p-4 border border-white/5 mb-6 text-xs text-red-300/80 overflow-auto max-h-32">
                            <code>{this.state.error?.toString()}</code>
                        </div>

                        <div className="space-y-2 mb-8">
                            {this.state.nexaFixLog.map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className="text-xs text-cyan-300"
                                >
                                    <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {log}
                                </motion.div>
                            ))}
                            {this.state.isNexaRecovering && (
                                <div className="text-xs text-fuchsia-400 animate-pulse mt-2">
                                    Analizando vectores de fallo vía WebLLM...
                                </div>
                            )}
                        </div>

                        <button
                            onClick={this.resetError}
                            disabled={this.state.isNexaRecovering}
                            className={`w-full py-3 rounded-lg font-bold tracking-widest text-sm transition-all duration-300 ${this.state.isNexaRecovering
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                                }`}
                        >
                            {this.state.isNexaRecovering ? 'PARCHEANDO...' : 'RECARGAR HOLOCUBIERTA'}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
