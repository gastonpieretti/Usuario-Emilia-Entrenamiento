"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRoutineUpdate = exports.notifyUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        socket.on('join', (userId) => {
            console.log(`User ${userId} joined their room`);
            socket.join(`user_${userId}`);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
exports.getIO = getIO;
const notifyUser = (userId, message, data) => {
    if (io) {
        console.log(`Sending notification to user_${userId}: ${message}`);
        io.to(`user_${userId}`).emit('notification', {
            message,
            data,
            timestamp: new Date()
        });
    }
};
exports.notifyUser = notifyUser;
const notifyRoutineUpdate = (userId) => {
    if (io) {
        console.log(`Emitting routine_updated to user_${userId}`);
        io.to(`user_${userId}`).emit('routine_updated', {
            message: '🏋️‍♀️ ¡Tu entrenador ha actualizado tu rutina! Revisa los cambios ahora',
            timestamp: new Date()
        });
    }
};
exports.notifyRoutineUpdate = notifyRoutineUpdate;
