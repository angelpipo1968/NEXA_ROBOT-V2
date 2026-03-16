import { AuthForm } from '@/components/auth/AuthForm';
import { Shield } from 'lucide-react';

export default function AuthPage() {
    return (
        <div className="h-[100dvh] w-full bg-[#0a0a0f] flex flex-col items-center justify-center p-2 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <AuthForm />
            </div>

            <div className="mt-6 text-zinc-600 text-[10px] flex gap-4 animate-in fade-in duration-1000 delay-500">
                <a href="#" className="hover:text-zinc-400 transition-colors">Términos de servicio</a>
                <a href="#" className="hover:text-zinc-400 transition-colors">Política de privacidad</a>
                <a href="#" className="hover:text-zinc-400 transition-colors">Soporte</a>
            </div>
        </div>
    );
}
