import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth"; // Verifica que esta ruta exista, si no usa la de abajo
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Alternativa común

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        // Verificación de seguridad: ¿Está logueado el usuario?
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        
        // URL de tu Backend en Render
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://usuario-emilia-entrenamiento.onrender.com';

        console.log("Enviando perfil al backend:", backendUrl);

        // Enviamos los datos al Backend real
        const resBackend = await fetch(`${backendUrl}/profile`, { 
            method: 'PUT', // Usamos PUT para actualizar
            headers: {
                'Content-Type': 'application/json',
                // Si tu backend pide token, descomenta la siguiente línea:
                // 'Authorization': `Bearer ${session.user.accessToken}` 
            },
            body: JSON.stringify(body)
        });

        if (!resBackend.ok) {
            const errorData = await resBackend.json();
            console.error("Error del backend:", errorData);
            throw new Error(errorData.error || 'Error en backend');
        }

        const updatedProfile = await resBackend.json();
        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.error("Error en API Route /user/profile:", error);
        return NextResponse.json({ error: "Error guardando perfil" }, { status: 500 });
    }
}
