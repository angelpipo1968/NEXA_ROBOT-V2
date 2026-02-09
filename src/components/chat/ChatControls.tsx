'use client';

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface MessageActionsProps {
    messageId: string;
    onDelete: (messageId: string) => void;
    onEdit?: (messageId: string, newContent: string) => void;
}

export function MessageActions({ messageId, onDelete, onEdit }: MessageActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(messageId, '')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-red-500">Borrar mensaje</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Borrar mensaje?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El mensaje será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete(messageId);
                                setShowDeleteDialog(false);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white dark:text-white"
                        >
                            Borrar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Componente para borrar TODO el chat
export function ClearChatButton() {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearChat = () => {
        localStorage.removeItem('nexa-chat-storage');
        window.location.reload();
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
                <Trash2 className="h-4 w-4" />
                Borrar todo el chat
            </button>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Borrar todo el historial?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminarán todos los mensajes de esta conversación.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearChat}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Borrar todo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
