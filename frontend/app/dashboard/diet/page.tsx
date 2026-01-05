"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';

interface Diet {
    id: number;
    title: string;
    description: string;
}

export default function DietPage() {
    const [diets, setDiets] = useState<Diet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiets = async () => {
            try {
                const response = await api.get('/diets');
                setDiets(response.data);
            } catch (error) {
                console.error('Error fetching diets', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiets();
    }, []);

    if (loading) return <div>Loading diets...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Diet</h2>
            {diets.length === 0 ? (
                <p>No diet assigned yet.</p>
            ) : (
                <div className="grid gap-4">
                    {diets.map((diet) => (
                        <div key={diet.id} className="bg-white p-6 rounded shadow-md">
                            <h3 className="text-xl font-bold mb-2">{diet.title}</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{diet.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
