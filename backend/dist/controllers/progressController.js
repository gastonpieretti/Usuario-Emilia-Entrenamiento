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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgress = exports.getProgress = void 0;
const progressService_1 = require("../services/progressService");
// Get Progress (User: Own, Admin: All or filtered)
const getProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const progress = yield (0, progressService_1.getAllProgress)(role, userId, req.query.userId ? Number(req.query.userId) : undefined);
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching progress' });
    }
});
exports.getProgress = getProgress;
// Create Progress (User only - for themselves)
const createProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const progress = yield (0, progressService_1.createNewProgress)(userId, req.body);
        res.status(201).json(progress);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating progress entry' });
    }
});
exports.createProgress = createProgress;
