import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURACIÓN DE SEGURIDAD TOTAL ---
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// --- MAPEADO DE RUTAS (SOLUCIÓN AL 404) ---
// Registramos las rutas de todas las formas posibles que el frontend suele usar
app.use('/auth', authRoutes);         // Para /auth/login
app.use('/api/auth', authRoutes);     // Para /api/auth/login
app.use('/users', userRoutes);        // Para /users/profile
app.use('/api/users', userRoutes);    // Para /api/users/profile
app.use('/', authRoutes);             // Para /login directo
app.use('/', userRoutes);             // Para /profile directo
app.use('/admin', adminRoutes);

// Ruta para verificar salud del servidor
app.get('/', (req, res) => {
  res.send('Servidor de Emilia Entrenamiento: ONLINE');
});

app.listen(PORT, () => {
  console.error(`Servidor ejecutándose en puerto ${PORT}`);
});
