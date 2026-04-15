'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditorProps {
    initialContent?: string;
    bookId?: string;
    onContentChange?: (content: string) => void;
}

export function Editor({ initialContent = '', bookId, onContentChange }: EditorProps) {
    const [content, setContent] = useState(initialContent);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (initialContent !== content) {
            setContent(initialContent);
        }
    }, [initialContent]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        onContentChange?.(newContent);
    };

    return (
        <div className="h-full flex flex-col">
            <textarea
                ref={editorRef}
                value={content}
                onChange={handleChange}
                placeholder="Empieza a escribir tu obra maestra..."
                className="flex-1 w-full bg-transparent text-lg leading-relaxed resize-none focus:outline-none font-serif text-[var(--text-primary,#e5e7eb)] placeholder:text-gray-600 selection:bg-purple-500/30"
                spellCheck={false}
            />
        </div>
    );
}

export default Editor;
