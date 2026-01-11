import { NextResponse } from 'next/server';

// NOTA: Hemos eliminado los imports de "next-auth" para evitar el error de compilación.

export async function POST(req: Request) {
    try {
        // 1. Recibimos los datos del formulario (que ya incluyen el email)
        const body = await req.json();
        
        // 2. Definimos la URL de tu Backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://usuario-emilia-entrenamiento.onrender.com';

        console.log("📤 Enviando datos al backend:", backendUrl);

        // 3. Enviamos los datos al Backend (usando PUT como definimos en index.ts)
        const resBackend = await fetch(`${backendUrl}/profile`, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // 4. Manejo de errores del backend
        if (!resBackend.ok) {
            const errorText = await resBackend.text();
            console.error("❌ Error del backend:", errorText);
            return NextResponse.json({ error: "Error guardando en backend" }, { status: 500 });
        }

        // 5. Éxito
        const updatedProfile = await resBackend.json();
        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.error("💥 Error crítico en API Route:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
