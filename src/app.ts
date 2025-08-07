import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bewerbungsmanager API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
});

const app = express();

app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_req, res) => {
  res.send('Willkommen beim Bewerbungsmanager!');
});

export default app;
