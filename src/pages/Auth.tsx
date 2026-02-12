import { AuthForm } from '@/components/auth/AuthForm';
import { Shield } from 'lucide-react';

export default function AuthPage() {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-xl shadow-blue-500/5">
                    <Shield className="w-10 h-10 text-blue-500" />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nexa AI</h1>
                    <p className="text-zinc-500 text-sm mt-1">Tu sistema operativo de inteligencia artificial</p>
                </div>
            </div>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <AuthForm />
            </div>

            <div className="mt-12 text-zinc-600 text-xs flex gap-6 animate-in fade-in duration-1000 delay-500">
                <a href="#" className="hover:text-zinc-400 transition-colors">Términos de servicio</a>
                <a href="#" className="hover:text-zinc-400 transition-colors">Política de privacidad</a>
                <a href="#" className="hover:text-zinc-400 transition-colors">Soporte</a>
            </div>
        </div>
    );
}
