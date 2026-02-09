"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMonitor = SecurityMonitor;
const react_1 = __importDefault(require("react"));
function SecurityMonitor({ threats }) {
    return (<div className="h-64 overflow-y-auto space-y-2">
            {threats.length === 0 ? (<p className="text-gray-500 text-sm text-center py-8">No active threats detected</p>) : (threats.map((threat, idx) => (<div key={idx} className="bg-red-900/20 border border-red-900/50 p-2 rounded text-sm">
                        <div className="flex justify-between font-bold text-red-400">
                            <span>{threat.type}</span>
                            <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300">{threat.details}</p>
                    </div>)))}
        </div>);
}
//# sourceMappingURL=security-monitor.js.map