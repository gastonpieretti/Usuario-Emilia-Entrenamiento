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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const routineOrchestrator_1 = require("./services/routineOrchestrator");
const prisma = new client_1.PrismaClient();
function testOrchestration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- INICIO PRUEBA ORQUESTACIÓN CLIENTE TEST ---');
        const email = 'clientetest@fitness.com';
        const password = 'password123';
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // 1. Crear/Actualizar Usuario 'Cliente Test'
        const user = yield prisma.user.upsert({
            where: { email },
            update: {
                name: 'Cliente',
                lastName: 'Test',
                passwordHash: hashedPassword,
                role: 'client',
                isApproved: true,
                hasCompletedOnboarding: true,
            },
            create: {
                email,
                name: 'Cliente',
                lastName: 'Test',
                passwordHash: hashedPassword,
                role: 'client',
                isApproved: true,
                hasCompletedOnboarding: true,
            }
        });
        console.log(`Usuario ${user.id} (${user.email}) configurado.`);
        // 2. Configurar Perfil (Nivel Intermedio, 4 días)
        yield prisma.userProfile.upsert({
            where: { userId: user.id },
            update: {
                experienceLevel: 'Intermedio',
                daysPerWeek: 4,
                goal: 'General'
            },
            create: {
                userId: user.id,
                experienceLevel: 'Intermedio',
                daysPerWeek: 4,
                goal: 'General'
            }
        });
        console.log('Perfil configurado: Nivel Intermedio, 4 días.');
        // 3. Ejecutar Orquestación
        console.log('Ejecutando generateOrchestratedRoutine...');
        yield (0, routineOrchestrator_1.generateOrchestratedRoutine)(user.id);
        // 4. Verificación
        const routines = yield prisma.routine.findMany({
            where: { userId: user.id },
            include: {
                exercises: {
                    include: { exercise: true }
                    // order by is handled in the frontend, but we can log them
                }
            }
        });
        console.log(`\nRESULTADOS: Se generaron ${routines.length} rutinas.`);
        routines.forEach(r => {
            console.log(`\n> RUTINA: ${r.title} | DÍA: ${r.weekDay}`);
            r.exercises.forEach(re => {
                const ex = re.exercise;
                console.log(`  - [${ex.id}] ${ex.nombre} | ${re.sets} series x ${re.reps} reps`);
            });
        });
        console.log('\n--- FIN DE PRUEBA ---');
    });
}
testOrchestration()
    .catch(e => console.error('Error en prueba:', e))
    .finally(() => prisma.$disconnect());
