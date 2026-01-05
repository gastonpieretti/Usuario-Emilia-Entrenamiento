"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, CheckCircle2, Layout, Calendar } from "lucide-react";
import api from "../utils/api";
import Link from "next/link";

interface Template {
    id: number;
    name: string;
    description: string | null;
    exercises: any[];
}

interface ApplyTemplateModalProps {
    userId: number;
    onClose: () => void;
    onConfirm: () => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function ApplyTemplateModal({
    userId,
    onClose,
    onConfirm,
}: ApplyTemplateModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
    const [selectedDay, setSelectedDay] = useState<string>("Lunes");
    const [customTitle, setCustomTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingTemplates, setFetchingTemplates] = useState(true);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState<{ message: string } | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get("/templates");
                setTemplates(res.data);
                if (res.data.length > 0) {
                    setSelectedTemplateId(res.data[0].id);
                    setCustomTitle(res.data[0].name);
                }
            } catch (error) {
                console.error("Error fetching templates", error);
            } finally {
                setFetchingTemplates(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleApply = async (mode?: 'replace' | 'add') => {
        if (!selectedTemplateId) return;
        setLoading(true);
        setError("");
        try {
            await api.post(`/templates/apply`, {
                templateId: selectedTemplateId,
                userId: userId,
                weekDay: selectedDay,
                title: customTitle,
                mode: mode
            });
            onConfirm();
            onClose();
        } catch (error: any) {
            console.error("Error applying template", error);
            if (error.response?.status === 409) {
                setConflict({ message: error.response.data.message });
            } else {
                setError(error.response?.data?.error || "Error al aplicar la plantilla");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        setSelectedTemplateId(id);
        const t = templates.find(temp => temp.id === id);
        if (t) setCustomTitle(t.name);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[130] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-purple-50 to-white border-b border-purple-100 relative">
                    <button onClick={onClose} className="absolute top-8 right-8 text-purple-300 hover:text-purple-600 transition-colors">
                        <X size={28} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Copy size={24} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Herramientas Admin</h4>
                            <h3 className="text-2xl font-black text-[#581C87] uppercase tracking-tighter">Aplicar Plantilla</h3>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 space-y-6">
                    {fetchingTemplates ? (
                        <div className="text-center py-10 font-bold text-purple-200 animate-pulse uppercase tracking-widest">Cargando plantillas...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10">
                            <Layout className="mx-auto text-purple-100 mb-4" size={50} />
                            <p className="text-gray-400 font-bold">No hay plantillas creadas todavía.</p>
                            <Link href="/admin/templates" className="text-purple-600 font-black text-sm uppercase mt-4 block underline">Ir a crear plantillas</Link>
                        </div>
                    ) : conflict ? (
                        <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2rem] space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shrink-0">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[#92400E] font-black uppercase text-lg leading-tight mb-2">¡Conflicto de Rutina!</h4>
                                    <p className="text-[#92400E] font-bold text-sm opacity-80">{conflict.message}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => handleApply('replace')}
                                    disabled={loading}
                                    className="w-full bg-white border-2 border-amber-200 hover:border-amber-500 text-amber-700 font-black py-4 rounded-2xl transition-all shadow-sm hover:shadow-md uppercase text-sm tracking-widest"
                                >
                                    {loading ? "Procesando..." : "REMPLAZAR"}
                                </button>
                                <button
                                    onClick={() => handleApply('add')}
                                    disabled={loading}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl uppercase text-sm tracking-widest"
                                >
                                    {loading ? "Procesando..." : "AGREGAR"}
                                </button>
                                <button
                                    onClick={() => setConflict(null)}
                                    className="w-full text-amber-500 font-bold py-2 text-xs uppercase tracking-widest hover:underline"
                                >
                                    Volver atrás
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-4">Seleccionar Plantilla</label>
                                <select
                                    value={selectedTemplateId}
                                    onChange={handleTemplateChange}
                                    className="w-full bg-purple-50 border-2 border-transparent rounded-[1.5rem] p-4 text-[#581C87] font-bold focus:bg-white focus:border-purple-200 focus:outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.exercises.length} ej.)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-4">DÍA DE DESTINO</label>
                                    <select
                                        value={selectedDay}
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                        className="w-full bg-purple-50 border-2 border-transparent rounded-[1.5rem] p-4 text-[#581C87] font-bold focus:bg-white focus:border-purple-200 focus:outline-none transition-all"
                                    >
                                        {DAYS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-4">Nombre de la Rutina</label>
                                    <input
                                        type="text"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="Ej: Empuje A"
                                        className="w-full bg-purple-50 border-2 border-transparent rounded-[1.5rem] p-4 text-[#581C87] font-bold focus:bg-white focus:border-purple-200 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!conflict && templates.length > 0 && (
                    <div className="p-8 border-t border-gray-100">
                        <button
                            onClick={() => handleApply()}
                            disabled={loading || !selectedTemplateId}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-200 text-white py-6 rounded-full font-black text-lg shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 size={24} /> Aplicar a Usuario
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-widest">Se copiarán todos los ejercicios y parámetros de la plantilla seleccionada.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
