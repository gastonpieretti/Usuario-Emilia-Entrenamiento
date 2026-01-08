import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING SEED ---');

    // 1. Admin Users
    const admins = [
        { email: 'admin@admin.com', name: 'Gaston', lastName: 'Admin', password: 'admin123' },
        { email: 'gastonpieretti@gmail.com', name: 'Gaston', lastName: 'Pieretti', password: '123456' }
    ];

    for (const a of admins) {
        const hashedPassword = await bcrypt.hash(a.password, 10);
        await prisma.user.upsert({
            where: { email: a.email },
            update: {
                role: 'admin',
                isApproved: true,
                passwordHash: hashedPassword
            },
            create: {
                email: a.email,
                name: a.name,
                lastName: a.lastName,
                passwordHash: hashedPassword,
                role: 'admin',
                isApproved: true,
            },
        });
    }
    console.log('Admin users ready.');

    // 2. Fundamental Exercises
    const exercises = [
        { nombre: 'Sentadilla', categoria: 'Leg', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '12' },
        { nombre: 'Flexiones de Brazo', categoria: 'Empuje', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '12' },
        { nombre: 'Remo con Banda', categoria: 'Tracción', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '12' },
        { nombre: 'Zancadas', categoria: 'Leg', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '10' },
        { nombre: 'Press Militar', categoria: 'Empuje', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '12' },
        { nombre: 'Remo Invertido', categoria: 'Tracción', nivel: 'Principiante', urlVideoLoop: 'https://...', instruccionesTecnicas: '...', seriesSugeridas: 3, repsSugeridas: '12' },
    ];

    for (const ex of exercises) {
        await prisma.exercise.upsert({
            where: { id: exercises.indexOf(ex) + 1 },
            update: ex,
            create: { ...ex, id: exercises.indexOf(ex) + 1 }
        });
    }
    console.log('Fundamental exercises seeded.');

    console.log('--- SEED COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
