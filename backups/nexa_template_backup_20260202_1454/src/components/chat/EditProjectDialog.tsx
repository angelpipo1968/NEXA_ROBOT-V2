'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'; // Assuming these exist, matching Shadcn pattern
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Folder,
    TrendingUp,
    Book,
    PenLine,
    Heart,
    Plane,
    ChevronRight,
    DollarSign,
    Briefcase
} from 'lucide-react';

interface EditProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTitle?: string;
    onSave: (newTitle: string) => void;
}

export function EditProjectDialog({
    open,
    onOpenChange,
    initialTitle = '',
    onSave,
}: EditProjectDialogProps) {
    const [title, setTitle] = useState(initialTitle);

    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle]);

    const categories = [
        { label: 'Inversión', icon: DollarSign },
        { label: 'Tarea', icon: Book }, // Or Briefcase? Image: Open Badge/Book. Book is fine.
        { label: 'Escritura', icon: PenLine },
        { label: 'Salud', icon: Heart },
        { label: 'Viajar', icon: Plane },
    ];
    // Note: Request image uses Dollar sign for 'Inversión'. I check imports.
    // 'TrendingUp' was imported. I should use 'DollarSign' if available or stick to 'TrendingUp'.
    // I'll stick to Imported names or add DollarSign if I can.

    // Actually, I'll rewrite the component to match the image exactly.
    // Image structure:
    // Header: "Editar proyecto" (left align? Image looks left aligned title but close button is right)
    // Input row: Folder Icon (left formatted) + Input
    // Badges/Chips: Icons + Text
    // "Configuración avanzada >"
    // Footer: "Guardar" button (Primary color)

    const handleCategoryClick = (categoryLabel: string) => {
        // Placeholder for category logic
        console.log('Category clicked:', categoryLabel);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#151515] border-gray-200 dark:border-gray-800 p-6 rounded-2xl gap-6 shadow-2xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Editar proyecto</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {/* Project Name Input */}
                    <div className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#6B47FF]/20 focus-within:border-[#6B47FF]">
                        <div className="pl-2 text-gray-400">
                            <Folder size={20} />
                        </div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nombre del proyecto"
                            className="border-0 bg-transparent focus-visible:ring-0 px-2 h-auto text-base text-gray-800 dark:text-gray-200 placeholder:text-gray-400 font-normal"
                        />
                    </div>

                    {/* Categories / Examples */}
                    <div className="flex flex-wrap gap-2.5">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => handleCategoryClick(cat.label)}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#1F1F1F] transition-colors text-sm text-gray-600 dark:text-gray-300 font-medium"
                            >
                                <cat.icon size={15} className="text-gray-400 dark:text-gray-400" />
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Advanced Settings */}
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity mt-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-normal">
                            Configuración avanzada
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>

                <DialogFooter className="">
                    <Button
                        onClick={() => {
                            onSave(title);
                            onOpenChange(false);
                        }}
                        className="ml-auto bg-[#5841D8] hover:bg-[#4B36C8] text-white rounded-full px-8 py-2 h-auto text-base font-medium shadow-md shadow-indigo-500/20"
                    >
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
