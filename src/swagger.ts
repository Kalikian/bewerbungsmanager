import swaggerJsdoc from 'swagger-jsdoc';

//Generate the OpenAPI specification object from YAML documentation files
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bewerbungsmanager API',
      version: '1.0.0',
      description: 'API documentation for the Bewerbungsmanager application',
    },
  },
  //Specify the paths to the YAML files with OpenAPI documentation
  apis: ['./src/swagger/*.yaml'],
});

console.log(swaggerSpec); // Log the generated OpenAPI specification for debugging purposes

export default swaggerSpec;
