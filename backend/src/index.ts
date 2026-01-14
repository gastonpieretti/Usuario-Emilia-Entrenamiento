import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
app.use(cors({ 
  origin: true, 
  credentials: true 
}));

app.use(express.json());

// --- MAPEADO TOTAL DE RUTAS (PARA ELIMINAR EL ERROR 404) ---

// 1. Rutas de Autenticación (Login/Registro)
// Escuchamos en todas las variantes que el frontend suele buscar
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/', authRoutes);

// 2. Rutas de Usuario (Perfil/Onboarding - PUNTO 2)
app.use('/users', userRoutes);
app.use('/api/users', userRoutes);
app.use('/profile', userRoutes);

// 3. Rutas de Administrador (Panel/Usuarios/Aprobaciones - PUNTO 1)
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// --- VERIFICACIÓN DE SALUD ---
app.get('/', (req, res) => {
  res.send('Servidor Emilia Entrenamiento: TOTALMENTE OPERATIVO');
});

// Manejo de rutas no encontradas (Para que el log nos diga qué intentó el frontend)
app.use((req, res) => {
  console.log(`404 detectado en: ${req.method} ${req.url}`);
  res.status(404).json({ error: `La ruta ${req.url} no existe en el backend.` });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
