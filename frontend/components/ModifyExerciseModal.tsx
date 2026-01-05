"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Edit3, Youtube, BookOpen } from "lucide-react";
import api from "../utils/api";

interface MasterExercise {
    id: number;
    nombre: string;
    urlVideoLoop: string;
    instruccionesTecnicas: string;
}

interface ModifyExerciseModalProps {
    routineExerciseId?: number;
    templateExerciseId?: number;
    currentExercise: any;
    currentSets: number;
    currentReps: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ModifyExerciseModal({
    routineExerciseId,
    templateExerciseId,
    currentExercise,
    currentSets,
    currentReps,
    onClose,
    onConfirm,
}: ModifyExerciseModalProps) {
    const [masterExercises, setMasterExercises] = useState<MasterExercise[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<number>(currentExercise.id);
    const [selectedExercise, setSelectedExercise] = useState<any>(currentExercise);
    const [sets, setSets] = useState<number>(currentSets);
    const [reps, setReps] = useState<string>(currentReps);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const res = await api.get("/routines/exercises/all");
                setMasterExercises(res.data);
            } catch (error) {
                console.error("Error fetching master exercises", error);
            }
        };
        fetchMasterData();
    }, []);

    const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedExerciseId(id);
        const ex = masterExercises.find((m) => m.id === id);
        if (ex) {
            setSelectedExercise(ex);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (routineExerciseId) {
                await api.patch(`/routines/exercises/${routineExerciseId}`, {
                    exerciseId: selectedExerciseId,
                    sets: sets,
                    reps: reps,
                });
            } else if (templateExerciseId) {
                await api.patch(`/templates/exercises/${templateExerciseId}`, {
                    exerciseId: selectedExerciseId,
                    sets: sets,
                    reps: reps,
                });
            }
            onConfirm();
            onClose();
        } catch (error) {
            console.error("Error updating exercise", error);
            alert("Error al actualizar el ejercicio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <div
                className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 md:p-10 bg-gradient-to-br from-purple-50 to-white border-b border-purple-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-purple-300 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-full"
                    >
                        <X size={28} />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em]">Administración</h4>
                            <h3 className="text-2xl md:text-3xl font-black text-[#581C87] leading-tight">Modificar Ejercicio</h3>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8">
                    {/* Selector de Ejercicio */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-[#581C87] uppercase tracking-widest flex items-center gap-2">
                            Nuevo Ejercicio (Base de Datos)
                        </label>
                        <select
                            value={selectedExerciseId}
                            onChange={handleExerciseChange}
                            className="w-full bg-[#F3E8FF] border-2 border-[#E9D5FF] rounded-2xl p-4 text-[#581C87] font-bold text-lg focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all appearance-none cursor-pointer"
                        >
                            {masterExercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preview de Instrucciones y Video */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> Instrucciones
                            </label>
                            <div className="bg-gray-50 rounded-3xl p-5 text-gray-600 text-sm leading-relaxed border border-gray-100 max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {selectedExercise?.instruccionesTecnicas || "No hay instrucciones disponibles."}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                <Youtube size={14} /> Vista Previa
                            </label>
                            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border-2 border-purple-100">
                                {selectedExercise?.urlVideoLoop ? (
                                    <video
                                        src={selectedExercise.urlVideoLoop}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs italic">
                                        Sin video disponible
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inputs de Series y Reps */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#581C87] uppercase tracking-widest">Series</label>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(parseInt(e.target.value))}
                                className="w-full bg-white border-2 border-[#E9D5FF] rounded-2xl p-5 text-[#581C87] font-black text-2xl text-center focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black text-[#581C87] uppercase tracking-widest">Reps</label>
                            <input
                                type="text"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="w-full bg-white border-2 border-[#E9D5FF] rounded-2xl p-5 text-[#581C87] font-black text-2xl text-center focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all shadow-sm"
                                placeholder="Ej: 12-15"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 md:p-10 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-6 rounded-full font-black text-xl shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={24} />
                                GUARDAR CAMBIOS
                            </>
                        )}
                    </button>
                    <p className="text-center text-gray-400 text-[10px] mt-4 font-bold uppercase tracking-widest">
                        Los cambios se reflejarán en la rutina del usuario al instante
                    </p>
                </div>
            </div>
        </div>
    );
}
