"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }: { children: React.ReactNode, userId?: number }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || '', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);
            if (userId) {
                socketInstance.emit('join', userId.toString());
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        socketInstance.on('notification', (payload: { message: string }) => {
            toast.success(payload.message, {
                duration: 5000,
                position: 'top-right',
                icon: '🏋️‍♀️',
                style: {
                    borderRadius: '20px',
                    background: '#581C87',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '12px'
                }
            });
        });

        socketInstance.on('routine_updated', (payload: { message: string }) => {
            toast.success(payload.message, {
                duration: 6000,
                position: 'top-right',
                icon: '🔥',
                style: {
                    borderRadius: '20px',
                    background: '#9333ea',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '16px'
                }
            });
            // Global event for components to refresh
            window.dispatchEvent(new CustomEvent('routine_updated'));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            <Toaster />
            {children}
        </SocketContext.Provider>
    );
};
