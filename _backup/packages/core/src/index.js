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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmRouter = exports.safetyFilter = exports.APP_NAME = exports.CORE_VERSION = void 0;
exports.CORE_VERSION = '0.0.1';
exports.APP_NAME = 'Nexa AI';
__exportStar(require("./nexa-config"), exports);
__exportStar(require("./types"), exports);
exports.safetyFilter = {
    validate: async (message) => {
        return { allowed: true, reason: null };
    }
};
exports.llmRouter = {
    route: async (params) => {
        return {
            content: "This is a mock response from llmRouter.",
            reasoning: "Mock reasoning",
            sources: [],
            metadata: {}
        };
    }
};
//# sourceMappingURL=index.js.map