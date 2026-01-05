"use client";

import { useState, useEffect, use } from 'react';
import api from '../../../../utils/api';
import { useRouter } from 'next/navigation';

export default function EditDietPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    useEffect(() => {
        const fetchDiet = async () => {
            try {
                // Similar to routines, we fetch all and filter client side for now.
                const response = await api.get(`/diets`);
                const diet = response.data.find((d: any) => d.id === Number(id));

                if (diet) {
                    setFormData({
                        title: diet.title,
                        description: diet.description || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching diet', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiet();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/diets/${id}`, formData);
            router.push('/admin/diets');
        } catch (error) {
            console.error('Error updating diet', error);
            alert('Failed to update diet');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div>Loading diet...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Edit Diet</h2>
            <div className="bg-white p-8 rounded shadow-md max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description / Meal Plan</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
