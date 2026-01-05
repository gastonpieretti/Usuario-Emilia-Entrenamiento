import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', (userId: string) => {
            console.log(`User ${userId} joined their room`);
            socket.join(`user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const notifyUser = (userId: number, message: string, data?: any) => {
    if (io) {
        console.log(`Sending notification to user_${userId}: ${message}`);
        io.to(`user_${userId}`).emit('notification', {
            message,
            data,
            timestamp: new Date()
        });
    }
};

export const notifyRoutineUpdate = (userId: number) => {
    if (io) {
        console.log(`Emitting routine_updated to user_${userId}`);
        io.to(`user_${userId}`).emit('routine_updated', {
            message: '🏋️‍♀️ ¡Tu entrenador ha actualizado tu rutina! Revisa los cambios ahora',
            timestamp: new Date()
        });
    }
};
