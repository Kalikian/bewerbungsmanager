import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../src/swagger.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(express.json());
//Swagger-UI unter /api/docs erreichbar
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/user', userRoutes);

app.get('/', (_req, res) => {
  res.send('Willkommen beim Bewerbungsmanager!');
});

export default app;
