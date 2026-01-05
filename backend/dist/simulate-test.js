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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const client_1 = require("@prisma/client");
const routineOrchestrator_1 = require("./services/routineOrchestrator");
const prisma = new client_1.PrismaClient();
function simulate() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- INICIO SIMULACIÓN USUARIO 999 ---');
        // 1. Crear Usuario 999
        const bcrypt = yield Promise.resolve().then(() => __importStar(require('bcrypt')));
        const hashedPassword = yield bcrypt.hash('dummy', 10);
        const user = yield prisma.user.upsert({
            where: { id: 999, email: 'test999@fitness.com' },
            update: {
                passwordHash: hashedPassword,
                isApproved: true,
                hasCompletedOnboarding: true,
            },
            create: {
                id: 999,
                email: 'test999@fitness.com',
                name: 'Test',
                lastName: 'Simulation',
                passwordHash: hashedPassword,
                role: 'client',
                isApproved: true,
                hasCompletedOnboarding: true,
            }
        });
        // 2. Crear Perfil Principiante / 3 días / Ganar Masa
        yield prisma.userProfile.upsert({
            where: { userId: 999 },
            update: {
                experienceLevel: 'Principiante',
                daysPerWeek: 3,
                goal: 'Ganar Masa'
            },
            create: {
                userId: 999,
                experienceLevel: 'Principiante',
                daysPerWeek: 3,
                goal: 'Ganar Masa'
            }
        });
        console.log('Usuario y Perfil 999 configurados.');
        // 2.5 Asegurar Ejercicios de Prueba
        const testExercises = [
            { nombre: "Empuje P1", categoria: "Empuje", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
            { nombre: "Empuje P2", categoria: "Empuje", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
            { nombre: "Traccion P1", categoria: "Tracción", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
            { nombre: "Traccion P2", categoria: "Tracción", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
            { nombre: "Leg P1", categoria: "Leg", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
            { nombre: "Leg P2", categoria: "Leg", nivel: "Principiante", seriesSugeridas: 3, repsSugeridas: "10" },
        ];
        for (const ex of testExercises) {
            yield prisma.exercise.upsert({
                where: { id: testExercises.indexOf(ex) + 100 },
                update: ex,
                create: Object.assign(Object.assign({}, ex), { id: testExercises.indexOf(ex) + 100 })
            });
        }
        console.log('Ejercicios de prueba (2/2/2) creados.');
        // 3. Ejecutar Orquestación
        console.log('Ejecutando generateOrchestratedRoutine(999)...');
        const routines = yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(999);
        // 4. Verificar y Loguear
        const fullRoutines = yield prisma.routine.findMany({
            where: { userId: 999 },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        console.log(`\nRESULTADOS: Se generaron ${fullRoutines.length} rutinas.`);
        fullRoutines.forEach(r => {
            console.log(`\n> RUTINA: ${r.title} | DÍA: ${r.weekDay}`);
            console.log(`  Ejercicios (${r.exercises.length}):`);
            let countEmpuje = 0;
            let countTraccion = 0;
            let countLeg = 0;
            r.exercises.forEach((re) => {
                const ex = re.exercise;
                console.log(`    - [${ex.nivel}] ${ex.nombre} (${ex.categoria}) | ${re.sets} series x ${re.reps} reps`);
                if (ex.categoria === 'Empuje')
                    countEmpuje++;
                if (ex.categoria === 'Tracción')
                    countTraccion++;
                if (ex.categoria === 'Leg')
                    countLeg++;
            });
            console.log(`  BALANCE: Empuje: ${countEmpuje}, Tracción: ${countTraccion}, Leg: ${countLeg}`);
        });
        console.log('\n--- FIN SIMULACIÓN ---');
    });
}
simulate()
    .catch(e => console.error('Error en simulación:', e))
    .finally(() => prisma.$disconnect());
