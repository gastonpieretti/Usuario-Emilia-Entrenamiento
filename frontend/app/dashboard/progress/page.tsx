"use client";

import { useEffect, useState } from 'react';
import api from '../../../utils/api';

interface Progress {
    id: number;
    weight: number;
    waist: number;
    legs: number;
    hips: number;
    date: string;
}

export default function ProgressPage() {
    const [progress, setProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        weight: '',
        waist: '',
        legs: '',
        hips: '',
    });

    const fetchProgress = async () => {
        try {
            const response = await api.get('/progress');
            setProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/progress', formData);
            setFormData({ weight: '', waist: '', legs: '', hips: '' });
            fetchProgress(); // Refresh list
        } catch (error) {
            console.error('Error adding progress', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div>Loading progress...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Progress</h2>

            {/* Add Progress Form */}
            <div className="bg-white p-6 rounded shadow-md mb-8">
                <h3 className="text-lg font-bold mb-4">Add New Entry</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Waist (cm)</label>
                        <input
                            type="number"
                            name="waist"
                            value={formData.waist}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Legs (cm)</label>
                        <input
                            type="number"
                            name="legs"
                            value={formData.legs}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hips (cm)</label>
                        <input
                            type="number"
                            name="hips"
                            value={formData.hips}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 min-h-[44px] rounded hover:bg-blue-700 font-bold uppercase text-sm shadow-md"
                        >
                            Add Entry
                        </button>
                    </div>
                </form>
            </div>

            {/* Progress History */}
            <div className="bg-white rounded shadow-md overflow-hidden">
                <div className="table-container">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waist</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hips</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {progress.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.weight} kg</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.waist || '-'} cm</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.legs || '-'} cm</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.hips || '-'} cm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
