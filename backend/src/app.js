const express = require('express');
const cors = require('cors');
const loggingMiddleware = require('./middleware/logging.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const notFoundMiddleware = require('./middleware/not-found.middleware');
const apiRoutes = require('./routes/index.routes');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // For development purposes. Adjust for production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Log HTTP requests
app.use(loggingMiddleware);

// Mount main API router
app.use('/api', apiRoutes);

// Wildcard route for 404 handler
app.use(notFoundMiddleware);

// Mount global error handler
app.use(errorMiddleware);

module.exports = app;
