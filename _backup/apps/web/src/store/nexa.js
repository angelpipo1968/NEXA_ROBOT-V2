"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNexaStore = void 0;
const zustand_1 = require("zustand");
exports.useNexaStore = (0, zustand_1.create)((set) => ({
    user: {
        id: 'user-1',
        name: 'Demo User'
    },
    mode: 'interactive',
    memoryEnabled: true,
    setMode: (mode) => set({ mode }),
    toggleMemory: () => set((state) => ({ memoryEnabled: !state.memoryEnabled }))
}));
//# sourceMappingURL=nexa.js.map