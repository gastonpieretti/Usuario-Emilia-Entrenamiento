"use client";

import { X } from 'lucide-react';

interface Exercise {
    nombre: string;
    categoria: string;
    nivel: string;
    instruccionesTecnicas: string | null;
}

interface ExerciseDetailModalProps {
    exercise: Exercise;
    onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
    if (!exercise) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-[#FAFAFF] rounded-[3rem] w-[90%] md:max-w-[600px] max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/80 hover:bg-white text-[#581C87] rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
                    aria-label="Cerrar"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                {/* Header Container (Fixed) */}
                <div className="p-8 pb-4 pt-10">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-[#E9D5FF] text-[#581C87] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            {exercise.categoria}
                        </span>
                        <span className="bg-[#FBCFE8] text-[#9D174D] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                            {exercise.nivel}
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-[#581C87] leading-tight uppercase tracking-tighter">
                        {exercise.nombre}
                    </h3>
                    <div className="w-16 h-1 bg-[#D8B4FE] mt-3 rounded-full"></div>
                </div>

                {/* Content Container (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-4 h-[2px] bg-purple-200"></span>
                                Instrucciones Técnicas
                            </h4>
                            <div className="bg-white rounded-[2rem] p-6 text-[#581C87] font-medium text-lg leading-relaxed border-2 border-[#F3E8FF] whitespace-pre-wrap shadow-inner">
                                {exercise.instruccionesTecnicas || "No hay instrucciones disponibles para este ejercicio en este momento."}
                            </div>
                        </div>

                        {/* Extra visual element for premium feel */}
                        <div className="bg-gradient-to-br from-[#E9D5FF]/30 to-[#FBCFE8]/30 p-6 rounded-[2rem] border border-white/50 italic text-[#7E22CE] text-sm text-center">
                            "La técnica correcta garantiza tu progreso y previene lesiones. ¡Ve con calma!" 💎
                        </div>
                    </div>
                </div>

                {/* Footer Container (Fixed) */}
                <div className="p-8 pt-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#7E22CE] hover:bg-[#581C87] text-white py-5 rounded-full font-black text-xl shadow-xl shadow-purple-200 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        ENTENDIDO
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E9D5FF;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D8B4FE;
                }
            `}</style>
        </div>
    );
}
