// scripts/process-csv.js - Processa il CSV in JSON per le API
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

// Mapping macroaree con informazioni geografiche
const MACROAREA_DATA = {
  1: { name: "North America", continent: "North America", centerLat: 45.0, centerLng: -100.0 },
  2: { name: "Central America", continent: "North America", centerLat: 15.0, centerLng: -90.0 },
  3: { name: "Northern South America", continent: "South America", centerLat: 5.0, centerLng: -60.0 },
  4: { name: "Caribbean", continent: "North America", centerLat: 20.0, centerLng: -75.0 },
  5: { name: "Lesser Antilles", continent: "North America", centerLat: 15.0, centerLng: -62.0 },
  6: { name: "Andean South America", continent: "South America", centerLat: -15.0, centerLng: -70.0 },
  7: { name: "Brazil & Guianas", continent: "South America", centerLat: -10.0, centerLng: -55.0 },
  8: { name: "Southern Cone", continent: "South America", centerLat: -35.0, centerLng: -65.0 },
  9: { name: "South Atlantic Islands", continent: "South America", centerLat: -30.0, centerLng: -10.0 },
  10: { name: "Western Europe", continent: "Europe", centerLat: 50.0, centerLng: 5.0 },
  11: { name: "Southern Europe", continent: "Europe", centerLat: 40.0, centerLng: 0.0 },
  12: { name: "Italian Peninsula", continent: "Europe", centerLat: 42.0, centerLng: 13.0 },
  13: { name: "Alpine Europe", continent: "Europe", centerLat: 46.5, centerLng: 8.0 },
  14: { name: "Central Europe", continent: "Europe", centerLat: 50.0, centerLng: 15.0 },
  15: { name: "British Isles", continent: "Europe", centerLat: 54.0, centerLng: -4.0 },
  16: { name: "Northern Europe", continent: "Europe", centerLat: 62.0, centerLng: 15.0 },
  17: { name: "Baltic States", continent: "Europe", centerLat: 57.0, centerLng: 25.0 },
  18: { name: "Eastern Europe", continent: "Europe", centerLat: 52.0, centerLng: 35.0 },
  19: { name: "Balkans", continent: "Europe", centerLat: 43.0, centerLng: 20.0 },
  20: { name: "North Atlantic Islands", continent: "Europe", centerLat: 65.0, centerLng: -18.0 },
  21: { name: "North Africa", continent: "Africa", centerLat: 25.0, centerLng: 0.0 },
  22: { name: "Sahel", continent: "Africa", centerLat: 15.0, centerLng: 0.0 },
  23: { name: "West Africa", continent: "Africa", centerLat: 10.0, centerLng: -10.0 },
  24: { name: "Horn of Africa", continent: "Africa", centerLat: 10.0, centerLng: 45.0 },
  25: { name: "East Africa", continent: "Africa", centerLat: -5.0, centerLng: 35.0 },
  26: { name: "Central Africa", continent: "Africa", centerLat: 0.0, centerLng: 20.0 },
  27: { name: "Southern Africa", continent: "Africa", centerLat: -25.0, centerLng: 25.0 },
  28: { name: "Western Indian Ocean", continent: "Africa", centerLat: -15.0, centerLng: 55.0 },
  29: { name: "Arabian Peninsula", continent: "Asia", centerLat: 22.0, centerLng: 45.0 },
  30: { name: "Levant", continent: "Asia", centerLat: 33.0, centerLng: 36.0 },
  31: { name: "Anatolia & Caucasus", continent: "Asia", centerLat: 40.0, centerLng: 40.0 },
  32: { name: "South Caucasus", continent: "Asia", centerLat: 42.0, centerLng: 45.0 },
  33: { name: "Central Asia", continent: "Asia", centerLat: 45.0, centerLng: 65.0 },
  34: { name: "South Asia", continent: "Asia", centerLat: 20.0, centerLng: 80.0 },
  35: { name: "Southeast Asia", continent: "Asia", centerLat: 10.0, centerLng: 110.0 },
  36: { name: "Maritime Southeast Asia", continent: "Asia", centerLat: 0.0, centerLng: 120.0 },
  37: { name: "East Asia", continent: "Asia", centerLat: 35.0, centerLng: 110.0 },
  38: { name: "Tibetan Plateau", continent: "Asia", centerLat: 32.0, centerLng: 85.0 },
  39: { name: "Australia & New Zealand", continent: "Oceania", centerLat: -25.0, centerLng: 135.0 },
  40: { name: "Melanesia", continent: "Oceania", centerLat: -8.0, centerLng: 155.0 },
  41: { name: "Micronesia", continent: "Oceania", centerLat: 7.0, centerLng: 150.0 },
  42: { name: "Polynesia", continent: "Oceania", centerLat: -15.0, centerLng: -150.0 },
  43: { name: "Antarctica & Subantarctic", continent: "Antarctica", centerLat: -80.0, centerLng: 0.0 }
};

async function processCsvData() {
  console.log('🔄 Starting CSV processing...');

  try {
    // 1. Leggi il CSV originale
    const csvPath = path.join(__dirname, '..', 'public', 'data', 'countries.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    
    console.log('✅ CSV file loaded');

    // 2. Processa con Papa Parse
    const parsedData = await new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Converti numeri e pulisci stringhe
          if (field === 'macroarea_id' || field === 'continent_id') {
            return parseInt(value);
          }
          return value.trim();
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('⚠️ CSV parsing warnings:', results.errors.slice(0, 5));
          }
          resolve(results.data);
        },
        error: (error) => reject(error)
      });
    });

    console.log(`✅ Parsed ${parsedData.length} countries`);

    // 3. Arricchisci i dati paesi
    const enrichedCountries = parsedData.map(country => ({
      ...country,
      macroarea_name: MACROAREA_DATA[country.macroarea_id]?.name || `Macroarea ${country.macroarea_id}`,
      continent_name: MACROAREA_DATA[country.macroarea_id]?.continent || 'Unknown',
      // Aggiungi coordinate centro (approssimate, da migliorare con dati reali)
      centerLat: MACROAREA_DATA[country.macroarea_id]?.centerLat || 0,
      centerLng: MACROAREA_DATA[country.macroarea_id]?.centerLng || 0
    }));

    // 4. Crea struttura macroaree
    const macroareas = {};
    enrichedCountries.forEach(country => {
      const macroId = country.macroarea_id;
      if (!macroareas[macroId]) {
        const macroData = MACROAREA_DATA[macroId];
        macroareas[macroId] = {
          id: macroId,
          name: macroData?.name || `Macroarea ${macroId}`,
          continent: macroData?.continent || 'Unknown',
          centerLat: macroData?.centerLat || 0,
          centerLng: macroData?.centerLng || 0,
          countries: [],
          countryCount: 0
        };
      }
      macroareas[macroId].countries.push(country.country_code);
      macroareas[macroId].countryCount++;
    });

    // 5. Assicurati che la cartella api-data esista
    const apiDataDir = path.join(__dirname, '..', 'public', 'api-data');
    try {
      await fs.access(apiDataDir);
    } catch {
      await fs.mkdir(apiDataDir, { recursive: true });
      console.log('✅ Created api-data directory');
    }

    // 6. Salva countries.json
    const countriesPath = path.join(apiDataDir, 'countries.json');
    await fs.writeFile(
      countriesPath, 
      JSON.stringify(enrichedCountries, null, 2), 
      'utf8'
    );
    console.log(`✅ Saved ${enrichedCountries.length} countries to countries.json`);

    // 7. Salva macroareas.json
    const macroareasArray = Object.values(macroareas).sort((a, b) => a.name.localeCompare(b.name));
    const macroareasPath = path.join(apiDataDir, 'macroareas.json');
    await fs.writeFile(
      macroareasPath,
      JSON.stringify(macroareasArray, null, 2),
      'utf8'
    );
    console.log(`✅ Saved ${macroareasArray.length} macroareas to macroareas.json`);

    // 8. Crea file di statistiche
    const stats = {
      totalCountries: enrichedCountries.length,
      totalMacroareas: macroareasArray.length,
      continents: [...new Set(macroareasArray.map(m => m.continent))].sort(),
      processedAt: new Date().toISOString(),
      sampleCountries: enrichedCountries.slice(0, 5).map(c => ({
        code: c.country_code,
        name: c.country_description,
        macroarea: c.macroarea_name
      }))
    };

    const statsPath = path.join(apiDataDir, 'stats.json');
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), 'utf8');
    console.log('✅ Saved processing statistics');

    // 9. Report finale
    console.log('\n🎉 CSV Processing Complete!');
    console.log(`📊 Statistics:`);
    console.log(`   • Countries: ${stats.totalCountries}`);
    console.log(`   • Macroareas: ${stats.totalMacroareas}`);
    console.log(`   • Continents: ${stats.continents.length}`);
    console.log(`   • Files created: countries.json, macroareas.json, stats.json`);
    console.log(`   • Location: public/api-data/`);

  } catch (error) {
    console.error('❌ Error processing CSV:', error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  processCsvData();
}

module.exports = { processCsvData, MACROAREA_DATA };