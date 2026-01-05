"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '../../../utils/api';
import { Info, Repeat, Clock, ChevronRight, Lock, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import ExerciseDetailModal from '../../../components/ExerciseDetailModal';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercise {
    id: number;
    nombre: string;
    categoria: string;
    nivel: string;
    urlVideoLoop: string;
    instruccionesTecnicas: string;
    seriesSugeridas: number;
    repsSugeridas: string;
    idVariante?: number;
}

interface RoutineExercise {
    id: number;
    exercise: Exercise;
    sets: number;
    reps: string;
}

interface Routine {
    id: number;
    title: string;
    description: string;
    weekDay: string;
    month: number;
    activationDate: string | null;
    exercises: RoutineExercise[];
}

const DAYS_OF_WEEK_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function RoutinePage() {
    const { user } = useAuth();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<Exercise | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const response = await api.get('/routines');
                setRoutines(response.data);

                // Expand current month by default
                const now = new Date();
                const currentMonthRoutine = response.data.find((r: Routine) => {
                    if (!r.activationDate) return false;
                    const start = new Date(r.activationDate);
                    const end = new Date(start);
                    end.setDate(end.getDate() + 30);
                    return now >= start && now <= end;
                });
                if (currentMonthRoutine) {
                    setExpandedMonth(currentMonthRoutine.month);
                } else if (response.data.length > 0) {
                    setExpandedMonth(1);
                }
            } catch (error) {
                console.error('Error fetching routines', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutines();

        const handleUpdate = () => {
            fetchRoutines();
        };

        window.addEventListener('routine_updated', handleUpdate);
        return () => window.removeEventListener('routine_updated', handleUpdate);
    }, []);

    const groupedRoutines = useMemo(() => {
        const groups: Record<number, Routine[]> = {};
        routines.forEach(r => {
            if (!groups[r.month]) groups[r.month] = [];
            groups[r.month].push(r);
        });

        // Sort days within months
        Object.keys(groups).forEach(m => {
            groups[Number(m)].sort((a, b) =>
                DAYS_OF_WEEK_ORDER.indexOf(a.weekDay) - DAYS_OF_WEEK_ORDER.indexOf(b.weekDay)
            );
        });

        return groups;
    }, [routines]);

    const getMonthStatus = (monthNumber: number, monthRoutines: Routine[]) => {
        let start: Date | null = null;
        let end: Date | null = null;

        // Prioridad 1: Configuración en el perfil del usuario (planSchedule)
        if (user?.planSchedule && Array.isArray(user.planSchedule)) {
            const config = user.planSchedule.find(s => s.month === monthNumber);
            if (config) {
                if (config.start) start = new Date(config.start);
                if (config.end) end = new Date(config.end);
            }
        }

        // Prioridad 2: Fecha de activación en la rutina (si no hay schedule en user)
        if (!start && monthRoutines.length > 0) {
            start = monthRoutines[0].activationDate ? new Date(monthRoutines[0].activationDate) : null;
        }

        if (!start) return { status: 'active', start: null, end: null };

        const now = new Date();
        // Si no hay end explícito, sumar 30 días al start
        if (!end) {
            end = new Date(start);
            end.setDate(end.getDate() + 30);
        }

        let status: 'active' | 'future' | 'past' = 'active';
        if (now < start) status = 'future';
        else if (now > end) status = 'past';

        return { status, start, end };
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (routines.length === 0 && user?.hasCompletedOnboarding) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
                <div className="bg-card rounded-2xl p-12 text-center shadow-sm border border-border space-y-6">
                    <div className="w-20 h-20 bg-secondary text-primary rounded-full flex items-center justify-center mx-auto">
                        <Clock size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-foreground">
                            Analizando tu Perfil
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
                            ¡Excelente trabajo completando el onboarding! <br />
                            Estamos validando tu <span className="text-primary font-semibold">Plan de Entrenamiento Personalizado</span>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">Mi Plan de Entrenamiento</h1>
                <p className="text-muted-foreground font-medium">Progreso estructurado de 90 días</p>
            </header>

            <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((m) => {
                    const monthRoutines = groupedRoutines[m] || [];
                    const { status, start, end } = getMonthStatus(m, monthRoutines);
                    const isExpanded = expandedMonth === m;

                    return (
                        <div key={m} className={`rounded-3xl border-2 transition-all overflow-hidden ${isExpanded ? 'border-primary/30 shadow-lg' : 'border-border shadow-sm'}`}>
                            {/* Month Header */}
                            <button
                                onClick={() => status !== 'future' && setExpandedMonth(isExpanded ? null : m)}
                                disabled={status === 'future' && monthRoutines.length > 0}
                                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${status === 'future' ? 'bg-muted/30 cursor-not-allowed opacity-60' : 'bg-card hover:bg-muted/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${status === 'active' ? 'bg-primary text-primary-foreground' : status === 'past' ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {m}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">MES {m}</h3>
                                        {start && (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                                                <Calendar size={12} />
                                                {formatDate(start)} - {formatDate(end)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {status === 'active' && <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">En Curso</span>}
                                    {status === 'past' && <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">Completado</span>}
                                    {status === 'future' && (
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                            <Lock size={16} />
                                            <span>Inicia {formatDate(start)}</span>
                                        </div>
                                    )}
                                    {status !== 'future' && (
                                        <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                                    )}
                                </div>
                            </button>

                            {/* Month Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                    >
                                        <div className="p-8 bg-muted/5 space-y-12 border-t border-border">
                                            {monthRoutines.length === 0 ? (
                                                <div className="text-center py-10 space-y-4">
                                                    <div className="p-4 bg-secondary/30 rounded-full w-fit mx-auto">
                                                        <Clock size={32} className="text-primary" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">Próximamente disponible para tu nivel</p>
                                                </div>
                                            ) : (
                                                monthRoutines.map((routine) => (
                                                    <section key={routine.id} className="space-y-8">
                                                        <div className="flex items-center gap-3 border-b border-border pb-4">
                                                            <div className="bg-primary/10 text-primary-foreground px-4 py-1 rounded-lg font-bold text-sm uppercase tracking-wider">
                                                                {routine.weekDay}
                                                            </div>
                                                            <h2 className="text-2xl font-bold text-foreground">
                                                                {routine.title}
                                                            </h2>
                                                        </div>

                                                        <div className="grid gap-10">
                                                            {routine.exercises.map((re) => (
                                                                <div key={re.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                                                                    <div className="p-5 border-b border-border bg-muted/30">
                                                                        <h4 className="text-lg font-bold text-foreground text-center">
                                                                            {re.exercise.nombre}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="grid md:grid-cols-2">
                                                                        <div className="bg-black">
                                                                            <LazyVideo src={re.exercise.urlVideoLoop} />
                                                                        </div>
                                                                        <div className="p-6 flex flex-col justify-between space-y-6">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="bg-secondary/50 p-4 rounded-xl border border-primary/10 text-center">
                                                                                    <span className="block text-xs font-bold text-primary-foreground uppercase opacity-60">Series</span>
                                                                                    <span className="text-2xl font-bold text-foreground">{re.sets}</span>
                                                                                </div>
                                                                                <div className="bg-secondary/50 p-4 rounded-xl border border-primary/10 text-center">
                                                                                    <span className="block text-xs font-bold text-primary-foreground uppercase opacity-60">Reps</span>
                                                                                    <span className="text-2xl font-bold text-foreground">{re.reps}</span>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => setSelectedExerciseDetails(re.exercise)}
                                                                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold transition-all hover:opacity-90 shadow-sm"
                                                                            >
                                                                                <Info size={16} /> Instrucciones
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {selectedExerciseDetails && (
                <ExerciseDetailModal
                    exercise={selectedExerciseDetails}
                    onClose={() => setSelectedExerciseDetails(null)}
                />
            )}
        </div>
    );
}

function LazyVideo({ src }: { src: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const videoRef = (v: HTMLVideoElement | null) => {
        if (!v) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                v.play().catch(() => { });
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        observer.observe(v);
    };

    return (
        <div className="w-full aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                className={`w-full h-full object-contain transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                src={isVisible ? src : undefined}
                loop muted autoPlay playsInline
            />
            {!isVisible && <div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
        </div>
    );
}
