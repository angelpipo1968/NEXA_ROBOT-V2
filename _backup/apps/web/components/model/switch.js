"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSwitcher = ModelSwitcher;
const react_1 = require("react");
const nexa_1 = require("@/store/nexa");
const model_card_1 = require("./model-card");
const performance_badge_1 = require("./performance-badge");
function ModelSwitcher() {
    const { currentModel, availableModels, switchModel } = (0, nexa_1.useNexaStore)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [recommended, setRecommended] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadRecommendedModels();
    }, []);
    async function loadRecommendedModels() {
        if (availableModels.length > 0) {
            setRecommended([availableModels[0]]);
        }
    }
    async function handleSwitch(modelId) {
        setLoading(true);
        try {
            await switchModel(modelId, 'user_request');
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }
    if (!currentModel)
        return <div>Loading...</div>;
    return (<div className="p-6 space-y-6">
            <div className="border border-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Current Model</h3>
                <model_card_1.ModelCard model={currentModel} active={true} onSelect={() => { }}/>
                <performance_badge_1.PerformanceBadge modelId={currentModel.id}/>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Recommended</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommended.map(model => (<model_card_1.ModelCard key={model.id} model={model} active={false} onSelect={() => handleSwitch(model.id)} recommendationReason={model.recommendationReason || "High Quality"}/>))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">All Models</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableModels.map(model => (<div key={model.id} className={`p-3 rounded border cursor-pointer hover:bg-gray-900 transition ${currentModel.id === model.id ? 'border-primary bg-muted' : 'border-gray-800'}`} onClick={() => handleSwitch(model.id)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-sm text-gray-400">{model.provider}</div>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">{model.capabilities.contextLength} tokens</span>
                                </div>
                            </div>
                        </div>))}
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=switch.js.map