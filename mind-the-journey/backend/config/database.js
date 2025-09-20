// backend/config/database.js
// Questo file va in: mind-the-journey/backend/config/database.js

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Configurazione database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'mindthejourney_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_NAME || 'mindthejourney_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00', // UTC
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: process.env.NODE_ENV === 'development' ? ['ComQueryPacket'] : false,
  multipleStatements: true // Per eseguire migrazioni
};

// Configurazioni aggiuntive per sicurezza
const securityConfig = {
  ssl: process.env.DB_SSL === 'true' ? {
    ca: process.env.DB_SSL_CA,
    key: process.env.DB_SSL_KEY,
    cert: process.env.DB_SSL_CERT,
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  } : false
};

// Pool di connessioni principale
let pool = null;

/**
 * Inizializza il pool di connessioni database
 */
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database connection...');
    
    pool = mysql.createPool({
      ...dbConfig,
      ...securityConfig
    });
    
    // Test connessione
    const connection = await pool.getConnection();
    console.log('✅ Database connection established successfully');
    
    // Verifica versione MySQL
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL version: ${rows[0].version}`);
    
    // Rilascia connessione di test
    connection.release();
    
    // Configura listener per eventi del pool
    pool.on('connection', (connection) => {
      console.log('🔗 New database connection established as id ' + connection.threadId);
    });
    
    pool.on('error', (err) => {
      console.error('❌ Database pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Attempting to reconnect to database...');
        initializeDatabase();
      }
    });
    
    return pool;
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    
    // Retry logic
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying database connection in 5 seconds...');
      setTimeout(initializeDatabase, 5000);
    } else {
      process.exit(1);
    }
  }
};

/**
 * Esegue migrazioni database
 */
const runMigrations = async () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  
  try {
    console.log('🔄 Running database migrations...');
    
    // Crea tabella per tracking migrazioni
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        batch INT NOT NULL DEFAULT 1
      )
    `);
    
    // Leggi file di migrazione
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    try {
      const files = await fs.readdir(migrationsDir);
      const sqlFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      if (sqlFiles.length === 0) {
        console.log('📝 No migration files found');
        return;
      }
      
      // Controlla quali migrazioni sono già state eseguite
      const [executedMigrations] = await pool.execute(
        'SELECT filename FROM migrations ORDER BY id'
      );
      const executedSet = new Set(executedMigrations.map(m => m.filename));
      
      let executedCount = 0;
      
      for (const file of sqlFiles) {
        if (!executedSet.has(file)) {
          console.log(`🔄 Running migration: ${file}`);
          
          const filePath = path.join(migrationsDir, file);
          const sql = await fs.readFile(filePath, 'utf8');
          
          // Esegui migrazione in transazione
          const connection = await pool.getConnection();
          
          try {
            await connection.beginTransaction();
            await connection.query(sql);
            await connection.execute(
              'INSERT INTO migrations (filename) VALUES (?)',
              [file]
            );
            await connection.commit();
            
            console.log(`✅ Migration completed: ${file}`);
            executedCount++;
            
          } catch (error) {
            await connection.rollback();
            console.error(`❌ Migration failed: ${file}`, error);
            throw error;
          } finally {
            connection.release();
          }
        }
      }
      
      if (executedCount > 0) {
        console.log(`✅ ${executedCount} migrations executed successfully`);
      } else {
        console.log('📝 All migrations already executed');
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 Migrations directory not found, skipping migrations');
        return;
      }
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

/**
 * Popola il database con dati iniziali (seed)
 */
const seedDatabase = async () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  
  try {
    console.log('🌱 Seeding database...');
    
    // Verifica se esistono già dati
    const [themeCount] = await pool.execute('SELECT COUNT(*) as count FROM themes');
    if (themeCount[0].count > 0) {
      console.log('📝 Database already seeded, skipping');
      return;
    }
    
    const seedsDir = path.join(__dirname, '../database/seeds');
    
    try {
      const files = await fs.readdir(seedsDir);
      const sqlFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of sqlFiles) {
        console.log(`🌱 Executing seed: ${file}`);
        
        const filePath = path.join(seedsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        await pool.query(sql);
        console.log(`✅ Seed completed: ${file}`);
      }
      
      console.log('✅ Database seeded successfully');
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📁 Seeds directory not found, skipping seeding');
        return;
      }
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

/**
 * Chiude tutte le connessioni database
 */
const closeDatabase = async () => {
  if (pool) {
    console.log('🔄 Closing database connections...');
    await pool.end();
    console.log('✅ Database connections closed');
  }
};

/**
 * Esegue query con retry automatico
 */
const executeWithRetry = async (query, params = [], maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await pool.execute(query, params);
    } catch (error) {
      lastError = error;
      console.warn(`Database query attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries && (
        error.code === 'ECONNRESET' || 
        error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ENOTFOUND'
      )) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

/**
 * Esegue transazioni con gestione automatica degli errori
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    return result;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Utilities per query comuni
 */
const utils = {
  /**
   * Paginazione automatica
   */
  paginate: (page = 1, limit = 20) => {
    const offset = Math.max(0, (page - 1) * limit);
    return { limit: Math.min(limit, 100), offset }; // Max 100 per pagina
  },
  
  /**
   * Costruisce clausole WHERE dinamiche
   */
  buildWhere: (filters = {}) => {
    const conditions = [];
    const params = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
          params.push(...value);
        } else if (typeof value === 'string' && value.includes('%')) {
          conditions.push(`${key} LIKE ?`);
          params.push(value);
        } else {
          conditions.push(`${key} = ?`);
          params.push(value);
        }
      }
    });
    
    return {
      clause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
      params
    };
  },
  
  /**
   * Escape per ricerca full-text
   */
  escapeFullText: (text) => {
    return text.replace(/[+\-><()~*\"@]/g, '\\          try {
            await connection');
  }
};

/**
 * Health check database
 */
const healthCheck = async () => {
  try {
    const start = Date.now();
    const [result] = await pool.execute('SELECT 1 as health');
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      connections: {
        active: pool.pool._allConnections.length,
        idle: pool.pool._freeConnections.length,
        total: pool.pool.config.connectionLimit
      }
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
};

// Gestione graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing database connections...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing database connections...');
  await closeDatabase();
  process.exit(0);
});

// Esporta pool e utilities
module.exports = {
  // Funzioni principali
  initializeDatabase,
  runMigrations,
  seedDatabase,
  closeDatabase,
  healthCheck,
  
  // Utilities per query
  executeWithRetry,
  transaction,
  utils,
  
  // Getter per il pool (lazy loading)
  get pool() {
    if (!pool) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return pool;
  },
  
  // Metodi convenienti
  execute: (...args) => {
    if (!pool) {
      throw new Error('Database not initialized');
    }
    return pool.execute(...args);
  },
  
  query: (...args) => {
    if (!pool) {
      throw new Error('Database not initialized');
    }
    return pool.query(...args);
  }
};