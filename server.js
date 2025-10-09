const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const FileOrganizer = require('./features/fileOrganizer');

const app = express();
const PORT = process.env.PORT || 3000;
const fileOrganizer = new FileOrganizer();

// Middleware
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DSXtractAI Preprocessing API',
      version: '1.0.0',
      description: 'Simple API wireframe for preprocessing tasks',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Hello World endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Hello World response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 uptime:
 *                   type: number
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /organize-files:
 *   post:
 *     summary: Organize pinmap files by their source PDF
 *     description: Scans stageFiles directory, groups pinmaps by PDF, and moves them to finished directory
 *     tags: [File Organization]
 *     responses:
 *       200:
 *         description: Files organized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalPinmaps:
 *                   type: number
 *                   example: 10
 *                 pdfGroups:
 *                   type: number
 *                   example: 3
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pdfName:
 *                         type: string
 *                       folderName:
 *                         type: string
 *                       pinmapsProcessed:
 *                         type: number
 *                       totalPinmaps:
 *                         type: number
 *       500:
 *         description: Error organizing files
 */
app.post('/organize-files', async (req, res) => {
  try {
    const result = await fileOrganizer.organizeFilesByPdf();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
