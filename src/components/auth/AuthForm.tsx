import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, Lock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            full_name: email.split('@')[0],
                            plan: 'free'
                        }
                    }
                });

                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu email para confirmar.');
            } else if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                navigate('/');
            } else if (mode === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/#/auth?mode=reset`,
                });
                if (error) throw error;
                alert('Instrucciones enviadas a tu email.');
                setMode('login');
            } else if (mode === 'reset_password') {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                alert('Contraseña actualizada con éxito.');
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
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) alert(error.message);
    };

    return (
        <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            {mode === 'forgot_password' && (
                <button
                    onClick={() => setMode('login')}
                    className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-4 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Volver
                </button>
            )}

            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                {mode === 'login' ? 'Bienvenido a Nexa AI' :
                    mode === 'signup' ? 'Crear Cuenta' :
                        mode === 'reset_password' ? 'Nueva Contraseña' :
                            'Recuperar Contraseña'}
            </h2>

            {mode === 'login' && (
                <div className="space-y-3 mb-8">
                    <Button
                        onClick={handleGuestLogin}
                        className="w-full h-12 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 font-bold transition-all shadow-sm"
                    >
                        Continuar como invitado
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setMode('signup')}
                        className="w-full h-12 border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400/20 dark:hover:bg-blue-400/10 font-semibold"
                    >
                        Crear una cuenta nueva
                    </Button>
                </div>
            )}

            {mode === 'forgot_password' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-zinc-500 mb-4">
                        Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                    </p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-950 pl-10 h-10"
                                required
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Enviar instrucciones'}
                    </Button>
                </form>
            )}

            {mode === 'reset_password' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-zinc-500 mb-4">
                        Crea una nueva contraseña segura para tu cuenta.
                    </p>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-950 pl-10 h-10"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Actualizar contraseña'}
                    </Button>
                </form>
            )}

            {(mode === 'login' || mode === 'signup') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">O inicia sesión</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-950 pl-10 h-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Contraseña</label>
                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot_password')}
                                    className="text-xs text-blue-500 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-950 pl-10 h-10"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                            mode === 'login' ? 'Entrar' : 'Registrarse'
                        )}
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Redes sociales</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full h-10 flex items-center justify-center gap-3 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </Button>

                    {mode === 'signup' && (
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="w-full text-center text-sm text-blue-500 hover:underline mt-4 font-medium"
                        >
                            ¿Ya tienes cuenta? Inicia sesión
                        </button>
                    )}
                </form>
            )}
        </div>
    );
}
