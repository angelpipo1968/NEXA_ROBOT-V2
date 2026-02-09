"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorTool = exports.BrowserTool = exports.RAGTool = exports.CodeExecutionTool = exports.PermissionManager = exports.SandboxManager = void 0;
exports.searchWeb = searchWeb;
exports.searchAcademic = searchAcademic;
exports.searchNews = searchNews;
const base_tool_1 = require("../base-tool");
// Sandbox Manager Stub
class SandboxManager {
    async execute(tool, params, context) {
        return tool.execute(params, context);
    }
}
exports.SandboxManager = SandboxManager;
// Permission Manager Stub
class PermissionManager {
    async check(userId, toolName, params) {
        return true; // Allow all for MVP
    }
}
exports.PermissionManager = PermissionManager;
// Search Providers Stubs
async function searchWeb(query, options) {
    return { title: 'Mock Web Result', url: 'http://example.com', content: 'Mock content', source: 'web' };
}
async function searchAcademic(query, options) {
    return { title: 'Mock Academic Result', url: 'http://scholar.example.com', content: 'Mock academic content', source: 'academic' };
}
async function searchNews(query, options) {
    return { title: 'Mock News Result', url: 'http://news.example.com', content: 'Mock news content', source: 'news' };
}
// Other Tools Stubs
class CodeExecutionTool extends base_tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'code_execution';
        this.description = 'Executes code';
        this.parameters = {};
        this.requiresSandbox = true;
    }
    async execute(params, context) {
        return { success: true, data: 'Code executed' };
    }
}
exports.CodeExecutionTool = CodeExecutionTool;
class RAGTool extends base_tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'rag';
        this.description = 'Retrieval Augmented Generation';
        this.parameters = {};
    }
    async execute(params, context) {
        return { success: true, data: 'RAG result' };
    }
}
exports.RAGTool = RAGTool;
class BrowserTool extends base_tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'browser';
        this.description = 'Browser automation';
        this.parameters = {};
    }
    async execute(params, context) {
        return { success: true, data: 'Browser action completed' };
    }
}
exports.BrowserTool = BrowserTool;
class CalculatorTool extends base_tool_1.Tool {
    constructor() {
        super(...arguments);
        this.name = 'calculator';
        this.description = 'Performs calculations';
        this.parameters = {};
    }
    async execute(params, context) {
        return { success: true, data: 'Calculation result' };
    }
}
exports.CalculatorTool = CalculatorTool;
//# sourceMappingURL=stubs.js.map