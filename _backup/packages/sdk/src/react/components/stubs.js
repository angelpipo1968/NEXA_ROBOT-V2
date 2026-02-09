"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPanel = exports.InputArea = exports.MessageList = void 0;
const react_1 = __importDefault(require("react"));
const MessageList = ({ messages, streaming, currentStream, showThinking }) => <div>MessageList Stub</div>;
exports.MessageList = MessageList;
const InputArea = ({ value, onChange, onSubmit, isLoading, placeholder }) => <div>InputArea Stub</div>;
exports.InputArea = InputArea;
const ToolPanel = ({ tools, onExecute, disabled }) => <div>ToolPanel Stub</div>;
exports.ToolPanel = ToolPanel;
//# sourceMappingURL=stubs.js.map