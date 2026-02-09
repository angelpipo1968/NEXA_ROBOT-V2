'use client'

export function ModelSelector() {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Model</label>
            <select className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                <option>Llama 3 (Local)</option>
                <option>Mistral (Local)</option>
                <option>GPT-4 (Fallback)</option>
            </select>
        </div>
    )
}
