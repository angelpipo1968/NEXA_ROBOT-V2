import React from 'react';
import { motion } from 'framer-motion';
import { selfHealing } from '@/lib/selfHealing';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    isNexaRecovering: boolean;
    nexaFixLog: string[];
    diagnosis?: string;
    suggestedPatch?: string;
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

    componentDidMount() {
        window.addEventListener('nexa-immune-patch', this.handleImmunePatch as any);
    }

    componentWillUnmount() {
        window.removeEventListener('nexa-immune-patch', this.handleImmunePatch as any);
    }

    handleImmunePatch = (event: CustomEvent) => {
        const { diagnosis, patch } = event.detail;
        this.setState({
            diagnosis,
            suggestedPatch: patch,
            isNexaRecovering: false
        });
        this.addLog(`🛡️ PARCHE INMUNITARIO DISPONIBLE`);
        this.addLog(`Diagnóstico: ${diagnosis.substring(0, 100)}...`);
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
        this.addLog('🧠 Activando Sistema Inmunitario...');

        try {
            await selfHealing.handleError({
                message: error.message,
                stack: info.componentStack,
                error: error,
                source: 'UI_BOUNDARY'
            });
        } catch (e) {
            this.addLog('⚠️ El Sistema Inmunitario offline.');
            this.setState({ isNexaRecovering: false });
        }
    }

    addLog(msg: string) {
        this.setState(prev => ({ nexaFixLog: [...prev.nexaFixLog, msg] }));
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            nexaFixLog: [],
            isNexaRecovering: false,
            diagnosis: undefined,
            suggestedPatch: undefined
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center p-8 font-mono text-cyan-400 overflow-y-auto">
                    <div className="max-w-2xl w-full bg-black/50 border border-red-500/30 p-8 rounded-3xl shadow-[0_0_100px_rgba(255,0,0,0.15)] relative overflow-hidden backdrop-blur-2xl">

                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-red-500 tracking-tighter flex items-center gap-3">
                                    <span className="animate-ping w-2 h-2 bg-red-500 rounded-full inline-block" />
                                    KERNEL PANIC
                                </h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Nexa Security Protocol #404-IMMUNE</p>
                            </div>
                            <div className="px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-[9px] font-bold text-red-400 uppercase">
                                UI Subsystem Fault
                            </div>
                        </div>

                        {/* Error Report */}
                        <div className="bg-red-900/10 rounded-2xl p-6 border border-red-500/10 mb-8">
                            <p className="text-xs text-red-400/80 mb-2 font-black uppercase tracking-wider">Exception Details</p>
                            <code className="text-xs text-red-200 block break-all leading-relaxed">
                                {this.state.error?.toString()}
                            </code>
                        </div>

                        {/* Healing Log */}
                        <div className="space-y-3 mb-8 bg-black/40 rounded-2xl p-6 border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                            {this.state.nexaFixLog.map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className="text-[10px] flex items-start gap-4"
                                >
                                    <span className="text-gray-600 font-mono shrink-0">{new Date().toLocaleTimeString()}</span>
                                    <span className={log.includes('🛡️') ? 'text-green-400 font-bold' : 'text-cyan-400/80'}>{log}</span>
                                </motion.div>
                            ))}
                            {this.state.isNexaRecovering && (
                                <div className="flex items-center gap-3 text-[10px] text-fuchsia-400 animate-pulse mt-4">
                                    <div className="w-4 h-4 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
                                    Generando parche inmunológico vía RAG...
                                </div>
                            )}
                        </div>

                        {/* Diagnosis and Patch */}
                        {this.state.diagnosis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl"
                            >
                                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="text-cyan-500">🛡️</span> NEXA DIAGNOSIS
                                </h4>
                                <p className="text-xs text-cyan-100/80 leading-relaxed mb-4">{this.state.diagnosis}</p>

                                {this.state.suggestedPatch && (
                                    <div className="mt-4">
                                        <p className="text-[9px] text-cyan-500 font-black uppercase mb-2">Patch Sugerido (Diff)</p>
                                        <pre className="text-[10px] bg-black/60 p-4 rounded-xl border border-white/5 text-green-400 overflow-x-auto">
                                            {this.state.suggestedPatch}
                                        </pre>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={this.resetError}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                            >
                                Ignorar y Reiniciar
                            </button>
                            <button
                                onClick={() => alert("Solicitud de Parche enviada al Agente de Nexa OS.")}
                                disabled={!this.state.suggestedPatch}
                                className="flex-[2] py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                Aplicar Auto-Fix
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
