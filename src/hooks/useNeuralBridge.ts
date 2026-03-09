import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { localAI } from '@/lib/services/localAI';

export function useNeuralBridge() {
    const content = useProjectStore((state) => state.projectData.content);
    const { addNode, nodes } = useThoughtStore();
    const lastContentRef = useRef('');

    useEffect(() => {
        const debounce = setTimeout(async () => {
            if (content === lastContentRef.current || content.length < 50) return;
            lastContentRef.current = content;

            // Extract last paragraph for contextual focus
            const lastParagraph = content.split('\n').pop() || '';
            const entities = await localAI.extractEntities(lastParagraph);

            entities.forEach(entity => {
                // Check if node already exists to avoid duplicates
                const exists = nodes.some(n => n.label.includes(entity));
                if (!exists) {
                    addNode({
                        id: `entity-${entity}-${Date.now()}`,
                        label: `ENTIDAD: ${entity}`,
                        val: 12,
                        color: '#34d399',
                        details: `Detectado automáticamente en el flujo de escritura neural.`,
                        timestamp: Date.now()
                    });
                }
            });
        }, 3000); // 3s debounce

        return () => clearTimeout(debounce);
    }, [content, addNode, nodes]);
}
