// backend/middleware/auth.js
// Questo file va in: mind-the-journey/backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { promisify } = require('util');

// Database connection (dovrebbe essere importata da config/database.js)
const db = require('../config/database');

/**
 * Middleware principale per autenticazione JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Estrai token dall'header Authorization
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No authentication token provided',
        code: 'AUTH_TOKEN_MISSING'
      });
    }
    
    // Verifica e decodifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifica che l'utente esista ancora nel database
    const [users] = await db.execute(
      `SELECT 
        id, username, email, first_name, last_name, role, 
        is_verified, avatar_url, last_login, created_at
       FROM users 
       WHERE id = ? AND is_verified = true`,
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'User not found or not verified',
        code: 'AUTH_USER_NOT_FOUND'
      });
    }
    
    const user = users[0];
    
    // Controlla se l'utente è stato bannato o disattivato
    if (user.status === 'banned' || user.status === 'inactive') {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'Account suspended or inactive',
        code: 'AUTH_ACCOUNT_SUSPENDED'
      });
    }
    
    // Aggiorna ultimo accesso (in background, non bloccare la richiesta)
    db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    ).catch(err => console.error('Error updating last login:', err));
    
    // Aggiungi l'utente alla richiesta
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.is_verified,
      avatarUrl: user.avatar_url,
      fullName: `${user.first_name} ${user.last_name}`.trim()
    };
    
    // Log dell'accesso per analytics
    req.userAccess = {
      userId: user.id,
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Invalid authentication token',
        code: 'AUTH_TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Authentication token has expired',
        code: 'AUTH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication service temporarily unavailable',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Middleware per richiedere ruoli specifici
 * @param {string|string[]} roles - Ruolo/i richiesti
 */
const requireRole = (roles) => {
  // Normalizza l'input in array
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // Verifica che l'utente sia autenticato
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Verifica che l'utente abbia uno dei ruoli richiesti
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Access requires one of the following roles: ${requiredRoles.join(', ')}`,
        code: 'AUTH_INSUFFICIENT_ROLE',
        required: requiredRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware per operatori turistici verificati
 */
const requireOperator = async (req, res, next) => {
  try {
    // Verifica autenticazione
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Cerca l'operatore associato all'utente
    const [operators] = await db.execute(
      `SELECT 
        op.id, op.company_name, op.business_type, op.subscription_tier,
        op.is_verified, op.subscription_expires, op.created_at
       FROM tourism_operators op 
       WHERE op.user_id = ? AND op.is_verified = true`,
      [req.user.id]
    );
    
    if (operators.length === 0) {
      return res.status(403).json({ 
        error: 'Operator status required',
        message: 'Access requires verified tourism operator account',
        code: 'AUTH_OPERATOR_REQUIRED'
      });
    }
    
    const operator = operators[0];
    
    // Verifica se la subscription è scaduta
    if (operator.subscription_expires && operator.subscription_expires < new Date()) {
      return res.status(402).json({
        error: 'Subscription expired',
        message: 'Please renew your operator subscription',
        code: 'AUTH_SUBSCRIPTION_EXPIRED',
        expiredAt: operator.subscription_expires
      });
    }
    
    // Aggiungi info operatore alla richiesta
    req.operator = {
      id: operator.id,
      companyName: operator.company_name,
      businessType: operator.business_type,
      subscriptionTier: operator.subscription_tier,
      subscriptionExpires: operator.subscription_expires,
      isPremium: operator.subscription_tier === 'premium'
    };
    
    next();
    
  } catch (error) {
    console.error('Operator verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'AUTH_OPERATOR_ERROR'
    });
  }
};

/**
 * Middleware per verificare ownership di una risorsa
 */
const requireOwnership = (resourceQuery) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }
      
      // Admin e moderatori possono accedere a tutto
      if (['admin', 'moderator'].includes(req.user.role)) {
        return next();
      }
      
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required',
          code: 'RESOURCE_ID_MISSING'
        });
      }
      
      // Esegui query per verificare ownership
      const [resources] = await db.execute(resourceQuery, [resourceId]);
      
      if (resources.length === 0) {
        return res.status(404).json({
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      const resource = resources[0];
      
      // Verifica che l'utente sia il proprietario
      if (resource.created_by !== req.user.id && resource.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You can only access your own resources',
          code: 'AUTH_OWNERSHIP_REQUIRED'
        });
      }
      
      // Aggiungi risorsa alla richiesta
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({
        error: 'Internal server error', 
        code: 'AUTH_OWNERSHIP_ERROR'
      });
    }
  };
};

/**
 * Middleware opzionale per autenticazione
 * Non blocca se non c'è token, ma aggiunge l'utente se presente
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return next(); // Nessun token, continua senza utente
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.execute(
      'SELECT id, username, email, role, is_verified FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length > 0) {
      req.user = {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role,
        isVerified: users[0].is_verified
      };
    }
    
    next();
    
  } catch (error) {
    // In caso di errore, continua senza utente
    console.warn('Optional auth error:', error.message);
    next();
  }
};

/**
 * Middleware per rate limiting basato sull'utente
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Pulisci richieste vecchie
    const userRequests = requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Aggiungi questa richiesta
    validRequests.push(now);
    requests.set(key, validRequests);
    
    // Headers informativi
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - validRequests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requireOperator,
  requireOwnership,
  optionalAuth,
  userRateLimit,
  
  // Alias comuni
  auth: authenticate,
  adminOnly: requireRole('admin'),
  moderatorOrAdmin: requireRole(['moderator', 'admin']),
  contributorOrAbove: requireRole(['contributor', 'moderator', 'admin'])
};