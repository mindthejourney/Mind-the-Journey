import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Importa Globe dinamicamente per evitare problemi SSR
const Globe = dynamic(() => import('globe.gl'), { ssr: false });

// Configurazioni tema-specifiche per i globi
const getThemeGlobeConfig = (theme) => {
  const configs = {
    borderscapes: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      landColor: '#E6D9C7',
      oceanColor: '#C7B29A',
      pointColor: '#A08B6E',
      pointShape: 'square',
      atmosphere: {
        enabled: true,
        color: 'rgba(217, 202, 179, 0.2)',
        altitude: 0.1
      }
    },
    wildrealms: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-topology.png',
      landColor: '#8FBC9E', 
      oceanColor: '#5A8268',
      pointColor: '#4A6B57',
      pointShape: 'circle',
      atmosphere: {
        enabled: true,
        color: 'rgba(118, 169, 137, 0.3)',
        altitude: 0.15
      }
    },
    livingtraditions: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-night.jpg',
      landColor: '#C49B92', // Adjusted for burgundy theme
      oceanColor: '#9B6B6B', 
      pointColor: '#8B2F2F', // Burgundy color
      pointShape: 'diamond',
      atmosphere: {
        enabled: true,
        color: 'rgba(139, 47, 47, 0.3)',
        altitude: 0.12
      }
    },
    mindscapes: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
      landColor: '#C0B1CE',
      oceanColor: '#957BA3',
      pointColor: '#7C638A', 
      pointShape: 'star',
      atmosphere: {
        enabled: true,
        color: 'rgba(172, 151, 188, 0.4)',
        altitude: 0.2
      }
    }
  };
  
  return configs[theme] || configs.borderscapes;
};

export default function GlobeComponent({ 
  selectedTheme = 'borderscapes', 
  currentLevel = 'macroareas',
  selectedCategories = [],
  focusedArea = null,
  isLocked = false,
  searchQuery = '',
  onAreaClick,
  onUnlock,
  onZoomChange,
  className = "",
  isMobile = false
}) {
  const globeEl = useRef();
  const mountRef = useRef();
  const [globeData, setGlobeData] = useState(null);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(2);

  useEffect(() => {
    loadGlobeData();
  }, [selectedTheme, currentLevel]);

  useEffect(() => {
    if (globeEl.current && globeData) {
      updateGlobeDisplay();
    }
  }, [selectedCategories, searchQuery, focusedArea]);

  const loadGlobeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carica dati dal nostro API route
      const response = await axios.get(`/api/globe/${selectedTheme}`, {
        params: {
          level: currentLevel,
          bounds: focusedArea ? JSON.stringify(getBoundsForArea(focusedArea)) : null
        }
      });

      setGlobeData(response.data);
      
      // Carica dati paesi/macroaree se necessario
      if (currentLevel === 'countries') {
        const countryResponse = await axios.get('/api/countries', {
          params: { level: currentLevel }
        });
        setCountryData(countryResponse.data.data);
      }

    } catch (err) {
      console.error('Error loading globe data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeGlobe = () => {
    if (!globeData || !mountRef.current) return;

    const config = getThemeGlobeConfig(selectedTheme);

    // Crea nuova istanza del globo se non esiste
    if (!globeEl.current) {
      const globe = Globe();
      globeEl.current = globe;

      // Mount del globo nel container
      mountRef.current.innerHTML = '';
      globe(mountRef.current);

      // Setup event listeners
      setupGlobeEvents(globe);
    }

    const globe = globeEl.current;

    // Configurazione base
    globe
      .globeImageUrl(config.globeTexture)
      .backgroundColor('rgba(0,0,0,0)')
      .width(isMobile ? 350 : 700)
      .height(isMobile ? 350 : 700)
      .showAtmosphere(config.atmosphere.enabled)
      .atmosphereColor(config.atmosphere.color)
      .atmosphereAltitude(config.atmosphere.altitude);

    // Punto di vista iniziale
    globe.pointOfView({
      lat: globeData.metadata?.focusRegion?.lat || 42.0,
      lng: globeData.metadata?.focusRegion?.lng || 12.0,
      altitude: globeData.metadata?.focusRegion?.altitude || 2.5
    }, 0);

    // Aggiorna display
    updateGlobeDisplay();
  };

  const updateGlobeDisplay = () => {
    if (!globeEl.current || !globeData) return;

    const globe = globeEl.current;
    const config = getThemeGlobeConfig(selectedTheme);

    // Filtra punti basato su categorie selezionate e ricerca
    let filteredPoints = globeData.points || [];
    
    if (selectedCategories.length > 0) {
      filteredPoints = filteredPoints.filter(point => 
        point.categories && point.categories.some(cat => selectedCategories.includes(cat))
      );
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredPoints = filteredPoints.filter(point =>
        point.name.toLowerCase().includes(searchLower) ||
        point.description.toLowerCase().includes(searchLower)
      );
    }

    // Aggiorna punti sul globo
    globe
      .pointsData(filteredPoints)
      .pointColor(d => d.color || config.pointColor)
      .pointAltitude(d => {
        const baseAltitude = (d.size || 5) * 0.003;
        return isLocked && focusedArea && d.id === focusedArea.id ? baseAltitude * 2 : baseAltitude;
      })
      .pointRadius(d => {
        const baseSize = Math.max(0.3, (d.size || 5) * 0.1);
        return isLocked && focusedArea && d.id === focusedArea.id ? baseSize * 1.5 : baseSize;
      })
      .pointResolution(8)
      .pointLabel(d => createPointTooltip(d, config))
      .onPointClick(handlePointClick);

    // Aggiorna connessioni se presenti
    if (globeData.connections && globeData.connections.length > 0) {
      globe
        .arcsData(globeData.connections)
        .arcColor(d => d.color || 'rgba(255, 255, 255, 0.4)')
        .arcDashLength(0.4)
        .arcDashGap(2)
        .arcDashAnimateTime(d => d.animationSpeed || 2000)
        .arcStroke(d => d.strokeWidth || 2);
    }

    // Aggiungi layer paesi/macroaree se necessario
    if (currentLevel === 'countries' && countryData.length > 0) {
      updateCountryLayer();
    }
  };

  const createPointTooltip = (point, config) => {
    return `
      <div style="
        background: linear-gradient(135deg, white 0%, #f8f9fa 100%); 
        padding: 16px; 
        border-radius: 12px; 
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        max-width: 320px;
        border-left: 5px solid ${point.color || config.pointColor};
        font-family: 'Lato', sans-serif;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">
            ${getThemeEmoji(selectedTheme)}
          </span>
          <h3 style="margin: 0; font-weight: bold; color: #2d3748; font-size: 16px;">
            ${point.name}
          </h3>
        </div>
        <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 13px; line-height: 1.4;">
          ${point.description || ''}
        </p>
        ${point.population ? `<div style="margin: 4px 0; font-size: 12px; color: #718096;">
          👥 ${typeof point.population === 'number' ? point.population.toLocaleString() : point.population}
        </div>` : ''}
        ${point.area ? `<div style="margin: 4px 0; font-size: 12px; color: #718096;">
          📐 ${typeof point.area === 'number' ? point.area.toLocaleString() : point.area} km²
        </div>` : ''}
        ${point.significance ? `<div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: 11px; color: #2d3748;">
          <strong>Significance:</strong> ${point.significance.length > 100 ? point.significance.substring(0, 100) + '...' : point.significance}
        </div>` : ''}
        ${point.crossReferences && point.crossReferences.length > 0 ? `<div style="margin-top: 8px; font-size: 11px; color: #805ad5;">
          <strong>Also in:</strong> ${point.crossReferences.map(ref => ref.theme).join(', ')}
        </div>` : ''}
        <div style="margin-top: 8px; font-size: 10px; color: #a0aec0;">
          Click for details • Level: ${currentLevel}
        </div>
      </div>
    `;
  };

  const handlePointClick = (point, event, coords) => {
    const { lat, lng, altitude } = coords;

    // Zoom sul punto
    if (globeEl.current) {
      globeEl.current.pointOfView({ 
        lat: point.lat, 
        lng: point.lng, 
        altitude: Math.max(0.8, altitude * 0.5)
      }, 2000);
    }

    // Callback per parent component
    if (onAreaClick) {
      onAreaClick({
        ...point,
        type: currentLevel === 'countries' ? 'country' : 'macroarea'
      });
    }

    // Aggiorna zoom level
    const newZoomLevel = Math.max(6, zoomLevel * 2);
    setZoomLevel(newZoomLevel);
    if (onZoomChange) {
      onZoomChange(newZoomLevel);
    }
  };

  const setupGlobeEvents = (globe) => {
    // Gestione zoom
    globe.controls().addEventListener('change', () => {
      if (globe.camera) {
        const distance = globe.camera.position.distanceTo({x: 0, y: 0, z: 0});
        const zoomLevel = Math.max(1, Math.min(10, 10 - distance));
        
        if (Math.abs(zoomLevel - zoomLevel) > 0.1) {
          setZoomLevel(zoomLevel);
          if (onZoomChange) {
            onZoomChange(zoomLevel);
          }
        }
      }
    });

    // Gestione drag per unlock
    if (isLocked) {
      let dragStart = null;
      
      globe.controls().addEventListener('start', (event) => {
        dragStart = Date.now();
      });
      
      globe.controls().addEventListener('end', (event) => {
        if (dragStart && Date.now() - dragStart > 200 && onUnlock) {
          onUnlock();
        }
      });
    }
  };

  const updateCountryLayer = () => {
    // Implementazione per layer paesi - placeholder per ora
    // Qui si possono aggiungere poligoni dei confini nazionali
    console.log('Updating country layer with', countryData.length, 'countries');
  };

  const getBoundsForArea = (area) => {
    // Calcola bounds approssimativi per un'area
    const padding = 5; // gradi
    return {
      north: area.lat + padding,
      south: area.lat - padding,
      east: area.lng + padding,
      west: area.lng - padding
    };
  };

  const getThemeEmoji = (theme) => {
    const emojis = {
      borderscapes: '🏛️',
      wildrealms: '🌲', 
      livingtraditions: '🍷', // Updated for burgundy theme
      mindscapes: '🌟'
    };
    return emojis[theme] || '📍';
  };

  useEffect(() => {
    if (!loading && !error && globeData && mountRef.current) {
      initializeGlobe();
    }

    return () => {
      if (globeEl.current) {
        globeEl.current.pauseAnimation();
      }
    };
  }, [globeData, loading, error, isMobile]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl ${isMobile ? 'h-[350px]' : 'h-[700px]'} ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-blue-700">Loading {selectedTheme}...</p>
          <p className="text-sm text-blue-600 mt-2">Level: {currentLevel}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center bg-gradient-to-b from-red-50 to-red-100 rounded-xl ${isMobile ? 'h-[350px]' : 'h-[700px]'} ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Loading Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadGlobeData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Globe Container */}
      <div 
        ref={mountRef} 
        className={`${isMobile ? 'w-[350px] h-[350px]' : 'w-[700px] h-[700px]'} rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 to-blue-900`}
        style={{ minHeight: isMobile ? '350px' : '700px' }}
      />
      
      {/* Globe Stats Overlay */}
      {globeData && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-bold text-sm text-gray-800 mb-1">
            {globeData.theme?.name}
          </h4>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>📍 {(globeData.points || []).length} points</span>
            <span>🔗 {(globeData.connections || []).length} connections</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Level: {currentLevel} | Zoom: {zoomLevel.toFixed(1)}x
          </div>
        </div>
      )}
      
      {/* Search Results Info */}
      {searchQuery && (
        <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-2">
          <div className="text-xs text-yellow-800">
            🔍 Search: "{searchQuery}" | {globeData?.points?.length || 0} results
          </div>
        </div>
      )}
      
      {/* Category Filters Info */}
      {selectedCategories.length > 0 && (
        <div className="absolute top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-2">
          <div className="text-xs text-blue-800">
            🏷️ Filters: {selectedCategories.length} active
          </div>
        </div>
      )}
    </div>
  );
}