import React, { useState } from 'react';
import {
    Code, Play, File, Settings, Plus, Sparkles,
    LayoutTemplate, Cpu, Folder, Wand2, Monitor
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { WebGenerator } from '@/services/WebGenerator';
import { PreviewEngine } from './PreviewEngine';

export const DevStudio = () => {
    const {
        activeProject, activeFile,
        projects, addProject,
        setActiveProject, setActiveFile, updateProjectFile
    } = useChatStore();

    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('split');

    const handleCreateProject = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);

        try {
            // 1. Create Project Entry
            const projectName = prompt.split(' ').slice(0, 3).join('-').toLowerCase();
            addProject(projectName);

            // 2. Generate Files
            const files = await WebGenerator.generateProjectStructure({
                prompt,
                complexity: 'moderate'
            });

            // 3. Set Active
            const newProject = {
                id: Date.now().toString(),
                name: projectName,
                created_at: Date.now(),
                files
            };

            setActiveProject(newProject);
            if (files.length > 0) {
                // Try to find main entry point
                const entry = files.find(f => f.name === 'index.html' || f.name.endsWith('.tsx') || f.name.endsWith('.jsx')) || files[0];
                setActiveFile(entry);
            }

        } catch (e) {
            console.error(e);
            alert("Failed to generate project");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-full bg-[#1e1e1e] text-white font-mono overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-800 flex flex-col bg-[#181818]">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                        <Cpu className="text-purple-500" size={18} /> Nexa Dev
                    </span>
                    <button className="text-gray-400 hover:text-white"><Settings size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {activeProject ? (
                        <div>
                            <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                {activeProject.name}
                                <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded">APP</span>
                            </div>
                            <div className="space-y-0.5">
                                {activeProject.files.map(file => (
                                    <div
                                        key={file.path}
                                        onClick={() => setActiveFile(file)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm ${activeFile?.path === file.path ? 'bg-purple-900/30 text-purple-300' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                    >
                                        <File size={14} />
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center mt-10 text-gray-500">
                            <p className="text-sm">No active project</p>
                        </div>
                    )}
                </div>

                {/* AI Input */}
                <div className="p-4 border-t border-gray-800 bg-[#151515]">
                    <div className="mb-2 flex items-center gap-2 text-purple-400 text-xs font-bold">
                        <Sparkles size={12} /> AI Web Generator
                    </div>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your web app..."
                        className="w-full bg-[#252525] border border-gray-700 rounded p-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500 h-20 resize-none mb-2"
                    />
                    <button
                        onClick={handleCreateProject}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? <LayoutTemplate className="animate-spin" size={14} /> : <Wand2 size={14} />}
                        {isGenerating ? 'Architecting...' : 'Generate Project'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-10 bg-[#1e1e1e] border-b border-gray-800 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                        {activeFile && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border-t-2 border-purple-500 text-gray-200 text-sm">
                                <File size={14} className="text-purple-400" />
                                {activeFile.name}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 bg-gray-800 rounded p-0.5">
                        <button onClick={() => setViewMode('code')} className={`p-1.5 rounded ${viewMode === 'code' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><Code size={14} /></button>
                        <button onClick={() => setViewMode('split')} className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><LayoutTemplate size={14} /></button>
                        <button onClick={() => setViewMode('preview')} className={`p-1.5 rounded ${viewMode === 'preview' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}><Play size={14} /></button>
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex-1 flex overflow-hidden">
                    {(viewMode === 'code' || viewMode === 'split') && (
                        <div className={`flex-1 border-r border-gray-800 relative bg-[#1e1e1e] ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <textarea
                                value={activeFile?.content || ''}
                                onChange={(e) => activeFile && updateProjectFile(activeFile.path, e.target.value)}
                                className="w-full h-full bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                                spellCheck={false}
                            />
                        </div>
                    )}

                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className={`flex-1 bg-white relative ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <PreviewEngine className="h-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevStudio;
