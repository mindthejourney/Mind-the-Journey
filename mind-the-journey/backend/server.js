// backend/server.js
// Questo file va in: mind-the-journey/backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import configurazioni
const { initializeDatabase, runMigrations, seedDatabase, healthCheck } = require('./config/database');

// Import middleware personalizzati
const { authenticate, optionalAuth } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const themesRoutes = require('./routes/themes');
const globeRoutes = require('./routes/globe');
const pointsRoutes = require('./routes/points');
const regionsRoutes = require('./routes/regions');
const operatorsRoutes = require('./routes/operators');
const contributionsRoutes = require('./routes/contributions');
const reviewsRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (importante per Heroku, AWS, etc.)
app.set('trust proxy', 1);

// Middleware di sicurezza
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configurazione
const corsOptions = {
  origin: function (origin, callback) {
    // Permetti richieste senza origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://mind-the-journey.vercel.app',
      'https://www.mindthejourney.com'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-ID']
};

app.use(cors(corsOptions));

// Compressione
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting generale
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', generalLimiter);

// Rate limiting per autenticazione (più restrittivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  skipSuccessfulRequests: true
});

// Parsing body
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware per aggiungere timestamp e request ID
app.use((req, res, next) => {
  req.startTime = Date.now();
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await healthCheck();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: dbHealth,
    memory: process.memoryUsage(),
    requestId: req.id
  };
  
  const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/themes', optionalAuth, themesRoutes);
app.use('/api/globe', optionalAuth, globeRoutes);
app.use('/api/points', optionalAuth, pointsRoutes);
app.use('/api/regions', optionalAuth, regionsRoutes);
app.use('/api/operators', optionalAuth, operatorsRoutes);
app.use('/api/contributions', authenticate, contributionsRoutes);
app.use('/api/reviews', optionalAuth, reviewsRoutes);
app.use('/api/analytics', optionalAuth, analyticsRoutes);
app.use('/api/admin', authenticate, adminRoutes);

// Route per servire file statici (immagini caricate)
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Endpoint API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Mind the Journey API',
    version: '1.0.0',
    description: 'API for responsible tourism platform',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      themes: '/api/themes',
      globe: '/api/globe',
      points: '/api/points',
      operators: '/api/operators',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler per API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: '/api'
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.log('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

// Startup sequence
const startServer = async () => {
  try {
    console.log('🚀 Starting Mind the Journey API Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Inizializza database
    await initializeDatabase();
    
    // Esegui migrazioni se in development o se specificato
    if (process.env.RUN_MIGRATIONS === 'true' || process.env.NODE_ENV === 'development') {
      await runMigrations();
    }
    
    // Seed database se in development e vuoto
    if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
      await seedDatabase();
    }
    
    console.log('✅ Database initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

// Avvia server solo se eseguito direttamente (non quando require() viene fatto da un altro file)
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`\n🌐 Server running on http://localhost:${PORT}`);
    console.log(`📚 API documentation: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`⚡ Ready for requests!\n`);
    await startServer();
  });

  // gestione graceful shutdown già presente: mantiene i process.on('SIGTERM'..) ecc.
}

// Gestione segnali di shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestione errori non catturati
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Non fare exit in produzione, solo log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Exit sempre per uncaught exceptions
  process.exit(1);
});

module.exports = app;