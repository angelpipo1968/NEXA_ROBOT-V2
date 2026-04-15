'use client';

import React from 'react';
import { WritingTemplate } from '@/data/writing-templates';
import { WRITING_TEMPLATES } from '@/data/writing-templates';

interface QuickStartProps {
    onUseTemplate: (template: WritingTemplate) => void;
}

export function QuickStart({ onUseTemplate }: QuickStartProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Inicio Rápido</h2>
                <p className="text-gray-500 dark:text-gray-400">Selecciona una plantilla para comenzar</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WRITING_TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onUseTemplate(template)}
                        className="p-5 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-left hover:border-purple-500/50 transition-all space-y-2 group"
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-400 transition-colors">
                            {template.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{template.subtitle}</p>
                        <div className="flex gap-3 text-xs text-gray-400">
                            <span>{template.chapters} capítulos</span>
                            <span>{template.time}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuickStart;
