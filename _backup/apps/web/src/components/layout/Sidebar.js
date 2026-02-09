"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const useChatStore_1 = require("@/store/useChatStore");
function Sidebar({ onOpenSettings }) {
    const [isCollapsed, setIsCollapsed] = (0, react_1.useState)(false);
    const { clearMessages } = (0, useChatStore_1.useChatStore)();
    return (<aside className={`flex h-full flex-col bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-5">
                {!isCollapsed && (<div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-black dark:bg-white flex items-center justify-center">
                            <span className="text-xs font-bold text-white dark:text-black">N</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">Nexa</span>
                    </div>)}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <lucide_react_1.Menu size={20}/>
                </button>
            </div>

            {/* New Chat Button */}
            <div className="px-4 py-2">
                <button onClick={clearMessages} className={`flex items-center gap-3 rounded-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 p-3 text-sm font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all ${isCollapsed ? 'justify-center px-0' : 'w-full'}`}>
                    <lucide_react_1.Plus size={18}/>
                    {!isCollapsed && <span>New Chat</span>}
                </button>
            </div>

            {/* Nav Links (Mock History) */}
            <div className="mt-4 flex-1 space-y-1 overflow-y-auto px-2 px-4-fallback">
                {[1, 2, 3].map((i) => (<button key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                        <lucide_react_1.MessageSquare size={16}/>
                        {!isCollapsed && <span className="truncate text-left">Previous conversation {i}</span>}
                    </button>))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
                <button onClick={onOpenSettings} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                    <lucide_react_1.Settings size={18}/>
                    {!isCollapsed && <span>Settings</span>}
                </button>
                <button className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                    <lucide_react_1.User size={18}/>
                    {!isCollapsed && <span className="truncate">User Account</span>}
                </button>
            </div>
        </aside>);
}
//# sourceMappingURL=Sidebar.js.map