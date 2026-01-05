import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING SEED ---');

    // 1. Admin User
    const adminEmail = 'admin@admin.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Gaston',
            lastName: 'Admin',
            passwordHash: hashedPassword,
            role: 'admin',
            isApproved: true,
        },
    });
    console.log('Admin user ready.');

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
