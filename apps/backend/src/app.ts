import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import userRoutes from './routes/user/userRoutes.js';
import applicationRoutes from './routes/application/applicationRoutes.js';
import noteRoutes from './routes/application/noteRoutes.js';
import attachmentRoutes from './routes/application/attachmentRoutes.js';
import cors, { CorsOptionsDelegate } from "cors";

const app = express();

// Allow prod origins via ENV + localhost for dev.
// Put the SAME options on app.use and app.options to satisfy preflight.
const allowedFromEnv = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Dev-Origins (falls du 127.0.0.1 nutzt, ist es auch erlaubt)
const allowedSet = new Set([
  ...allowedFromEnv,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
]);

/**
 * Minimal + safe:
 * - Mirror the request origin for allowed ones
 * - Allow "no origin" (curl/Postman)
 * - Apply SAME options to .use() and .options() to satisfy preflight
 */
const corsDelegate: CorsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin as string | undefined;

  // No Origin (curl/Postman) → allow
  if (!origin) return cb(null, { origin: true, credentials: true });

  // Only allow whitelisted origins
  const isAllowed = allowedSet.has(origin);
  cb(null, { origin: isAllowed, credentials: true });
};

app.use(cors(corsDelegate));
app.options(/.*/, cors(corsDelegate)); // very important for preflight

app.use(express.json());

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
