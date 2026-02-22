import React from 'react';
import { Plus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileTopBarProps {
    onPlusClick?: () => void;
    isGuest?: boolean;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ onPlusClick, isGuest }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed top-0 left-0 w-full h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-white dark:bg-[#0a0a0f] border-b border-gray-100 dark:border-white/5 z-40 md:hidden flex items-center justify-between px-4 transition-colors">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nexa AI</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onPlusClick}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400"
                >
                    <Plus size={20} />
                </button>

                {isGuest && (
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <span>Log in</span>
                    </button>
                )}
            </div>
        </div>
    );
};
