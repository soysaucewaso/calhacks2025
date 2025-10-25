"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
var vscode = require("vscode");
var deepinfra_1 = require("@ai-sdk/deepinfra");
var ai_1 = require("ai");
var zod_1 = require("zod");
var kali_1 = require("./kali");
var deepinfra = (0, deepinfra_1.createDeepInfra)({
    apiKey: "C6XdSQWnJ6BR6O8gCbyG4EjbP6LPLNiu",
});
var messages = [
    { role: "system", content: "Respond like a michelin starred chef." }
];
var kaliTool = (0, ai_1.tool)({
    description: 'Run a bash shell command on Kali Linux VM',
    inputSchema: zod_1.z.object({
        commandStr: zod_1.z.string().describe('Bash shell command to be run'),
    }),
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var commandStr = _b.commandStr;
        return __generator(this, function (_c) {
            return [2 /*return*/, (0, kali_1.executeKaliCommand)(commandStr)];
        });
    }); },
});
var tools = { executeKaliCommand: kaliTool };
function activate(context) {
    var _this = this;
    var disposable = vscode.commands.registerCommand('ai-pentester.activate', function () {
        var panel = vscode.window.createWebviewPanel('terminalInteractor', 'Terminal Interactor', vscode.ViewColumn.One, { enableScripts: true } // let webview run JS
        );
        // HTML UI for the webview
        panel.webview.html = getWebviewContent();
        // Listen to messages from the webview
        panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var userPrompt, userMsg, result, _a, _b, _c, textPart, e_1_1, terminal_1;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(message.command === 'chat')) return [3 /*break*/, 13];
                        userPrompt = message.text;
                        userMsg = { role: "user", content: userPrompt };
                        messages.push(userMsg);
                        result = (0, ai_1.streamText)({
                            model: deepinfra("deepseek-ai/DeepSeek-R1"),
                            messages: messages,
                            tools: tools,
                        });
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, 7, 12]);
                        _a = true, _b = __asyncValues(result.textStream);
                        _g.label = 2;
                    case 2: return [4 /*yield*/, _b.next()];
                    case 3:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                        _f = _c.value;
                        _a = false;
                        textPart = _f;
                        console.log(textPart);
                        _g.label = 4;
                    case 4:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _g.trys.push([7, , 10, 11]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _e.call(_b)];
                    case 8:
                        _g.sent();
                        _g.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        terminal_1 = getOrCreateTerminal();
                        terminal_1.sendText(message.text);
                        _g.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        }); });
    });
    context.subscriptions.push(disposable);
}
var terminal;
function getOrCreateTerminal() {
    if (!terminal) {
        terminal = vscode.window.createTerminal('Extension Terminal');
    }
    terminal.show();
    return terminal;
}
function getWebviewContent() {
    return "\n  <!DOCTYPE html>\n  <html lang=\"en\">\n  <body style=\"font-family: sans-serif; padding: 10px;\">\n    <h2>Run Commands</h2>\n    <input id=\"cmd\" type=\"text\" placeholder=\"Enter command\" style=\"width: 80%;\" />\n    <button id=\"run\">Ask</button>\n    <script>\n      const vscode = acquireVsCodeApi();\n      document.getElementById('run').addEventListener('click', () => {\n        const text = document.getElementById('cmd').value;\n        vscode.postMessage({ command: 'chat', text });\n      });\n    </script>\n  </body>\n  </html>\n  ";
}
function deactivate() { }
