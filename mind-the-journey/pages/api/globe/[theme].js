// pages/api/globe/[theme].js - API Route per dati globi
import fs from 'fs';
import path from 'path';

// Cache per migliorare performance
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti

export default async function handler(req, res) {
  const { theme } = req.query;
  const { bounds, level = 'macroareas' } = req.query;

  try {
    // Validazione tema
    const validThemes = ['borderscapes', 'wildrealms', 'livingtraditions', 'mindscapes'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ 
        error: 'Invalid theme',
        validThemes 
      });
    }

    // Chiave cache
    const cacheKey = `${theme}-${level}-${bounds || 'all'}`;
    
    // Controlla cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return res.status(200).json(cached.data);
      }
    }

    // Carica dati base del globo
    const globeData = await loadGlobeData(theme);
    
    // Carica dati paesi/macroaree se richiesti
    if (level === 'countries') {
      const countryData = await loadCountryData();
      globeData.countries = countryData;
    }

    // Applica filtri geografici se specificati
    if (bounds) {
      globeData.points = filterByBounds(globeData.points, JSON.parse(bounds));
    }

    // Aggiungi metadata
    const responseData = {
      ...globeData,
      metadata: {
        ...globeData.metadata,
        level,
        requestTime: new Date().toISOString(),
        cacheKey
      }
    };

    // Salva in cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    res.status(200).json(responseData);

  } catch (error) {
    console.error(`Error loading globe data for ${theme}:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Carica dati globo da file JSON
async function loadGlobeData(theme) {
  const filename = `${theme.toUpperCase().substring(0,2)}-globe.json`;
  const filepath = path.join(process.cwd(), 'public', 'globe-data', filename);
  
  try {
    const fileContent = await fs.promises.readFile(filepath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to load globe data for theme ${theme}: ${error.message}`);
  }
}

// Carica dati paesi processati
async function loadCountryData() {
  const filepath = path.join(process.cwd(), 'public', 'api-data', 'countries.json');
  
  try {
    const fileContent = await fs.promises.readFile(filepath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn('Country data not available:', error.message);
    return [];
  }
}

// Filtra punti per bounds geografici
function filterByBounds(points, bounds) {
  const { north, south, east, west } = bounds;
  
  return points.filter(point => {
    return point.lat >= south && 
           point.lat <= north && 
           point.lng >= west && 
           point.lng <= east;
  });
}