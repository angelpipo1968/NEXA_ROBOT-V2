import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, Lock, ChevronLeft, Shield, Key, UserCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password' | 'reset_password'>('login');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const urlMode = searchParams.get('mode');
        if (urlMode === 'reset') {
            setMode('reset_password');
            // Verificar si tenemos sesión al entrar
            supabase.auth.getSession().then(({ data }: any) => {
                if (!data.session) {
                    console.warn('⚠️ NEXA: No se encontró sesión para restablecer contraseña.');
                }
            });
        } else if (urlMode === 'signup') {
            setMode('signup');
        } else if (urlMode === 'login') {
            setMode('login');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/#/auth/callback`,
                        data: {
                            full_name: email.split('@')[0],
                            plan: 'free'
                        }
                    }
                });

                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu email para completar la activación neural.');
            } else if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                navigate('/');
            } else if (mode === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/#/auth/callback`,
                });
                if (error) throw error;
                alert('Instrucciones de recuperación enviadas a tu núcleo de comunicaciones.');
                setMode('login');
            } else if (mode === 'reset_password') {
                // Verificar si hay una sesión activa antes de intentar actualizar
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error("Sesión de recuperación no detectada. Por favor, usa el enlace enviado a tu correo o intenta solicitar uno nuevo.");
                }

                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                alert('Sincronización de credenciales completada con éxito.');
                navigate('/');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        localStorage.setItem('nexa_guest', 'true');
        navigate('/');
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/#/auth/callback`
            }
        });

        if (error) alert(error.message);
    };

    return (
        <div className="relative min-h-[500px] flex items-center justify-center p-4">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md relative overflow-hidden glass-morphism border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl rounded-2xl"
            >
                {/* Header Section */}
                <div className="mb-2 text-center">
                    <motion.div
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 mb-2"
                    >
                        <Shield className="text-blue-400" size={18} />
                    </motion.div>
                    <h2 className="text-xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-1">
                        {mode === 'login' ? 'ACCESO NEURAL' :
                            mode === 'signup' ? 'NUEVO NÚCLEO' :
                                mode === 'reset_password' ? 'NUEVA LLAVE' :
                                    'RECUPERACIÓN'}
                    </h2>
                </div>

                {/* Mode Selector Tabs */}
                {(mode === 'login' || mode === 'signup') && (
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-3">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            INICIAR SESIÓN
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all rounded-lg ${mode === 'signup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            INSCRIBIRSE
                        </button>
                    </div>
                )}

                {!isSupabaseConfigured && (
                    <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 text-xs text-amber-200/80">
                        <AlertCircle className="shrink-0 text-amber-500" size={14} />
                        <div>
                            <span className="font-bold text-amber-500">MODO DEMO ACTIVO:</span> No se detectaron credenciales de Supabase. Puedes usar cualquier correo para probar.
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === 'login' && (
                            <div className="space-y-2 mb-3">
                                <Button
                                    onClick={handleGuestLogin}
                                    className="w-full h-9 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold transition-all group text-xs"
                                >
                                    <UserCircle className="mr-2 group-hover:text-amber-400 transition-colors" size={16} />
                                    Continuar como Invitado
                                </Button>
                                <div className="relative flex items-center gap-4 text-zinc-600 my-2">
                                    <div className="flex-1 h-px bg-zinc-800" />
                                    <span className="text-[8px] tracking-widest font-black uppercase">o sincroniza tu cuenta</span>
                                    <div className="flex-1 h-px bg-zinc-800" />
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-2.5">
                            {mode !== 'reset_password' && (
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Protocolo Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="identificador@neural.net"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 pl-10 h-9 text-zinc-200 placeholder:text-zinc-700 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {(mode === 'login' || mode === 'signup' || mode === 'reset_password') && (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Clave de Acceso</label>
                                        {mode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => setMode('forgot_password')}
                                                className="text-[8px] font-black text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                                            >
                                                <Key size={10} />
                                                ¿PERDISTE TU LLAVE?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 pl-10 h-9 text-zinc-200 placeholder:text-zinc-700 transition-all text-sm"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase text-[10px] shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border-t border-white/20"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    mode === 'login' ? 'INICIAR ENLACE' :
                                        mode === 'signup' ? 'CREAR NÚCLEO' :
                                            mode === 'forgot_password' ? 'ENVIAR PULSO' :
                                                'RECONFIGURAR LLAVE'
                                )}
                            </Button>
                        </form>

                        {(mode === 'login' || mode === 'signup') && (
                            <>
                                <div className="relative my-2 flex items-center gap-4">
                                    <div className="flex-1 h-px bg-zinc-800" />
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">REDES NEURALES</span>
                                    <div className="flex-1 h-px bg-zinc-800" />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full h-9 flex items-center justify-center gap-3 border-zinc-800 bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white transition-all font-bold text-[10px]"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google Neural Link
                                    </Button>

                                    {/* Specfic User Request: "Necesito mi contraseña" if Google fails/is not preferred */}
                                    <button
                                        type="button"
                                        onClick={() => setMode('forgot_password')}
                                        className="text-[11px] text-zinc-500 hover:text-blue-400 font-bold transition-colors mt-2 uppercase tracking-wide"
                                    >
                                        ¿PROBLEMAS CON GOOGLE? <span className="text-blue-500">NECESITO MI CONTRASEÑA</span>
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="mt-8 text-center space-y-2">
                            {(mode === 'forgot_password' || mode === 'reset_password') && (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors mx-auto font-bold"
                                >
                                    <ChevronLeft size={14} />
                                    VOLVER AL ACCESO
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer status-like bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            </motion.div>

            {/* Visual scanlines effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
