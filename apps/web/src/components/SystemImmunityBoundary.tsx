'use client';

import React, { Component, ErrorInfo } from 'react';
import { selfHealing } from '@/lib/selfHealing';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
    children: any;
}

interface State {
    hasError: boolean;
    error: Error | null;
    patchData: any | null;
}

export class SystemImmunityBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, patchData: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("SystemImmunityBoundary caught an error:", error, errorInfo);
        
        // Ensure the selfHealing instance exists before calling it
        if (selfHealing) {
            selfHealing.handleError({
                message: error.message,
                error: error,
                stack: errorInfo.componentStack
            });
        }
    }

    componentDidMount() {
        if (typeof window !== 'undefined') {
            window.addEventListener('nexa-immune-patch', this.handleImmunePatch as EventListener);
        }
    }

    componentWillUnmount() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('nexa-immune-patch', this.handleImmunePatch as EventListener);
        }
    }

    handleImmunePatch = (event: CustomEvent) => {
        this.setState({ patchData: event.detail });
    };

    resetBoundary = () => {
        this.setState({ hasError: false, error: null, patchData: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white p-8 font-mono z-[9999] fixed inset-0">
                    <div className="max-w-2xl w-full border border-red-500/30 bg-red-500/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <ShieldAlert className="text-red-500 w-16 h-16 mb-6 animate-pulse" />
                        <h1 className="text-3xl font-bold text-red-500 mb-2">SYSTEM FAILURE</h1>
                        <p className="text-red-300 mb-6 text-sm break-all">{this.state.error?.message}</p>
                        
                        {!this.state.patchData ? (
                            <div className="flex items-center gap-3 text-blue-400 bg-blue-500/10 border border-blue-500/30 px-6 py-4 rounded-xl">
                                <Activity className="animate-spin w-5 h-5" />
                                <span>Self-Healing Kernel is analyzing the anomaly...</span>
                            </div>
                        ) : (
                            <div className="w-full text-left bg-black/50 border border-white/10 rounded-xl p-6 mt-4">
                                <div className="flex items-center gap-2 text-green-400 mb-4 border-b border-white/10 pb-4">
                                    <Cpu className="w-5 h-5" />
                                    <span className="font-bold tracking-widest">PATCH GENERATED (IN-MEMORY)</span>
                                </div>
                                <div className="text-sm text-gray-300 mb-4">
                                    <strong>Diagnosis:</strong> {this.state.patchData.diagnosis || "Unknown Error State"}
                                </div>
                                {(this.state.patchData.patch || this.state.patchData.autoFixCommand) && (
                                    <div className="bg-neutral-900 rounded p-4 overflow-x-auto text-xs font-mono text-green-300 mb-6 border border-white/5 whitespace-pre-wrap">
                                        <pre>{this.state.patchData.patch || this.state.patchData.autoFixCommand}</pre>
                                    </div>
                                )}
                                <button 
                                    onClick={this.resetBoundary}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-bold tracking-widest text-sm uppercase"
                                >
                                    Reboot Subsystem Interface
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
