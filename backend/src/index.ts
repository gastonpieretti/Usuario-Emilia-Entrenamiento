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
  origin: true, // Esto permite que CUALQUIERA de tus dominios de Render entre sin bloqueos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// --- CONEXIÓN DE CABLES (RUTAS) ---
// Aquí unificamos todo para que el Frontend encuentre lo que busca
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

// Ruta para verificar salud del servidor
app.get('/', (req, res) => {
  res.send('Servidor de Emilia Entrenamiento: ONLINE y Puertas Abiertas');
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
