'use client'

import { useState, useEffect } from 'react'
import { useNexaStore } from '@/store/nexa'
import { Model } from '@nexa/models'
import { ModelCard } from './model-card'
import { PerformanceBadge } from './performance-badge'

export function ModelSwitcher() {
    const { currentModel, availableModels, switchModel } = useNexaStore()
    const [loading, setLoading] = useState(false)
    const [recommended, setRecommended] = useState<any[]>([])

    useEffect(() => {
        loadRecommendedModels()
    }, [])

    async function loadRecommendedModels() {
        if (availableModels.length > 0) {
            setRecommended([availableModels[0]]);
        }
    }

    async function handleSwitch(modelId: string) {
        setLoading(true)
        try {
            await switchModel(modelId, 'user_request')
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    if (!currentModel) return <div>Loading...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Current Model</h3>
                <ModelCard
                    model={currentModel}
                    active={true}
                    onSelect={() => { }}
                />
                <PerformanceBadge modelId={currentModel.id} />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Recommended</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommended.map(model => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            active={false}
                            onSelect={() => handleSwitch(model.id)}
                            recommendationReason={model.recommendationReason || "High Quality"}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">All Models</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableModels.map(model => (
                        <div
                            key={model.id}
                            className={`p-3 rounded border cursor-pointer hover:bg-gray-900 transition ${currentModel.id === model.id ? 'border-primary bg-muted' : 'border-gray-800'
                                }`}
                            onClick={() => handleSwitch(model.id)}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-sm text-gray-400">{model.provider}</div>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">{model.capabilities.contextLength} tokens</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
