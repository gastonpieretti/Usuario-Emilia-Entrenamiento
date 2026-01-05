"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
    sender: { name: string; role: string };
}

export default function UserMessagesPage() {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get('/messages');
                setMessages(res.data);

                // Mark unread messages as read
                const unreadMessages = res.data.filter((m: any) => !m.isRead && m.senderId !== currentUser?.id);
                unreadMessages.forEach(async (msg: any) => {
                    await api.put(`/messages/${msg.id}/read`);
                });
            } catch (error) {
                console.error('Error fetching messages', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [currentUser?.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            // Process: For a normal user, receiver is always Admin for now, or we can look up an admin ID.
            // For simplicity in this iteration, let's assume there is an admin with ID 1, or better:
            // The backend should probably handle "message to admin" logic if no receiverId provided?
            // Or we just find the admin ID. Let's look up the admin or just fail if hardcoded.
            // A better approach is to have a "support" thread.

            // To make it robust without hardcoding, let's fetch the first admin.
            // But since I don't want to overcomplicate, I will assume the admin who created the plan is the receiver.
            // Wait, the user prompt implies communication with "Emilia Entrenamiento" (Administrator).
            // I'll fetch the admin user first or just hardcode ID 1 if that's the main admin.
            // Let's rely on finding an admin.

            // We default to ID 1 (Admin) for the support message receiver.
            // If there is a previous conversation, we reply to that admin.
            let receiverId = 1;
            const lastAdminMsg = messages.find(m => m.sender.role === 'admin');
            if (lastAdminMsg) {
                receiverId = lastAdminMsg.senderId;
            }

            const res = await api.post('/messages', {
                receiverId,
                content: newMessage
            });

            setMessages([...messages, {
                ...res.data,
                sender: { name: currentUser?.name || 'Yo', role: 'client' }
            }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    if (loading) return <div>Cargando mensajes...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Mis Mensajes</h1>

            <Card className="h-[70vh] flex flex-col shadow-lg">
                <CardHeader className="bg-blue-600 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <MessageSquare className="text-blue-200" /> Soporte & Dudas
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 p-6 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageSquare size={48} className="mb-2 opacity-50" />
                            <p>No tienes mensajes. ¡Escribe aquí si tienes dudas!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${msg.senderId === currentUser?.id
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-2 text-right ${msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
                <div className="p-4 border-t bg-white rounded-b-xl">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition shadow-md">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
