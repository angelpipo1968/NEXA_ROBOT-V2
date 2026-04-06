import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, Zap, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';

export default function GmailHub() {
    const mockEmails = [
        { id: '1', sender: 'GitHub', subject: 'Actualización de Repositorio: nexa-core', time: '10m', type: 'success' },
        { id: '2', sender: 'Vercel', subject: 'Despliegue de Producción Completado (v4.0.1)', time: '2h', type: 'info' },
        { id: '3', sender: 'Supabase', subject: 'Respaldo de Base de Datos Diario Finalizado', time: '5h', type: 'success' },
        { id: '4', sender: 'Nexa Security', subject: 'Nuevo Intento de Enlace Neural Detectado', time: '1d', type: 'warning' },
    ];

    return (
        <div className="flex flex-col h-full w-full p-4 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white neon-glow-text">GMAIL HUB <span className="text-blue-500 text-sm font-light ml-2 uppercase">Neural Sync</span></h1>
                    <p className="text-zinc-500 text-sm">Centro de comunicaciones unificadas de Nexa OS</p>
                </div>
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-cyan-400"
                >
                    <RefreshCcw size={20} />
                </motion.button>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard 
                    icon={Shield} 
                    label="Seguridad" 
                    status="Protegido" 
                    color="text-green-400" 
                    bg="bg-green-500/10"
                />
                <StatusCard 
                    icon={Zap} 
                    label="Latencia" 
                    status="12ms" 
                    color="text-cyan-400" 
                    bg="bg-cyan-500/10"
                />
                <StatusCard 
                    icon={Mail} 
                    label="Pendientes" 
                    status="0" 
                    color="text-purple-400" 
                    bg="bg-purple-500/10"
                />
            </div>

            {/* Recent Neural Feed / Emails */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Sincronización Reciente</h2>
                </div>
                
                {mockEmails.map((email, i) => (
                    <motion.div
                        key={email.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-4 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${email.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {email.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{email.sender}</h3>
                                <p className="text-xs text-zinc-500 truncate max-w-md">{email.subject}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600">{email.time} ago</span>
                    </motion.div>
                ))}
            </div>

            {/* Action Area */}
            <div className="flex justify-center pt-6">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black tracking-widest uppercase text-xs transition-all shadow-lg shadow-blue-900/20">
                    Sincronizar Todo el Sistema
                </button>
            </div>
        </div>
    );
}

function StatusCard({ icon: Icon, label, status, color, bg }: any) {
    return (
        <div className={`glass-panel p-4 flex items-center gap-4 ${bg}`}>
            <Icon className={color} size={24} />
            <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
                <p className={`text-lg font-black ${color}`}>{status}</p>
            </div>
        </div>
    );
}
