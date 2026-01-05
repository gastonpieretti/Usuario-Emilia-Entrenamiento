"use client";

import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Activity, Utensils, Brain, Edit } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const profile = user?.profile || {};

    const InfoItem = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
        <div className="mb-2">
            <span className="font-semibold text-gray-700">{label}: </span>
            <span className="text-gray-600">{value || 'No especificado'}</span>
        </div>
    );

    const ListRender = ({ label, items }: { label: string, items: string[] | undefined }) => (
        <div className="mb-2">
            <span className="font-semibold text-gray-700">{label}: </span>
            <span className="text-gray-600">
                {items && items.length > 0 ? items.join(', ') : 'Ninguno'}
            </span>
        </div>
    )

    if (!user) return <div>Cargando...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
                {/* Future Feature: Edit Profile Button */}
                {/* <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Edit size={16} /> Editar
                </button> */}
            </div>

            {/* Basic User Info */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="text-blue-500" /> Información Personal
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Nombre" value={`${user.name} ${user.lastName || ''}`} />
                    <InfoItem label="Email" value={user.email} />
                    <InfoItem label="Whatsapp" value={profile.whatsapp} />
                    <InfoItem label="Ciudad" value={profile.city} />
                    <InfoItem label="País" value={profile.country} />
                    <InfoItem label="Fecha de Nacimiento" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'} />
                    <InfoItem label="Ocupación" value={profile.occupation} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Physical Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="text-green-500" /> Estado Físico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Peso" value={profile.weight ? `${profile.weight} kg` : null} />
                            <InfoItem label="Altura" value={profile.height ? `${profile.height} cm` : null} />
                        </div>
                        <div className="mt-4 space-y-2">
                            <ListRender label="Zonas de Dolor" items={profile.painAreas} />
                            <InfoItem label="Lesiones" value={profile.injuries} />
                            <InfoItem label="Nivel de Energía" value={profile.energyLevel} />
                            <InfoItem label="Medidas" value={profile.measurements} />
                        </div>
                    </CardContent>
                </Card>

                {/* Training */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="text-purple-500" /> Entrenamiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <InfoItem label="Objetivo" value={profile.goal} />
                        <InfoItem label="Experiencia" value={profile.experienceLevel} />
                        <InfoItem label="Lugar" value={profile.trainingLocation} />
                        <ListRender label="Equipamiento" items={profile.equipment} />
                        <InfoItem label="Frecuencia" value={`${profile.daysPerWeek || 0} días/semana`} />
                        <InfoItem label="Tiempo Disp." value={profile.timePerDay} />
                    </CardContent>
                </Card>

                {/* Nutrition */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="text-orange-500" /> Nutrición
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <InfoItem label="Preferencia" value={profile.dietPreference} />
                        <InfoItem label="Comidas/día" value={profile.mealsPerDay} />
                        <InfoItem label="Agua" value={profile.waterIntake} />
                        <InfoItem label="Desayuna" value={profile.breakfast} />
                        <InfoItem label="No le gusta" value={profile.dislikedFood} />
                        <InfoItem label="Debe incluir" value={profile.mustIncludeFood} />
                    </CardContent>
                </Card>

                {/* Psychology */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="text-pink-500" /> Psicología y Objetivos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <InfoItem label="Objetivo Emocional" value={profile.emotionalGoal} />
                        <InfoItem label="Planes Previos" value={profile.prevPlans ? 'Sí' : 'No'} />
                        <ListRender label="Causas Abandono" items={profile.abandonmentCauses} />
                        <InfoItem label="Comentarios" value={profile.comments} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
