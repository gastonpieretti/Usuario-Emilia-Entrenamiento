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
exports.deleteDiet = exports.updateDiet = exports.createDiet = exports.getDiets = void 0;
const dietService_1 = require("../services/dietService");
// Get Diets (User: Own, Admin: All or filtered)
const getDiets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const diets = yield (0, dietService_1.getAllDiets)(role, userId, req.query.userId ? Number(req.query.userId) : undefined);
        res.json(diets);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching diets' });
    }
});
exports.getDiets = getDiets;
// Create Diet (Admin only)
const createDiet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const diet = yield (0, dietService_1.createNewDiet)(req.body);
        res.status(201).json(diet);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating diet' });
    }
});
exports.createDiet = createDiet;
// Update Diet (Admin only)
const updateDiet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const diet = yield (0, dietService_1.updateDietById)(Number(id), req.body);
        res.json(diet);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating diet' });
    }
});
exports.updateDiet = updateDiet;
// Delete Diet (Admin only)
const deleteDiet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, dietService_1.deleteDietById)(Number(id));
        res.json({ message: 'Diet deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting diet' });
    }
});
exports.deleteDiet = deleteDiet;
