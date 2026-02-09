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
exports.memoryManager = exports.initMemory = void 0;
__exportStar(require("./manager"), exports);
__exportStar(require("./embedding"), exports);
const initMemory = () => {
    console.log('Memory module initialized');
};
exports.initMemory = initMemory;
// Singleton instance for backward compatibility with initial backend code if needed, 
// though backend should instantiate MemoryManager.
const manager_1 = require("./manager");
exports.memoryManager = new manager_1.MemoryManager();
//# sourceMappingURL=index.js.map