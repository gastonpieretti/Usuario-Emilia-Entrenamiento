import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
// Render usa el puerto 10000 por defecto, lo dejamos flexible
const PORT = process.env.PORT || 10000;

// Configuración de Seguridad
app.use(cors({ 
  origin: true, 
  credentials: true 
}));

app.use(express.json());

// MAPEADO DE RUTAS PARA ADMINISTRADOR Y USUARIO
// Estas rutas conectan el Frontend con los controladores que ya arreglamos
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/users', userRoutes);
app.use('/', userRoutes);
app.use('/', authRoutes);

// Test de vida del servidor
app.get('/', (req, res) => {
  res.send('Servidor Emilia Entrenamiento: Operativo');
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
