"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNexa = useNexa;
const react_1 = require("react");
const core_1 = require("../core");
function useNexa(apiKey, config) {
    const [client, setClient] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [sessionId, setSessionId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Cast config to any to match expected type if properties mismatch slightly due to Partial
        const nexa = new core_1.NexaClient({
            apiKey,
            ...config
        });
        setClient(nexa);
        // Crear sesión automáticamente
        nexa.createSession().then(session => {
            setSessionId(session.id);
        }).catch(err => console.error("Failed to init session", err));
        return () => {
            // Cleanup
        };
    }, [apiKey]);
    const sendMessage = (0, react_1.useCallback)(async (content, options) => {
        if (!client)
            throw new Error('Client not initialized');
        setIsLoading(true);
        setError(null);
        try {
            const userMessage = {
                role: 'user',
                content,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            const response = await client.chat.send({
                messages: [...messages, userMessage],
                sessionId: sessionId,
                ...options
            });
            setMessages(prev => [...prev, response.message]);
            return response.message;
        }
        catch (err) {
            setError(err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }, [client, messages, sessionId]);
    const streamMessage = (0, react_1.useCallback)(async (content, options) => {
        if (!client)
            throw new Error('Client not initialized');
        const userMessage = {
            role: 'user',
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        const stream = await client.streamChat([...messages, userMessage], { sessionId: sessionId, ...options });
        return {
            [Symbol.asyncIterator]: async function* () {
                let fullResponse = '';
                for await (const chunk of stream) {
                    if (chunk.type === 'content') {
                        fullResponse += chunk.content;
                        yield chunk.content;
                    }
                    if (chunk.type === 'complete') {
                        setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: fullResponse,
                                timestamp: new Date(),
                                metadata: chunk.metadata
                            }]);
                    }
                }
            }
        };
    }, [client, messages, sessionId]);
    const executeTool = (0, react_1.useCallback)(async (toolName, parameters) => {
        if (!client)
            throw new Error('Client not initialized');
        return await client.tools.execute(toolName, parameters, {
            sessionId: sessionId
        });
    }, [client, sessionId]);
    const clearMessages = (0, react_1.useCallback)(() => {
        setMessages([]);
    }, []);
    return {
        client,
        messages,
        isLoading,
        error,
        sendMessage,
        streamMessage,
        executeTool,
        clearMessages,
        sessionId
    };
}
//# sourceMappingURL=useNexa.js.map