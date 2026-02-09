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
exports.ChatInput = ChatInput;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const useChatStore_1 = require("@/store/useChatStore");
function ChatInput() {
    const { isThinking, toggleThinking, isSearching, toggleSearching, isStreaming, sendMessage, currentInput, setInput } = (0, useChatStore_1.useChatStore)();
    const textareaRef = (0, react_1.useRef)(null);
    // Auto-resize textarea
    (0, react_1.useEffect)(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [currentInput]);
    const handleSend = () => {
        if (!currentInput.trim() || isStreaming)
            return;
        sendMessage(currentInput);
        setInput('');
    };
    const handleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(currentInput + ' ' + transcript);
        };
    };
    return (<div className="mx-auto w-full max-w-3xl px-4 pb-6">
            <div className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151515] shadow-sm focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-700 transition-all">

                {/* Text Area */}
                <textarea ref={textareaRef} value={currentInput} onChange={(e) => setInput(e.target.value)} placeholder="Message Nexa..." rows={1} className="max-h-[200px] w-full resize-none bg-transparent px-4 py-4 text-base outline-none scrollbar-hide dark:placeholder-gray-500" onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        }}/>

                {/* Action Bar */}
                <div className="flex items-center justify-between px-3 pb-3 pt-2">

                    {/* Left Actions */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleThinking} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isThinking
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <lucide_react_1.Brain size={14}/>
                            Deep Think
                        </button>
                        <button onClick={toggleSearching} className={`rounded-lg p-2 transition-colors ${isSearching
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <lucide_react_1.Search size={18}/>
                        </button>
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <lucide_react_1.Paperclip size={18}/>
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <button onClick={handleVoice} className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <lucide_react_1.Mic size={18}/>
                        </button>
                        <button onClick={handleSend} disabled={!currentInput.trim() || isStreaming} className={`rounded-full p-2 transition-all ${currentInput.trim() && !isStreaming
            ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>
                            <lucide_react_1.Send size={18}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-3 text-center text-xs text-gray-400 dark:text-gray-600">
                Nexa can make mistakes. Check important info.
            </div>
        </div>);
}
//# sourceMappingURL=ChatInput.js.map