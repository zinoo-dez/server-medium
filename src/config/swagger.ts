import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medium Clone API',
      version,
      description: 'API documentation for the Medium Clone project',
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.ts', './src/app.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
