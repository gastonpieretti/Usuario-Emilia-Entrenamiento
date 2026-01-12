"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const http_1 = require("http");
const socket_1 = require("./services/socket");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const routineRoutes_1 = __importDefault(require("./routes/routineRoutes"));
const dietRoutes_1 = __importDefault(require("./routes/dietRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
// MUY IMPORTANTE: Manejar explícitamente el preflight para móviles
app.options('*', (0, cors_1.default)());
// app.use(limiter);
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
app.use('/routines', routineRoutes_1.default);
app.use('/diets', dietRoutes_1.default);
app.use('/progress', progressRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/messages', messageRoutes_1.default);
app.use('/templates', templateRoutes_1.default);
app.use('/ai', aiRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Backend is running!');
});
// Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initSocket)(httpServer);
// Listen on 0.0.0.0 to ensure external access in containerized environments
httpServer.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});
