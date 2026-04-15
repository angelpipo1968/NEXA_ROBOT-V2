'use client'

export function ModelSelector() {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400">Model Inteligencia</label>
            <select className="bg-gray-800 border-gray-700 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 text-white">
                <option>Llama 3 (Local)</option>
                <option>Mistral (Local)</option>
            </select>
        </div>
    )
}
