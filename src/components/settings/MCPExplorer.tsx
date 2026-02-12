import React, { useState } from 'react';
import { mcpService } from '../../services/MCPService';
import { MCPServerInfo, MCPTool } from '../../types/mcp';
import { Search, Server, Box, Terminal, ExternalLink, ShieldCheck, Activity } from 'lucide-react';

export const MCPExplorer: React.FC = () => {
    const servers = mcpService.getServers();
    const [selectedServer, setSelectedServer] = useState<MCPServerInfo | null>(servers[0] || null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = selectedServer?.tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="flex flex-col h-[500px] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-black/20">
            {/* Split Pane Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Server List */}
                <div className="w-64 border-r border-gray-200 dark:border-white/10 overflow-y-auto bg-gray-50/50 dark:bg-white/5">
                    <div className="p-4 border-b border-gray-200 dark:border-white/10">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">MCP Servers</h5>
                    </div>
                    <div className="p-2 space-y-1">
                        {servers.map(server => (
                            <button
                                key={server.id}
                                onClick={() => setSelectedServer(server)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedServer?.id === server.id
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-900/10'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Server size={16} />
                                <span className="truncate">{server.name}</span>
                                {server.status === 'active' && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content: Server & Tool Details */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedServer ? (
                        <>
                            {/* Server Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {selectedServer.name}
                                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 uppercase">
                                                {selectedServer.type}
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">ID: {selectedServer.id}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">Status</span>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                                                <Activity size={12} />
                                                Active
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tool List Container */}
                            <div className="flex-1 flex flex-col overflow-hidden p-6">
                                <div className="flex items-center gap-2 mb-6 p-2 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                    <Search size={16} className="text-gray-400 ml-2" />
                                    <input
                                        type="text"
                                        placeholder="Search tools..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Capabilities ({filteredTools.length})</h4>
                                    {filteredTools.length > 0 ? (
                                        filteredTools.map(tool => (
                                            <div
                                                key={tool.name}
                                                className="group p-4 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-default"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                                        <Box size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h5>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                <button title="Copy JSON" className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                                                    <Terminal size={14} />
                                                                </button>
                                                                <button title="Documentation" className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                                                    <ExternalLink size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
                                                        {Object.keys(tool.parameters).length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {Object.entries(tool.parameters).map(([pName, pType]) => (
                                                                    <span key={pName} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-mono">
                                                                        {pName}: {String(pType)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Search size={48} className="text-gray-200 dark:text-white/10 mb-4" />
                                            <p className="text-gray-400 font-medium">No tools found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <Server size={64} className="text-gray-200 dark:text-white/10 mb-6" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select a Server</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-xs">Choose an MCP server from the sidebar to view its configuration and hosted tools.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Bottom Bar */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={14} className="text-purple-500" />
                    Secure Connection via MCP (JSON-RPC)
                </div>
                <div className="text-xs text-gray-400 font-mono">
                    Nexa OS v0.1.0-alpha
                </div>
            </div>
        </div>
    );
};
