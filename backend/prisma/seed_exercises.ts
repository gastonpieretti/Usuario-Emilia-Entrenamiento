import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
    // CHEST
    {
        name: 'Pushups',
        muscleGroup: 'Chest',
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Wrist', 'Shoulder'],
        videoUrl: 'https://youtube.com/example-pushups',
        description: 'Classic pushup for chest and core.'
    },
    {
        name: 'Dumbbell Bench Press',
        muscleGroup: 'Chest',
        equipment: ['Dumbbells', 'Bench'],
        difficulty: 'Intermediate',
        injuriesToAvoid: ['Shoulder'],
        videoUrl: 'https://youtube.com/example-db-bench',
        description: 'Press dumbbells up from chest level.'
    },
    {
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: ['Barbell', 'Bench'],
        difficulty: 'Intermediate',
        injuriesToAvoid: ['Shoulder'],
        videoUrl: 'https://youtube.com/example-bb-bench',
        description: 'Classic barbell bench press.'
    },

    // BACK
    {
        name: 'Pullups',
        muscleGroup: 'Back',
        equipment: ['Pullup Bar'],
        difficulty: 'Advanced',
        injuriesToAvoid: ['Shoulder'],
        videoUrl: 'https://youtube.com/example-pullups',
        description: 'Pull body weight up to bar.'
    },
    {
        name: 'Dumbbell Row',
        muscleGroup: 'Back',
        equipment: ['Dumbbells', 'Bench'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['LowerBack'],
        videoUrl: 'https://youtube.com/example-db-row',
        description: 'Row dumbbell to hip.'
    },

    // LEGS
    {
        name: 'Bodyweight Squat',
        muscleGroup: 'Legs',
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Knee', 'LowerBack'],
        videoUrl: 'https://youtube.com/example-squat',
        description: 'Basic squat.'
    },
    {
        name: 'Goblet Squat',
        muscleGroup: 'Legs',
        equipment: ['Dumbbells', 'Kettlebell'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Knee', 'LowerBack'],
        videoUrl: 'https://youtube.com/example-goblet-squat',
        description: 'Squat holding weight at chest.'
    },
    {
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        equipment: ['Barbell'],
        difficulty: 'Advanced',
        injuriesToAvoid: ['Knee', 'LowerBack'],
        videoUrl: 'https://youtube.com/example-bb-squat',
        description: 'Back squat with barbell.'
    },
    {
        name: 'Lunge',
        muscleGroup: 'Legs',
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Knee'],
        videoUrl: 'https://youtube.com/example-lunge',
        description: 'Step forward and lower hips.'
    },

    // SHOULDERS
    {
        name: 'Dumbbell Shoulder Press',
        muscleGroup: 'Shoulders',
        equipment: ['Dumbbells'],
        difficulty: 'Intermediate',
        injuriesToAvoid: ['Shoulder'],
        videoUrl: 'https://youtube.com/example-shoulder-press',
        description: 'Press weights overhead.'
    },
    {
        name: 'Lateral Raise',
        muscleGroup: 'Shoulders',
        equipment: ['Dumbbells'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Shoulder'],
        videoUrl: 'https://youtube.com/example-lat-raise',
        description: 'Raise weights to sides.'
    },

    // ARMS
    {
        name: 'Bicep Curl',
        muscleGroup: 'Arms',
        equipment: ['Dumbbells'],
        difficulty: 'Beginner',
        injuriesToAvoid: [],
        videoUrl: 'https://youtube.com/example-curl',
        description: 'Curl weight for biceps.'
    },
    {
        name: 'Tricep Extension',
        muscleGroup: 'Arms',
        equipment: ['Dumbbells'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['Elbow'],
        videoUrl: 'https://youtube.com/example-tricep',
        description: 'Extend arm overhead.'
    },

    // CORE
    {
        name: 'Plank',
        muscleGroup: 'Core',
        equipment: ['Bodyweight'],
        difficulty: 'Beginner',
        injuriesToAvoid: ['LowerBack'],
        videoUrl: 'https://youtube.com/example-plank',
        description: 'Hold pushup top position on elbows.'
    }
];

async function main() {
    console.log('Start seeding exercises...');
    for (const ex of exercises) {
        await prisma.exercise.create({
            data: ex,
        });
    }
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
