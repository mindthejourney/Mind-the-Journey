// pages/api/macroareas.js - API endpoint for macroarea data
import { getMacroareasData } from '../../lib/database';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const macroareas = await getMacroareasData();
    
    // Optional filtering by continent
    const { continent_id } = req.query;
    let filteredMacroareas = macroareas;
    
    if (continent_id) {
      const continentFilter = parseInt(continent_id);
      filteredMacroareas = macroareas.filter(m => m.continent_id === continentFilter);
    }

    // Add metadata
    const response = {
      macroareas: filteredMacroareas,
      metadata: {
        total_count: filteredMacroareas.length,
        continents_represented: [...new Set(filteredMacroareas.map(m => m.continent_id))],
        total_countries: filteredMacroareas.reduce((sum, m) => sum + m.country_count, 0),
        last_updated: new Date().toISOString()
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('API Error - Macroareas:', error);
    
    res.status(500).json({
      error: 'Failed to load macroareas',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}