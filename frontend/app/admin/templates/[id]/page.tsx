"use client";

import React, { useEffect, useState, use } from "react";
import api from "@/utils/api";
import {
    ChevronLeft,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Dumbbell,
    Layout,
    Save,
    X,
    PlusCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import AddExerciseModal from "@/components/AddExerciseModal";
import ModifyExerciseModal from "@/components/ModifyExerciseModal";

interface TemplateExercise {
    id: number;
    exercise: {
        id: number;
        nombre: string;
    };
    sets: number;
    reps: string;
    order: number;
}

interface Template {
    id: number;
    name: string;
    description: string | null;
    exercises: TemplateExercise[];
}

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [exerciseToModify, setExerciseToModify] = useState<TemplateExercise | null>(null);

    const fetchTemplate = async () => {
        try {
            const res = await api.get("/templates");
            const found = res.data.find((t: any) => t.id === Number(id));
            setTemplate(found);
            if (found) {
                setEditData({ name: found.name, description: found.description || "" });
            }
        } catch (error) {
            console.error("Error fetching template", error);
        } finally {
            setLoading(false);
        }
    };

    const [editData, setEditData] = useState({ name: "", description: "" });
    const [saving, setSaving] = useState(false);

    const handleUpdateTemplate = async () => {
        setSaving(true);
        try {
            await api.put(`/templates/${id}`, editData);
            fetchTemplate();
            alert("Plantilla actualizada");
        } catch (error) {
            console.error("Error updating template", error);
            alert("Error al actualizar la plantilla");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, [id]);

    const handleMove = async (reId: number, direction: 'up' | 'down') => {
        if (!template) return;
        const exercises = [...template.exercises].sort((a, b) => a.order - b.order);
        const index = exercises.findIndex(ex => ex.id === reId);
        if (index === -1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= exercises.length) return;

        const current = exercises[index];
        const target = exercises[targetIndex];

        // Robust swap
        let newCurrentOrder = target.order;
        let newTargetOrder = current.order;

        if (newCurrentOrder === newTargetOrder) {
            newCurrentOrder = targetIndex;
            newTargetOrder = index;
        }

        try {
            await Promise.all([
                api.patch(`/templates/exercises/${current.id}`, { order: newCurrentOrder }),
                api.patch(`/templates/exercises/${target.id}`, { order: newTargetOrder })
            ]);
            fetchTemplate();
        } catch (error) {
            console.error("Error moving exercise", error);
            alert("Error al mover el ejercicio");
        }
    };

    const handleDeleteExercise = async (reId: number) => {
        if (!confirm("¿Eliminar este ejercicio de la plantilla?")) return;
        try {
            await api.delete(`/templates/exercises/${reId}`);
            fetchTemplate();
        } catch (error) {
            console.error("Error deleting exercise", error);
        }
    };

    const handleAddConfirm = () => {
        fetchTemplate();
        setShowAddModal(false);
    };

    const handleModifyConfirm = () => {
        fetchTemplate();
        setExerciseToModify(null);
    };

    if (loading) return <div className="p-20 text-center font-black text-purple-200">CARGANDO...</div>;
    if (!template) return <div className="p-20 text-center font-black text-red-400">PLANTILLA NO ENCONTRADA</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            {/* Nav Header */}
            <div className="flex items-center gap-6">
                <Link href="/admin/templates" className="p-4 bg-white rounded-2xl shadow-sm border border-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                    <ChevronLeft size={24} strokeWidth={3} />
                </Link>
                <div>
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em]">Editor de Plantillas</h4>
                    <h1 className="text-4xl font-black text-[#581C87] uppercase tracking-tighter">{template.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="rounded-[3rem] border-2 border-purple-100 overflow-hidden">
                        <CardHeader className="bg-purple-50/50 p-8">
                            <CardTitle className="text-lg font-black text-[#581C87] uppercase tracking-widest">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Nombre</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-white border-2 border-purple-100 rounded-2xl p-4 text-[#581C87] font-bold focus:border-purple-300 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Descripción</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-white border-2 border-purple-100 rounded-2xl p-4 text-gray-600 font-bold focus:border-purple-300 focus:outline-none transition-all min-h-[100px]"
                                />
                            </div>

                            <button
                                onClick={handleUpdateTemplate}
                                disabled={saving}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-200 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
                                GUARDAR CAMBIOS
                            </button>

                            <div className="pt-4 border-t border-purple-50">
                                <span className="text-3xl font-black text-purple-600">{template.exercises.length}</span>
                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest ml-2">Ejercicios Totales</span>
                            </div>
                        </CardContent>
                    </Card>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3"
                    >
                        <Plus size={24} strokeWidth={3} /> Añadir Ejercicio
                    </button>
                </div>

                {/* Exercises List */}
                <div className="md:col-span-2 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {template.exercises.length === 0 ? (
                            <div className="p-20 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 italic text-gray-400 font-bold">
                                No hay ejercicios en esta plantilla todavía.
                            </div>
                        ) : template.exercises.sort((a, b) => a.order - b.order).map((re, index) => (
                            <motion.div
                                key={re.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-4 p-5 bg-white rounded-[2.5rem] border-2 border-purple-50 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col gap-1">
                                    <button
                                        disabled={index === 0}
                                        onClick={() => handleMove(re.id, 'up')}
                                        className={`p-1.5 rounded-full ${index === 0 ? 'text-gray-100' : 'text-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-colors'}`}
                                    >
                                        <ChevronUp size={22} strokeWidth={3} />
                                    </button>
                                    <button
                                        disabled={index === template.exercises.length - 1}
                                        onClick={() => handleMove(re.id, 'down')}
                                        className={`p-1.5 rounded-full ${index === template.exercises.length - 1 ? 'text-gray-100' : 'text-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-colors'}`}
                                    >
                                        <ChevronDown size={22} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-black text-[#581C87] uppercase text-sm group-hover:text-purple-600 transition-colors">{re.exercise.nombre}</h4>
                                    <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mt-0.5">
                                        {re.sets} series x {re.reps} reps
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExerciseToModify(re)}
                                        className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                    >
                                        Modificar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteExercise(re.id)}
                                        className="p-4 text-purple-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Use AddExerciseModal */}
            {showAddModal && (
                <AddExerciseModal
                    templateId={Number(id)}
                    onClose={() => setShowAddModal(false)}
                    onConfirm={handleAddConfirm}
                />
            )}

            {/* Use ModifyExerciseModal */}
            {exerciseToModify && (
                <ModifyExerciseModal
                    templateExerciseId={exerciseToModify.id}
                    currentExercise={exerciseToModify.exercise}
                    currentSets={exerciseToModify.sets}
                    currentReps={exerciseToModify.reps}
                    onClose={() => setExerciseToModify(null)}
                    onConfirm={handleModifyConfirm}
                />
            )}
        </div>
    );
}
