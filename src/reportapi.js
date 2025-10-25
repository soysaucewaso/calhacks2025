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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
// New exported API: generateReport(benchmark, targets)
// This function prompts the LLM to evaluate each benchmark constraint against the provided targets.
// It leverages the Kali execution tool for running commands and returns the final aggregated report text
// produced by the LLM (attempting JSON when possible).
var deepinfra_1 = require("@ai-sdk/deepinfra");
var ai_1 = require("ai");
var zod_1 = require("zod");
var kali_1 = require("./kali");
var fs = require("fs");
var path = require("path");
var deepinfra = (0, deepinfra_1.createDeepInfra)({
    apiKey: process.env.DEEPINFRA_API_KEY,
});
var kaliTool = (0, ai_1.tool)({
    description: 'Run a bash shell command on Kali Linux VM. Returns stdout and stderr output.',
    inputSchema: zod_1.z.object({
        commandStr: zod_1.z.string().describe('Bash shell command to be run'),
    }),
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var commandStr = _b.commandStr;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, kali_1.executeKaliCommand)(commandStr, undefined, false)];
                case 1: 
                // Pass undefined panel to allow kali.ts to resolve active panel if available
                return [2 /*return*/, _c.sent()];
            }
        });
    }); },
});
// Load constraints for a known benchmark from assets CSV files
function benchmarkToConstraints(benchmark) {
    return __awaiter(this, void 0, void 0, function () {
        var csvPath, csvText, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (benchmark !== 'OWASP')
                        return [2 /*return*/, []];
                    csvPath = path.resolve(__dirname, '..', '..', 'assets', 'OWASP.csv');
                    return [4 /*yield*/, fs.promises.readFile(csvPath, 'utf-8')];
                case 1:
                    csvText = _a.sent();
                    rows = parseCsv(csvText);
                    // Map CSV headers to our normalized object keys
                    return [2 /*return*/, rows.map(function (r) {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            return ({
                                name: (_b = (_a = r['name']) !== null && _a !== void 0 ? _a : r['Name']) !== null && _b !== void 0 ? _b : '',
                                section: (_e = (_d = (_c = r['section name']) !== null && _c !== void 0 ? _c : r['section']) !== null && _d !== void 0 ? _d : r['Section']) !== null && _e !== void 0 ? _e : '',
                                granular: (_g = (_f = r['1-sentence granular constraint']) !== null && _f !== void 0 ? _f : r['granular']) !== null && _g !== void 0 ? _g : '',
                                kaliTest: (_j = (_h = r['1-sentence kali test']) !== null && _h !== void 0 ? _h : r['kali test']) !== null && _j !== void 0 ? _j : '',
                            });
                        })];
            }
        });
    });
}
// Minimal CSV parser supporting quoted fields and commas inside quotes; returns array of objects using header row
function parseCsv(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim().length > 0 && !l.trim().startsWith('.'); });
    if (lines.length === 0)
        return [];
    var header = parseCsvLine(lines[0]);
    var out = [];
    var _loop_1 = function (i) {
        var fields = parseCsvLine(lines[i]);
        if (fields.length === 1 && fields[0] === '')
            return "continue";
        var obj = {};
        header.forEach(function (h, idx) {
            var _a;
            obj[h] = (_a = fields[idx]) !== null && _a !== void 0 ? _a : '';
        });
        out.push(obj);
    };
    for (var i = 1; i < lines.length; i++) {
        _loop_1(i);
    }
    return out;
}
function parseCsvLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++; // skip escaped quote
                }
                else {
                    inQuotes = false;
                }
            }
            else {
                current += ch;
            }
        }
        else {
            if (ch === ',') {
                result.push(current);
                current = '';
            }
            else if (ch === '"') {
                inQuotes = true;
            }
            else {
                current += ch;
            }
        }
    }
    result.push(current);
    return result.map(function (s) { return s.trim(); });
}
function generateReport(benchmark, targets, options) {
    return __awaiter(this, void 0, void 0, function () {
        var constraints, _a, results, defaultLlmCall, llmCall, _i, constraints_1, constraint, name_1, section, granular, kaliTest, taskSystemPrompt, userPayload, taskMessages, responseText, parsed;
        var _this = this;
        var _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!((_b = options === null || options === void 0 ? void 0 : options.constraints) !== null && _b !== void 0)) return [3 /*break*/, 1];
                    _a = _b;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, benchmarkToConstraints(benchmark)];
                case 2:
                    _a = (_h.sent());
                    _h.label = 3;
                case 3:
                    constraints = _a;
                    results = [];
                    defaultLlmCall = function (messages) { return __awaiter(_this, void 0, void 0, function () {
                        var gen;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, ai_1.generateText)({
                                        model: deepinfra("deepseek-ai/DeepSeek-R1"),
                                        messages: messages,
                                        tools: { executeKaliCommand: kaliTool },
                                        // Allow a bit more tool-stepping than the UI chat
                                        stopWhen: (0, ai_1.stepCountIs)(12),
                                    })];
                                case 1:
                                    gen = _a.sent();
                                    return [2 /*return*/, gen.text];
                            }
                        });
                    }); };
                    llmCall = (_c = options === null || options === void 0 ? void 0 : options.llmCall) !== null && _c !== void 0 ? _c : defaultLlmCall;
                    _i = 0, constraints_1 = constraints;
                    _h.label = 4;
                case 4:
                    if (!(_i < constraints_1.length)) return [3 /*break*/, 7];
                    constraint = constraints_1[_i];
                    name_1 = constraint.name, section = constraint.section, granular = constraint.granular, kaliTest = constraint.kaliTest;
                    taskSystemPrompt = "You are an AI pentesting assistant.\n        You will evaluate a single constraint for a security benchmark on a target.\n        If the constraint is not practical to test with your kali linux environment, return 'NOT TESTABLE' as status and null for evidence and commands.\n        \n        Otherwise:\n        1) Formulate a testing approach.\n        2) If needed, call the executeKaliCommand tool with the exact bash commands to run.\n        3) Capture outputs and determine PASS/FAIL with reasoning.\n        4) Also, return a list of the commands you ran to achieve the output.\n        \n        At the end, output a concise JSON report with the following shape:\n        \n        {\n            \"constraint\": string,\n            \"status\": \"PASS\" | \"FAIL\" | \"NOT TESTABLE\",\n            \"evidence\": string,\n            \"commands\": string[]\n        }";
                    userPayload = {
                        targets: targets,
                        constraint_name: name_1,
                        constraint_section: section,
                        constraint_description: granular,
                        constraint_suggested_strategy: kaliTest,
                    };
                    taskMessages = [
                        { role: 'system', content: taskSystemPrompt },
                        { role: 'user', content: JSON.stringify(userPayload) },
                    ];
                    return [4 /*yield*/, llmCall(taskMessages)];
                case 5:
                    responseText = _h.sent();
                    // Try to parse JSON if the model followed instructions; if not, coerce a minimal structure
                    try {
                        parsed = JSON.parse(responseText);
                        results.push({
                            constraint: (_d = parsed.constraint) !== null && _d !== void 0 ? _d : name_1,
                            status: (_e = parsed.status) !== null && _e !== void 0 ? _e : 'NOT TESTABLE',
                            evidence: (_f = parsed.evidence) !== null && _f !== void 0 ? _f : null,
                            commands: (_g = parsed.commands) !== null && _g !== void 0 ? _g : null,
                        });
                    }
                    catch (_j) {
                        results.push({
                            constraint: name_1,
                            status: 'NOT TESTABLE',
                            evidence: responseText,
                            commands: null,
                        });
                    }
                    _h.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, { benchmark: benchmark, targets: targets, results: results }];
            }
        });
    });
}
