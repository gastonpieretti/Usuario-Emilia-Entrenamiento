"use client";

import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import {
    Plus,
    Trash2,
    Edit3,
    Layout,
    ChevronRight,
    Search,
    Dumbbell,
    Clock,
    Copy,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
    id: number;
    name: string;
    description: string | null;
    exercises: any[];
}

export default function TemplateManagementPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchTemplates = async () => {
        try {
            const res = await api.get("/templates");
            setTemplates(res.data);
        } catch (error) {
            console.error("Error fetching templates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/templates", { name: newName, description: newDesc });
            setNewName("");
            setNewDesc("");
            setIsCreating(false);
            fetchTemplates();
        } catch (error) {
            console.error("Error creating template", error);
            alert("Error al crear la plantilla");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Seguro que quieres eliminar esta plantilla?")) return;
        try {
            await api.delete(`/templates/${id}`);
            fetchTemplates();
        } catch (error) {
            console.error("Error deleting template", error);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#581C87] flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Layout size={28} />
                        </div>
                        Plantillas de Rutina
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Gestiona estructuras de entrenamiento reutilizables para tus clientes.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar plantillas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-purple-100 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-50 transition-all font-bold text-purple-900"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-black flex items-center gap-2 shadow-lg shadow-purple-200 transition-all uppercase tracking-widest text-sm"
                    >
                        <Plus size={20} strokeWidth={3} /> Nueva Plantilla
                    </button>
                </div>
            </div>

            {/* Create Form Modalish */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-8 rounded-[3rem] border-4 border-purple-100 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0 opacity-50" />
                        <form onSubmit={handleCreateTemplate} className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-[#581C87] uppercase tracking-tight">Nueva Plantilla Maestra</h3>
                                <button type="button" onClick={() => setIsCreating(false)} className="text-purple-300 hover:text-purple-600">
                                    Cancelar
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-4">Nombre de la Plantilla</label>
                                    <input
                                        required
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Ej: Hipertrofia Intermedia 4 Días"
                                        className="w-full p-5 bg-purple-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-purple-400 uppercase tracking-widest ml-4">Descripción (Opcional)</label>
                                    <input
                                        type="text"
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="Breve detalle sobre el enfoque de esta rutina"
                                        className="w-full p-5 bg-purple-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-purple-200 focus:outline-none transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 mt-4">
                                <CheckCircle2 size={24} /> Crear Plantilla Ahora
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[3rem]" />
                    ))
                ) : filteredTemplates.map((template) => (
                    <motion.div
                        key={template.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group"
                    >
                        <Card className="h-full overflow-hidden border-2 border-transparent hover:border-purple-200 rounded-[3rem] transition-all duration-300 hover:shadow-2xl shadow-lg relative flex flex-col">
                            <CardHeader className="bg-gradient-to-br from-purple-50 to-white pb-6 pt-8 px-8 border-b border-purple-50">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                                        <Dumbbell size={24} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="text-purple-200 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <CardTitle className="text-2xl font-black text-[#581C87] uppercase tracking-tight leading-none mb-2">
                                        {template.name}
                                    </CardTitle>
                                    <p className="text-gray-400 text-sm font-bold line-clamp-1">{template.description || "Sin descripción"}</p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 flex-1">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-purple-600 leading-none">{template.exercises.length}</span>
                                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest mt-1">Ejercicios</span>
                                    </div>
                                    <div className="h-10 w-px bg-purple-100" />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-purple-600">
                                            <Clock size={14} strokeWidth={3} />
                                            <span className="text-sm font-black">45-60</span>
                                        </div>
                                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest mt-1">Min Aprox</span>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {template.exercises.slice(0, 3).map((ex: any) => (
                                        <div key={ex.id} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full" />
                                            <span className="truncate">{ex.exercise.nombre}</span>
                                        </div>
                                    ))}
                                    {template.exercises.length > 3 && (
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest pt-1">
                                            + {template.exercises.length - 3} más
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 bg-purple-50/30">
                                <Link
                                    href={`/admin/templates/${template.id}`}
                                    className="w-full bg-white hover:bg-purple-600 text-purple-600 hover:text-white py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-sm border border-purple-100 group-hover:scale-[1.02]"
                                >
                                    Editar Estructura <ChevronRight size={14} strokeWidth={3} />
                                </Link>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {!loading && filteredTemplates.length === 0 && (
                <div className="text-center py-32 bg-purple-50 rounded-[4rem] border-4 border-dashed border-purple-100">
                    <Layout className="mx-auto text-purple-200 mb-6" size={80} strokeWidth={1} />
                    <h3 className="text-3xl font-black text-purple-300 uppercase tracking-tighter">No se encontraron plantillas</h3>
                    <p className="text-purple-200 font-bold mt-2">Crea tu primera plantilla maestra arriba.</p>
                </div>
            )}
        </div>
    );
}
