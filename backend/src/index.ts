// ... después de los imports
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes); // Doble capa por si el frontend usa prefijo
app.use('/', userRoutes);
app.use('/', authRoutes);
