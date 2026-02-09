"use strict";
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
exports.Chat = Chat;
const react_1 = __importStar(require("react"));
const useNexa_1 = require("../useNexa");
const stubs_1 = require("./stubs");
function Chat({ apiKey, config, modelId = 'llama3', tools = [], showThinking = false, className = '' }) {
    const { messages, isLoading, error, sendMessage, streamMessage, executeTool } = (0, useNexa_1.useNexa)(apiKey, config);
    const [input, setInput] = (0, react_1.useState)('');
    const [streaming, setStreaming] = (0, react_1.useState)(false);
    const [currentStream, setCurrentStream] = (0, react_1.useState)('');
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages, currentStream]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading)
            return;
        const message = input.trim();
        setInput('');
        if (config?.stream) {
            setStreaming(true);
            setCurrentStream('');
            try {
                const stream = await streamMessage(message, { modelId });
                for await (const chunk of stream) {
                    setCurrentStream(prev => prev + chunk);
                }
            }
            catch (err) {
                console.error('Stream error:', err);
            }
            finally {
                setStreaming(false);
                setCurrentStream('');
            }
        }
        else {
            await sendMessage(message, { modelId });
        }
    };
    const handleToolExecute = async (toolName, params) => {
        try {
            const result = await executeTool(toolName, params);
            // Auto-enviar resultado al chat
            if (result.success) {
                await sendMessage(`Tool ${toolName} executed successfully. Result: ${JSON.stringify(result.data, null, 2)}`, { modelId });
            }
            return result;
        }
        catch (err) {
            console.error('Tool execution error:', err);
            throw err;
        }
    };
    return (<div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-y-auto p-4">
                <stubs_1.MessageList messages={messages} streaming={streaming} currentStream={currentStream} showThinking={showThinking}/>
                <div ref={messagesEndRef}/>
            </div>

            {tools.length > 0 && (<div className="border-t border-gray-200">
                    <stubs_1.ToolPanel tools={tools} onExecute={handleToolExecute} disabled={isLoading || streaming}/>
                </div>)}

            <div className="border-t border-gray-200 p-4">
                <stubs_1.InputArea value={input} onChange={(val) => setInput(typeof val === 'string' ? val : val.target.value)} onSubmit={handleSubmit} isLoading={isLoading || streaming} placeholder="Type your message..."/>

                {error && (<div className="mt-2 text-red-600 text-sm">
                        Error: {error.message}
                    </div>)}
            </div>
        </div>);
}
//# sourceMappingURL=Chat.js.map