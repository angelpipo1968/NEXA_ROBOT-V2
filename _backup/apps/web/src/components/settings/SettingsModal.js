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
exports.SettingsModal = SettingsModal;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
function SettingsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = (0, react_1.useState)('general');
    const [theme, setTheme] = (0, react_1.useState)('system');
    if (!isOpen)
        return null;
    const tabs = [
        { id: 'general', label: 'General', icon: <lucide_react_1.Monitor size={18}/> },
        { id: 'profile', label: 'Profile', icon: <lucide_react_1.User size={18}/> },
        { id: 'data', label: 'Data', icon: <lucide_react_1.Database size={18}/> },
        { id: 'about', label: 'About', icon: <lucide_react_1.Info size={18}/> },
    ];
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex h-[600px] w-[800px] overflow-hidden rounded-xl bg-white dark:bg-[#1a1a1a] dark:text-gray-100 shadow-2xl">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#151515] p-4">
                    <h2 className="mb-6 px-2 text-xl font-semibold">Settings</h2>
                    <nav className="space-y-1">
                        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                {tab.icon}
                                {tab.label}
                            </button>))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-8 py-4">
                        <h3 className="text-lg font-medium capitalize">{activeTab}</h3>
                        <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <lucide_react_1.X size={20}/>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'general' && (<div className="space-y-8">
                                <div>
                                    <h4 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Theme
                                    </h4>
                                    <div className="flex gap-4">
                                        {[
                { id: 'light', icon: <lucide_react_1.Sun size={20}/>, label: 'Light' },
                { id: 'dark', icon: <lucide_react_1.Moon size={20}/>, label: 'Dark' },
                { id: 'system', icon: <lucide_react_1.Monitor size={20}/>, label: 'System' },
            ].map((opt) => (<button key={opt.id} onClick={() => setTheme(opt.id)} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${theme === opt.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                                {opt.icon}
                                                <span className="text-sm font-medium">{opt.label}</span>
                                            </button>))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Language
                                    </h4>
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                        <lucide_react_1.Globe size={20} className="text-gray-500"/>
                                        <select className="flex-1 bg-transparent border-none outline-none">
                                            <option>English</option>
                                            <option>Español</option>
                                            <option>中文</option>
                                        </select>
                                    </div>
                                </div>
                            </div>)}

                        {activeTab === 'profile' && (<div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                                        N
                                    </div>
                                    <div>
                                        <button className="text-sm text-blue-500 hover:underline font-medium">Change Avatar</button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                        <input type="text" defaultValue="Nexa User" className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:border-blue-500"/>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <input type="email" defaultValue="user@nexa.ai" className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:border-blue-500"/>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <button className="text-red-500 hover:text-red-600 text-sm font-medium">Log out of all devices</button>
                                </div>
                            </div>)}

                        {activeTab === 'data' && (<div className="space-y-6">
                                <div>
                                    <h4 className="mb-2 text-base font-medium">Export Data</h4>
                                    <p className="mb-4 text-sm text-gray-500">Download all your chat history and settings.</p>
                                    <button className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <lucide_react_1.FileDown size={18}/>
                                        Export to JSON
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                                    <h4 className="mb-2 text-base font-medium text-red-500">Danger Zone</h4>
                                    <p className="mb-4 text-sm text-gray-500">Permanently delete all data. This action cannot be undone.</p>
                                    <button className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                        <lucide_react_1.Trash2 size={18}/>
                                        Delete All Data
                                    </button>
                                </div>
                            </div>)}

                        {activeTab === 'about' && (<div className="text-center space-y-4">
                                <div className="mx-auto h-24 w-24 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white dark:text-black">N</span>
                                </div>
                                <h2 className="text-2xl font-bold">Nexa OS</h2>
                                <p className="text-gray-500">Version 1.0.0 (Beta)</p>
                                <div className="pt-8 text-sm text-gray-400 space-y-2">
                                    <p><a href="#" className="hover:underline">Terms of Service</a></p>
                                    <p><a href="#" className="hover:underline">Privacy Policy</a></p>
                                </div>
                            </div>)}
                    </div>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=SettingsModal.js.map