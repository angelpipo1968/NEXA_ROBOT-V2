"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternDetector = void 0;
class PatternDetector {
    async scan(input) {
        return { scores: { injection: 0, jailbreak: 0, privilege: 0 } };
    }
}
exports.PatternDetector = PatternDetector;
//# sourceMappingURL=patterns.js.map