"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryPanel = MemoryPanel;
function MemoryPanel({ userId }) {
    return (<div className="p-4 border border-gray-800 rounded-lg bg-gray-900/80">
            <h3 className="font-semibold mb-2">Long Term Memory</h3>
            <div className="text-xs text-gray-500">
                Active for user: {userId}
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li>- Preference: Concise mode</li>
                <li>- Context: Developer</li>
            </ul>
        </div>);
}
//# sourceMappingURL=panel.js.map