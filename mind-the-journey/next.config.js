// next.config.js - Configurazione Next.js ottimizzata
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ottimizzazioni per le immagini
  images: {
    domains: ['unpkg.com', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configurazione per il globo 3D (importazioni client-side)
  transpilePackages: ['globe.gl', 'three'],
  
  // Variabili ambiente pubbliche
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  
  // Configurazione webpack per librerie 3D
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configurazione per globe.gl e three.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Headers di sicurezza
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirect per SEO
  async redirects() {
    return [
      {
        source: '/themes',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configurazione PWA (se necessario)
  experimental: {
    appDir: false, // Per ora usa Pages Router
    serverComponentsExternalPackages: ['mysql2'],
  },
};

module.exports = nextConfig;

// tailwind.config.js - Configurazione Tailwind estesa
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Colori dei temi
        borderscapes: '#D9CAB3',
        wildrealms: '#76A989',
        livingtraditions: '#C29B7F',
        mindscapes: '#AC97BC',
        
        // Palette estesa
        cream: '#FAFAF7',
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a3b2a3',
          400: '#76A989',
          500: '#5a8a6a',
          600: '#477055',
          700: '#3a5b46',
          800: '#30483a',
          900: '#283b30',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'globe-rotate': 'globeRotate 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(0)' },
        },
        globeRotate: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

// .env.example - Template per variabili ambiente
# Database
DB_HOST=localhost
DB_USER=mindthejourney_user
DB_PASSWORD=secure_password
DB_NAME=mindthejourney_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Redis (opzionale, per caching)
REDIS_URL=redis://localhost:6379

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api
API_PORT=5000

# Mapbox (per le mappe 2D)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token

# Email (per notifiche)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage (AWS S3 o simili)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=mindthejourney-media

# Payment (Stripe)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Social Auth (opzionale)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# docker-compose.yml - Setup sviluppo con Docker
version: '3.8'

services:
  # Database MySQL
  mysql:
    image: mysql:8.0
    container_name: mtj_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: mindthejourney_db
      MYSQL_USER: mindthejourney_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - mtj_network

  # Redis per caching
  redis:
    image: redis:7-alpine
    container_name: mtj_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - mtj_network

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mtj_api
    restart: unless-stopped
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_USER=mindthejourney_user
      - DB_PASSWORD=secure_password
      - DB_NAME=mindthejourney_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_super_secret_jwt_key_here
    ports:
      - "5000:5000"
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - mtj_network

  # Frontend Next.js
  frontend:
    build:
      context: ./
      dockerfile: Dockerfile
    container_name: mtj_frontend
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./:/app
      - /app/node_modules
      - /app/.next
    networks:
      - mtj_network

volumes:
  mysql_data:
  redis_data:

networks:
  mtj_network:
    driver: bridge

# package.json - Aggiornato con tutte le dipendenze
{
  "name": "mind-the-journey",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@next/font": "^14.0.0",
    
    "globe.gl": "^2.27.0",
    "three": "^0.158.0",
    "react-globe.gl": "^2.24.0",
    
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "mapbox-gl": "^2.15.0",
    "react-map-gl": "^7.1.6",
    
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "@tailwindcss/typography": "^0.5.0",
    "@tailwindcss/aspect-ratio": "^0.4.0",
    
    "axios": "^1.6.0",
    "swr": "^2.2.0",
    "react-query": "^3.39.0",
    
    "framer-motion": "^10.16.0",
    "react-intersection-observer": "^9.5.0",
    
    "react-hook-form": "^7.47.0",
    "yup": "^1.3.0",
    "@hookform/resolvers": "^3.3.0",
    
    "js-cookie": "^3.0.5",
    "uuid": "^9.0.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    
    "react-hot-toast": "^2.4.0",
    "react-modal": "^3.16.0",
    "react-select": "^5.8.0",
    
    "sharp": "^0.32.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/leaflet": "^1.9.0",
    "@types/js-cookie": "^3.0.0",
    "@types/lodash": "^4.14.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0",
    "eslint-config-prettier": "^9.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}

# Backend package.json separato
# backend/package.json
{
  "name": "mind-the-journey-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "compression": "^1.7.4",
    
    "mysql2": "^3.6.0",
    "redis": "^4.6.0",
    
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "passport-google-oauth20": "^2.0.0",
    
    "multer": "^1.4.5",
    "sharp": "^0.32.0",
    "aws-sdk": "^2.1400.0",
    
    "nodemailer": "^6.9.0",
    "stripe": "^12.0.0",
    
    "joi": "^17.9.0",
    "express-validator": "^7.0.0",
    "validator": "^13.11.0",
    
    "winston": "^3.10.0",
    "morgan": "^1.10.0",
    
    "dotenv": "^16.3.0",
    "cron": "^2.4.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}

# Dockerfile - Per il frontend Next.js
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

# backend/Dockerfile - Per l'API
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "server.js"]

# scripts/migrate.js - Script per migrazioni database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('Running database migrations...');
    
    // Leggi e esegui il file SQL di schema
    const fs = require('fs').promises;
    const schemaSQL = await fs.readFile('./database/schema.sql', 'utf8');
    
    await connection.execute(schemaSQL);
    console.log('✅ Database schema created successfully');
    
    // Esegui migrazioni aggiuntive se esistono
    const migrationsDir = './database/migrations';
    try {
      const migrationFiles = await fs.readdir(migrationsDir);
      const sqlFiles = migrationFiles
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of sqlFiles) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = await fs.readFile(`${migrationsDir}/${file}`, 'utf8');
        await connection.execute(migrationSQL);
        console.log(`✅ Migration ${file} completed`);
      }
    } catch (error) {
      console.log('No additional migrations found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };

# scripts/seed.js - Script per popolamento dati iniziali
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Seeding database with initial data...');
    
    // Inserisci paesi principali
    await connection.execute(`
      INSERT IGNORE INTO countries (id, name, continent, capital, lat, lng) VALUES
      ('ITA', 'Italia', 'Europe', 'Roma', 41.9028, 12.4964),
      ('FRA', 'Francia', 'Europe', 'Parigi', 48.8566, 2.3522),
      ('ESP', 'Spagna', 'Europe', 'Madrid', 40.4168, -3.7038),
      ('DEU', 'Germania', 'Europe', 'Berlino', 52.5200, 13.4050),
      ('GRC', 'Grecia', 'Europe', 'Atene', 37.9755, 23.7348)
    `);
    
    // Inserisci regioni italiane
    await connection.execute(`
      INSERT IGNORE INTO regions (country_id, name, type, lat, lng) VALUES
      ('ITA', 'Lombardia', 'region', 45.4773, 9.1815),
      ('ITA', 'Lazio', 'region', 41.8955, 12.4823),
      ('ITA', 'Toscana', 'region', 43.7711, 11.2486),
      ('ITA', 'Veneto', 'region', 45.4299, 12.3152),
      ('ITA', 'Sicilia', 'region', 37.5999, 14.0153),
      ('ITA', 'Campania', 'region', 40.8358, 14.2488)
    `);
    
    // Inserisci alcuni punti di interesse di esempio
    const lombardiaId = await connection.execute(
      'SELECT id FROM regions WHERE name = "Lombardia"'
    );
    const lombardia = lombardiaId[0][0];
    
    if (lombardia) {
      await connection.execute(`
        INSERT IGNORE INTO points_of_interest 
        (theme_id, country_id, region_id, name, description, lat, lng, type, status) VALUES
        ('borderscapes', 'ITA', ?, 'Milano', 'Capitale economica del Nord Italia', 45.4642, 9.1900, 'city', 'published'),
        ('borderscapes', 'ITA', ?, 'Como', 'Città sul lago di Como', 45.8081, 9.0852, 'city', 'published'),
        ('wildrealms', 'ITA', ?, 'Parco Nazionale dello Stelvio (Lombardia)', 'Area protetta nelle Alpi', 46.5311, 10.4547, 'national_park', 'published'),
        ('livingtraditions', 'ITA', ?, 'Bergamo Alta', 'Città alta medievale', 45.7044, 9.6692, 'historic_site', 'published'),
        ('mindscapes', 'ITA', ?, 'Isola di Loreto', 'Piccola isola sul Lago di Iseo', 45.7097, 10.0478, 'island', 'published')
      `, [lombardia.id, lombardia.id, lombardia.id, lombardia.id, lombardia.id]);
    }
    
    console.log('✅ Database seeded successfully');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };