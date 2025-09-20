// pages/api/countries.js - API per paesi e macroaree
import fs from 'fs';
import path from 'path';

// Mapping macroaree (dal tuo CSV)
const MACROAREA_NAMES = {
  1: "North America",
  2: "Central America", 
  3: "Northern South America",
  4: "Caribbean",
  5: "Lesser Antilles", 
  6: "Andean South America",
  7: "Brazil & Guianas",
  8: "Southern Cone",
  9: "South Atlantic Islands",
  10: "Western Europe",
  11: "Southern Europe",
  12: "Italian Peninsula", 
  13: "Alpine Europe",
  14: "Central Europe",
  15: "British Isles",
  16: "Northern Europe",
  17: "Baltic States",
  18: "Eastern Europe",
  19: "Balkans",
  20: "North Atlantic Islands",
  21: "North Africa",
  22: "Sahel",
  23: "West Africa", 
  24: "Horn of Africa",
  25: "East Africa",
  26: "Central Africa",
  27: "Southern Africa",
  28: "Western Indian Ocean",
  29: "Arabian Peninsula",
  30: "Levant",
  31: "Anatolia & Caucasus",
  32: "South Caucasus",
  33: "Central Asia",
  34: "South Asia",
  35: "Southeast Asia",
  36: "Maritime Southeast Asia",
  37: "East Asia",
  38: "Tibetan Plateau",
  39: "Australia & New Zealand",
  40: "Melanesia",
  41: "Micronesia",
  42: "Polynesia",
  43: "Antarctica & Subantarctic"
};

export default async function handler(req, res) {
  const { level = 'countries', search, macroarea, limit = 50 } = req.query;

  try {
    if (level === 'macroareas') {
      return handleMacroareas(req, res);
    } else if (level === 'countries') {
      return handleCountries(req, res);
    } else {
      return res.status(400).json({
        error: 'Invalid level parameter',
        validLevels: ['countries', 'macroareas']
      });
    }

  } catch (error) {
    console.error('Error in countries API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Gestisce richieste per macroaree
async function handleMacroareas(req, res) {
  const { search } = req.query;

  // Carica dati paesi per aggregare per macroarea
  const countries = await loadCountryData();
  
  // Aggrega per macroarea
  const macroareaData = {};
  
  countries.forEach(country => {
    const macroId = country.macroarea_id;
    const macroName = MACROAREA_NAMES[macroId] || `Macroarea ${macroId}`;
    
    if (!macroareaData[macroId]) {
      macroareaData[macroId] = {
        id: macroId,
        name: macroName,
        countries: [],
        countryCount: 0,
        continentId: country.continent_id
      };
    }
    
    macroareaData[macroId].countries.push(country.country_code);
    macroareaData[macroId].countryCount++;
  });

  let macroareas = Object.values(macroareaData);

  // Applica ricerca se specificata
  if (search) {
    const searchLower = search.toLowerCase();
    macroareas = macroareas.filter(macro => 
      macro.name.toLowerCase().includes(searchLower)
    );
  }

  // Ordina per nome
  macroareas.sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({
    level: 'macroareas',
    total: macroareas.length,
    data: macroareas,
    searchTerm: search || null
  });
}

// Gestisce richieste per paesi
async function handleCountries(req, res) {
  const { search, macroarea, limit } = req.query;

  let countries = await loadCountryData();

  // Filtra per macroarea se specificata
  if (macroarea) {
    const macroId = parseInt(macroarea);
    countries = countries.filter(country => 
      country.macroarea_id === macroId
    );
  }

  // Applica ricerca se specificata
  if (search) {
    const searchLower = search.toLowerCase();
    countries = countries.filter(country => 
      country.country_description.toLowerCase().includes(searchLower) ||
      country.country_code.toLowerCase().includes(searchLower)
    );
  }

  // Applica limit
  const limitNum = parseInt(limit);
  if (limitNum > 0) {
    countries = countries.slice(0, limitNum);
  }

  // Arricchisci con nomi macroaree
  const enrichedCountries = countries.map(country => ({
    ...country,
    macroarea_name: MACROAREA_NAMES[country.macroarea_id] || `Macroarea ${country.macroarea_id}`
  }));

  res.status(200).json({
    level: 'countries',
    total: enrichedCountries.length,
    data: enrichedCountries,
    filters: {
      search: search || null,
      macroarea: macroarea ? parseInt(macroarea) : null
    }
  });
}

// Carica dati paesi processati
async function loadCountryData() {
  const filepath = path.join(process.cwd(), 'public', 'api-data', 'countries.json');
  
  try {
    const fileContent = await fs.promises.readFile(filepath, 'utf8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    // Se il file JSON non esiste, prova a caricare dal CSV
    return await loadCountryDataFromCSV();
  }
}

// Carica e processa dati dal CSV original
async function loadCountryDataFromCSV() {
  const Papa = require('papaparse');
  const filepath = path.join(process.cwd(), 'public', 'data', 'countries.csv');
  
  try {
    const csvContent = await fs.promises.readFile(filepath, 'utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Converti numeri
          if (field === 'macroarea_id' || field === 'continent_id') {
            return parseInt(value);
          }
          return value.trim();
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error)
      });
    });

  } catch (error) {
    throw new Error(`Failed to load CSV data: ${error.message}`);
  }
}