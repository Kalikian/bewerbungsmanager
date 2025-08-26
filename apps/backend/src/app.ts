import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/user/userRoutes.js';
import applicationRoutes from './routes/application/applicationRoutes.js';
import noteRoutes from './routes/application/noteRoutes.js';
import attachmentRoutes from './routes/application/attachmentRoutes.js';
import cors from 'cors';

const app = express();

app.use(express.json());

app.use(cors({ origin: ['http://localhost:3001'], credentials: true }));

// Serve Swagger UI at /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register application routes
app.use('/api/user', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications', noteRoutes);
app.use('/api/applications/', attachmentRoutes);
app.use(errorHandler); // Global error handler

// Root endpoint - just for health check / welcome message
app.get('/', (_req, res) => {
  res.send('Welcome to Bewerbungsmanager!');
});

export default app;
