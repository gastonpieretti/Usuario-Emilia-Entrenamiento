import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth"; 
// Asegúrate de importar authOptions correctamente. Si da error, usa una ruta relativa simple o elimínalo si no lo usas.
// Si no tienes authOptions a mano, usaremos una solución temporal abajo.

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // --- TRUCO DE SEGURIDAD ---
        // Vamos a intentar sacar el email de la sesión. 
        // Si falla el import de next-auth, asegúrate de que 'body' ya traiga el email 
        // o inyectaló aquí si lo tienes en el contexto.
        // Por ahora, enviaremos todo el body tal cual.
        
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://usuario-emilia-entrenamiento.onrender.com';

        console.log("📤 Enviando datos al backend:", backendUrl);

        // OJO: Necesitamos enviar el email. 
        // Si tu formulario no tiene campo 'email', asegúrate de agregarlo al objeto body 
        // antes de enviarlo si lo tienes disponible en el cliente.
        // Si el usuario está logueado, su email debería estar accesible.
        
        const resBackend = await fetch(`${backendUrl}/profile`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body) // El body debe incluir { email: "usuario@ejemplo.com", ... }
        });

        if (!resBackend.ok) {
            const text = await resBackend.text(); // Leemos como texto por si es HTML
            console.error("❌ Respuesta del backend:", text);
            return NextResponse.json({ error: "Error en backend: " + text.substring(0, 100) }, { status: 500 });
        }

        const updatedProfile = await resBackend.json();
        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.error("💥 Error crítico en API Route:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
