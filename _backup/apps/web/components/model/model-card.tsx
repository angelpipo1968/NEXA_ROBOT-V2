import React from 'react';

// Stub ModelCard
export function ModelCard({ model, active, onSelect, recommendationReason }: any) {
    return (
        <div
            className={`p-4 rounded-lg border cursor-pointer transition ${active ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
            onClick={onSelect}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
                {active && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Active</span>}
            </div>
            {recommendationReason && (
                <div className="mt-2 text-xs text-green-500">
                    Recommended: {recommendationReason}
                </div>
            )}
            <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                <span>{model.capabilities.contextLength} tokens</span>
                {model.capabilities.streaming && <span>Streaming</span>}
            </div>
        </div>
    );
}
