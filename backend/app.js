require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ==================== CORS Configuration ====================

// Default origins for local + optional env override
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

// Log to confirm what's loaded
console.log("✅ Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Allow localhost automatically (any port)
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }

      // Allow chrome extensions
      if (origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      // Check whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`❌ Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== Routes ====================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const prisma = require('./src/utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message
    });
  }
});

const progressRoutes = require('./src/routes/progressRoutes');
console.log('Mounting progress routes on /progress');
app.use('/progress', progressRoutes);

const apiKeyRoutes = require('./src/routes/apiKeyRoutes');
app.use('/api', apiKeyRoutes);

const appliedJobRoutes = require('./src/routes/appliedJobRoutes');
app.use('/api', appliedJobRoutes);

// Test endpoint without any middleware
app.get('/test-progress', (req, res) => {
  res.json({ message: 'Progress test endpoint works', user: req.headers['x-user-id'] });
});

// ==================== Error Handling ====================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'This origin is not allowed to access this resource',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
