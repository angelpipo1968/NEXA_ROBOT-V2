import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error in auth callback:', error.message);
                navigate('/auth');
                return;
            }

            // If we have a session, check where we should go
            if (data.session) {
                // Check if it's a password recovery flow
                const hash = window.location.hash;
                if (hash && hash.includes('type=recovery')) {
                    navigate('/auth?mode=reset');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/auth');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-zinc-400 animate-pulse">Verificando sesión...</p>
            </div>
        </div>
    );
}
