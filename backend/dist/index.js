"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const http_1 = require("http");
const socket_1 = require("./services/socket");
dotenv_1.default.config();
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
// Security Middleware (Temporarily disabled for debugging)
// app.use(helmet());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
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
httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
