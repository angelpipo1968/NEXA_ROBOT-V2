"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatContainer = ChatContainer;
function ChatContainer({ endpoint, userId }) {
    return (<div className="h-full flex flex-col items-center justify-center p-8 bg-gray-900/50">
            <div className="text-2xl font-bold mb-4">Chat Container</div>
            <p className="text-gray-400">Endpoint: {endpoint}</p>
            <p className="text-gray-400">User: {userId}</p>
            <div className="mt-8 border border-dashed border-gray-700 p-8 rounded-lg w-full max-w-2xl bg-black/20">
                Message area placeholder
            </div>
        </div>);
}
//# sourceMappingURL=container.js.map