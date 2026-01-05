"use strict";
/**
 * RoutineBlueprintEngine
 * Defines weekly structure before selecting exercises.
 * Aligned with motor_entrenamiento.json v1.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyBlueprint = void 0;
const PLANTILLAS_DEFINICION = {
    "A": {
        "enfoque": ["piernas", "core"],
        "patrones": ["sentadilla", "bisagra", "core"]
    },
    "B": {
        "enfoque": ["empuje", "traccion"],
        "patrones": ["empuje", "traccion"]
    },
    "C": {
        "enfoque": ["full_body"],
        "patrones": ["sentadilla", "empuje", "traccion"]
    },
    "D": {
        "enfoque": ["metabolico"],
        "patrones": ["circuito"]
    }
};
const generateWeeklyBlueprint = (daysPerWeek, goal, level) => {
    let structure = [];
    if (daysPerWeek === 3) {
        structure = ["A", "B", "A"];
    }
    else if (daysPerWeek === 4) {
        structure = ["A", "B", "A", "C"];
    }
    else if (daysPerWeek >= 5) {
        structure = ["A", "B", "C", "A", "D"];
    }
    const blueprint = structure.map((tipo, index) => {
        const def = PLANTILLAS_DEFINICION[tipo];
        return {
            dia: index + 1,
            tipo_letra: tipo,
            enfoque: def.enfoque,
            patrones: def.patrones
        };
    });
    return { blueprint };
};
exports.generateWeeklyBlueprint = generateWeeklyBlueprint;
