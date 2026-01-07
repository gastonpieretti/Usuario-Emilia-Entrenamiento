import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { createServer } from 'http';
import { initSocket } from './services/socket';

import authRoutes from './routes/authRoutes';
import routineRoutes from './routes/routineRoutes';
import dietRoutes from './routes/dietRoutes';
import progressRoutes from './routes/progressRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import messageRoutes from './routes/messageRoutes';
import templateRoutes from './routes/templateRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Logger for debugging connection issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Debug Logger for CORS
app.use((req, res, next) => {
  console.log(`[CORS DEBUG] Method: ${req.method}, URL: ${req.url}, Origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  'https://usuarioee.onrender.com',
  'https://usuarioee.onrender.com/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// MUY IMPORTANTE: Manejar explícitamente el preflight para móviles
app.options('*', cors());
// app.use(limiter);

app.use(express.json());


app.use('/auth', authRoutes);
app.use('/routines', routineRoutes);
app.use('/diets', dietRoutes);
app.use('/progress', progressRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);
app.use('/templates', templateRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running!');
});

// Error Handler (must be last)
app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

// Listen on 0.0.0.0 to ensure external access in containerized environments
httpServer.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
