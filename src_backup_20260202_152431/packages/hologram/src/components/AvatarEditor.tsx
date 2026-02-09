
import React, { useEffect, useRef, useState } from 'react';
import { HologramSystem } from '../core/HologramSystem';

export interface AvatarEditorProps {
    initialShape?: 'sphere' | 'cube' | 'torus' | 'pyramid';
    initialColor?: string;
    onSave?: (config: any) => void;
}

export function AvatarEditor({
    initialShape = 'sphere',
    initialColor = '#00ffff',
    onSave
}: AvatarEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [system, setSystem] = useState<HologramSystem | null>(null);

    // State for form controls
    const [shape, setShape] = useState<'sphere' | 'cube' | 'torus' | 'pyramid'>(initialShape);
    const [color, setColor] = useState(initialColor);

    useEffect(() => {
        if (!canvasRef.current) return;

        const sys = new HologramSystem();
        sys.attach(canvasRef.current);
        // Initialize with basic defaults
        sys.initialize({
            name: 'Preview',
            type: 'editor',
            personality: 'neutral',
            appearance: {}
        }, {
            type: 'studio',
            lighting: 'studio',
            effects: []
        }).then(() => {
            setSystem(sys);
            // Apply initial state
            sys.setShape(initialShape);
            sys.setColor(initialColor);
        });

        // Cleanup
        return () => {
            // sys.dispose() if available
        };
    }, []);

    const handleShapeChange = (newShape: 'sphere' | 'cube' | 'torus' | 'pyramid') => {
        setShape(newShape);
        system?.setShape(newShape);
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        system?.setColor(newColor);
    };

    const handleSave = () => {
        if (onSave) {
            onSave({ shape, color });
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full gap-6 bg-gray-900 p-6 rounded-xl text-white">
            {/* Preview Area */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative min-h-[400px] border border-cyan-900/50 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-xs text-cyan-500 font-mono">
                    LIVE PREVIEW
                </div>
            </div>

            {/* Controls Area */}
            <div className="w-full md:w-80 flex flex-col gap-6 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-2">Avatar Customization</h2>

                {/* Shape Selector */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Base Shape</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['sphere', 'cube', 'torus', 'pyramid'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleShapeChange(s as any)}
                                className={`px-4 py-3 rounded-lg capitalize transition-all duration-200 border ${shape === s
                                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                                        : 'bg-gray-700 border-transparent hover:bg-gray-600 text-gray-300'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Picker */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Hologram Color</label>
                    <div className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="font-mono text-gray-300">{color}</span>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-700">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold shadow-lg transform transition-all active:scale-95"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
