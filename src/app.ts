import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/application/applicationRoutes.js';
import noteRoutes from './routes/application/noteRoutes.js';

const app = express();

app.use(express.json());

// Serve Swagger UI at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register application routes
app.use('/api/user', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications', noteRoutes);

// Root endpoint - just for health check / welcome message
app.get('/', (_req, res) => {
  res.send('Welcome to Bewerbungsmanager!');
});

export default app;
