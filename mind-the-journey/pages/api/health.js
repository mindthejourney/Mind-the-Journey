// pages/api/health.js - Health check endpoint for API status

export default function handler(req, res) {
  try {
    // Basic health check information
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      services: {
        database: 'file-system', // We're using file-based data
        cache: 'memory',
        globe_data: true,
        multilingual: true
      }
    };

    // Check if critical directories exist
    const fs = require('fs');
    const path = require('path');
    
    const criticalPaths = [
      'public/globe-data',
      'public/icons',
      'lib'
    ];

    let allPathsExist = true;
    const pathStatus = {};

    criticalPaths.forEach(pathToCheck => {
      const fullPath = path.join(process.cwd(), pathToCheck);
      const exists = fs.existsSync(fullPath);
      pathStatus[pathToCheck] = exists;
      if (!exists) allPathsExist = false;
    });

    // Check globe data files
    const themeFiles = ['BS-globe.json', 'WR-globe.json', 'LT-globe.json', 'MS-globe.json'];
    const globeFileStatus = {};
    
    themeFiles.forEach(file => {
      const filePath = path.join(process.cwd(), 'public', 'globe-data', file);
      globeFileStatus[file] = fs.existsSync(filePath);
    });

    healthData.checks = {
      critical_paths: pathStatus,
      globe_files: globeFileStatus,
      all_systems: allPathsExist
    };

    // Set status code based on health
    const statusCode = allPathsExist ? 200 : 503;

    res.status(statusCode).json(healthData);

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}