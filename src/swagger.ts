// src/swagger.ts
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '',
      version: '',
    },
  },
  apis: [path.join(projectRoot, 'src/swagger/**/*.yaml')], // path to the YAML files
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
