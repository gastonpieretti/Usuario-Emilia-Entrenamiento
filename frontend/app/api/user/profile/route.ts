import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // 1. Recibimos los datos del formulario
        const body = await req.json();
        
        // 2. Definimos a dónde enviarlos (Tu Backend)
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://usuario-emilia-entrenamiento.onrender.com';

        console.log("📤 Enviando datos al backend:", backendUrl);

        // 3. Enviamos los datos directamente al Backend
        // NOTA: Si tu backend requiere Token, deberíamos pasarlo aquí. 
        // Por ahora, lo enviamos tal cual para que guarde la información.
        const resBackend = await fetch(`${backendUrl}/profile`, { 
            method: 'PUT', // Usamos PUT para actualizar
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // 4. Si el backend responde error, lo mostramos
        if (!resBackend.ok) {
            const errorData = await resBackend.json();
            console.error("❌ Error del backend:", errorData);
            // Si falla, devolvemos el error pero no rompemos la app
            return NextResponse.json({ error: "Error guardando en backend" }, { status: 500 });
        }

        // 5. Si todo salió bien, devolvemos éxito
        const updatedProfile = await resBackend.json();
        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.error("💥 Error crítico en API Route:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
