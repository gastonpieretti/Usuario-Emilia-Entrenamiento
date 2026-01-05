import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { limiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

import authRoutes from './routes/authRoutes';
import routineRoutes from './routes/routineRoutes';
import dietRoutes from './routes/dietRoutes';
import progressRoutes from './routes/progressRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(cors()); // Configure origin as needed for production
app.use(limiter);

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/routines', routineRoutes);
app.use('/diets', dietRoutes);
app.use('/progress', progressRoutes);
app.use('/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Backend is running!');
});

// Error Handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
