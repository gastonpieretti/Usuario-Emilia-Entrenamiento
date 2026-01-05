"use client";

import { useState, useEffect, use } from 'react';
import api from '../../../../utils/api';
import { useRouter } from 'next/navigation';

export default function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        weekDay: '',
    });

    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                // Note: We might need a specific endpoint to get a single routine by ID if not already available or if getRoutines filters.
                // Assuming we can filter or get by ID. If not, we might need to update backend.
                // Actually, looking at routineController, getRoutines returns a list. 
                // We don't have a specific "get routine by id" endpoint in the controller shown earlier?
                // Wait, let me check routineController again.
                // It has updateRoutine (PUT /routines/:id) and deleteRoutine (DELETE /routines/:id).
                // It does NOT seem to have GET /routines/:id explicitly in the snippet I saw earlier?
                // Let's assume for now we might need to add it or filter from the list if the list is small, 
                // BUT best practice is to have GET /routines/:id.
                // Let's try to fetch it. If it fails, I'll fix the backend.
                // Actually, looking at the previous `routineController.ts` content:
                // `export const getRoutines = ...`
                // It doesn't have `getRoutine`.
                // I should probably add `getRoutine` to the backend first or now.
                // For now, I will try to fetch the list and find it, or better, add the endpoint.
                // Let's assume I will add the endpoint.

                // Wait, I can't edit backend in this tool call.
                // I'll write this file assuming the endpoint exists or I'll fix it in next steps.
                // Actually, to be safe, I'll fetch all and find. It's not efficient but works for now.
                // OR better, I'll add the endpoint in the next step.

                // Let's try to GET /routines/:id. If it's not implemented, I'll implement it.
                // The current routes might not support it.
                // Let's check routineRoutes.ts later.

                const response = await api.get(`/routines`);
                // This returns all routines. I'll filter client side for now to avoid blocking.
                const routine = response.data.find((r: any) => r.id === Number(id));

                if (routine) {
                    setFormData({
                        title: routine.title,
                        description: routine.description || '',
                        weekDay: routine.weekDay,
                    });
                }
            } catch (error) {
                console.error('Error fetching routine', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/routines/${id}`, formData);
            router.push('/admin/routines');
        } catch (error) {
            console.error('Error updating routine', error);
            alert('Failed to update routine');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div>Loading routine...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Edit Routine</h2>
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
                        <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                        <select
                            name="weekDay"
                            value={formData.weekDay}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description / Exercises</label>
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
