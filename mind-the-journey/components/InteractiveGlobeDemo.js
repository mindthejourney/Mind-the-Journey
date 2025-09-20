import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Importa Globe dinamicamente per evitare problemi SSR
const Globe = dynamic(() => import('globe.gl'), { ssr: false });

// Configurazioni tema-specifiche per il demo
const getDemoGlobeConfig = (theme) => {
  const configs = {
    borderscapes: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      landColor: '#E6D9C7',
      oceanColor: '#C7B29A',
      pointColor: '#A08B6E',
      atmosphereColor: 'rgba(217, 202, 179, 0.3)',
      focusType: 'political'
    },
    wildrealms: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-topology.png',
      landColor: '#8FBC9E', 
      oceanColor: '#5A8268',
      pointColor: '#4A6B57',
      atmosphereColor: 'rgba(118, 169, 137, 0.4)',
      focusType: 'natural'
    },
    livingtraditions: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-night.jpg',
      landColor: '#C49B92', // Adjusted for new burgundy theme
      oceanColor: '#9B6B6B', 
      pointColor: '#8B2F2F', // New burgundy color
      atmosphereColor: 'rgba(139, 47, 47, 0.3)',
      focusType: 'cultural'
    },
    mindscapes: {
      globeTexture: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
      landColor: '#C0B1CE',
      oceanColor: '#957BA3',
      pointColor: '#7C638A', 
      atmosphereColor: 'rgba(172, 151, 188, 0.5)',
      focusType: 'mysterious'
    }
  };
  
  return configs[theme.id] || configs.borderscapes;
};

// Sample demo data for each theme
const getDemoData = (theme) => {
  const demoData = {
    borderscapes: [
      { lat: 41.9028, lng: 12.4964, name: 'Rome', size: 8 },
      { lat: 45.4642, lng: 9.1900, name: 'Milan', size: 6 },
      { lat: 48.8566, lng: 2.3522, name: 'Paris', size: 7 },
      { lat: 52.5200, lng: 13.4050, name: 'Berlin', size: 6 },
      { lat: 40.7128, lng: -74.0060, name: 'New York', size: 8 }
    ],
    wildrealms: [
      { lat: 46.4833, lng: 10.4500, name: 'Stelvio National Park', size: 6 },
      { lat: 44.1167, lng: 9.7167, name: 'Cinque Terre', size: 5 },
      { lat: -14.6928, lng: -75.1500, name: 'Paracas', size: 4 },
      { lat: 64.9631, lng: -19.0208, name: 'Iceland', size: 7 },
      { lat: -22.9068, lng: -43.1729, name: 'Tijuca Forest', size: 5 }
    ],
    livingtraditions: [
      { lat: 37.3886, lng: -5.9823, name: 'Flamenco Andalusia', size: 6 },
      { lat: 45.4408, lng: 12.3155, name: 'Venice Carnival', size: 7 },
      { lat: 23.806078, lng: 11.288452, name: 'Sahara Nomads', size: 8 },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo Traditions', size: 6 },
      { lat: -13.1639, lng: -72.5450, name: 'Machu Picchu', size: 7 }
    ],
    mindscapes: [
      { lat: 37.748, lng: 14.999, name: 'Mount Etna', size: 7 },
      { lat: 40.5627, lng: 14.2056, name: 'Blue Grotto Capri', size: 5 },
      { lat: 38.789, lng: 15.213, name: 'Stromboli', size: 6 },
      { lat: 64.1466, lng: -21.9426, name: 'Blue Lagoon', size: 5 },
      { lat: 20.6843, lng: -88.5678, name: 'Cenotes Mexico', size: 6 }
    ]
  };
  
  return demoData[theme.id] || demoData.borderscapes;
};

export default function InteractiveGlobeDemo({ currentTheme, isDemoMode, onThemeSelect }) {
  const globeEl = useRef();
  const mountRef = useRef();
  const [loading, setLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (mountRef.current && !loading) {
      initializeGlobe();
    }
  }, [currentTheme, loading]);

  useEffect(() => {
    if (globeEl.current && currentConfig) {
      transitionTheme();
    }
  }, [currentTheme]);

  const initializeGlobe = () => {
    if (!mountRef.current) return;

    const config = getDemoGlobeConfig(currentTheme);
    setCurrentConfig(config);

    // Crea nuova istanza del globo se non esiste
    if (!globeEl.current) {
      const globe = Globe();
      globeEl.current = globe;

      // Mount del globo nel container
      mountRef.current.innerHTML = '';
      globe(mountRef.current);

      // Configurazione iniziale
      setupGlobe(globe, config);
    }

    setLoading(false);
  };

  const setupGlobe = (globe, config) => {
    globe
      .globeImageUrl(config.globeTexture)
      .backgroundColor('rgba(0,0,0,0)')
      .width(700)
      .height(700)
      .showAtmosphere(true)
      .atmosphereColor(config.atmosphereColor)
      .atmosphereAltitude(0.2);

    // Punto di vista iniziale
    globe.pointOfView({
      lat: 20,
      lng: 0,
      altitude: 2.5
    }, 0);

    // Auto-rotation per demo
    if (isDemoMode) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
    }

    // Aggiungi punti demo
    const demoPoints = getDemoData(currentTheme);
    globe
      .pointsData(demoPoints)
      .pointColor(config.pointColor)
      .pointAltitude(0.05)
      .pointRadius(d => d.size * 0.15)
      .pointResolution(8)
      .pointLabel(d => `
        <div style="
          background: rgba(255,255,255,0.95); 
          padding: 8px 12px; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: 'Lato', sans-serif;
          border-left: 3px solid ${config.pointColor};
        ">
          <div style="font-weight: bold; color: #2d3748; margin-bottom: 4px;">
            ${d.name}
          </div>
          <div style="font-size: 11px; color: #718096;">
            ${getFocusDescription(config.focusType)}
          </div>
        </div>
      `)
      .onPointClick((point) => {
        if (isDemoMode && onThemeSelect) {
          onThemeSelect(currentTheme.id);
        }
      });

    // Aggiungi animazione pulsing ai punti
    animatePoints(globe, demoPoints, config.pointColor);
  };

  const transitionTheme = () => {
    if (!globeEl.current || isTransitioning) return;

    setIsTransitioning(true);
    const globe = globeEl.current;
    const config = getDemoGlobeConfig(currentTheme);

    // Smooth transition della texture del globo
    setTimeout(() => {
      globe.globeImageUrl(config.globeTexture);
      globe.atmosphereColor(config.atmosphereColor);
      
      // Aggiorna i punti con nuovo colore e dati
      const demoPoints = getDemoData(currentTheme);
      globe
        .pointsData(demoPoints)
        .pointColor(config.pointColor);

      setCurrentConfig(config);
      setIsTransitioning(false);
    }, 300);
  };

  const animatePoints = (globe, points, color) => {
    // Animazione pulsing per i punti
    let pulsePhase = 0;
    const pulseAnimation = () => {
      pulsePhase += 0.02;
      
      globe.pointAltitude(d => {
        const baseAltitude = 0.05;
        const pulse = Math.sin(pulsePhase + (d.lat * 0.01)) * 0.02;
        return baseAltitude + pulse;
      });

      if (isDemoMode) {
        requestAnimationFrame(pulseAnimation);
      }
    };
    
    if (isDemoMode) {
      pulseAnimation();
    }
  };

  const getFocusDescription = (focusType) => {
    const descriptions = {
      political: 'Political & Administrative',
      natural: 'Natural & Protected Areas',
      cultural: 'Cultural Heritage Sites',
      mysterious: 'Geological Mysteries'
    };
    return descriptions[focusType] || 'Point of Interest';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-[700px] h-[700px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <p className="text-xl font-medium text-blue-700">Loading Interactive Demo...</p>
          <p className="text-sm text-blue-600 mt-2">Preparing globe experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Globe Container */}
      <div 
        ref={mountRef} 
        className={`w-[700px] h-[700px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isTransitioning ? 'opacity-75' : 'opacity-100'
        }`}
        style={{ 
          background: currentConfig ? 
            `radial-gradient(circle at center, ${currentConfig.oceanColor}40, ${currentConfig.landColor}20)` :
            'radial-gradient(circle at center, #4A90E240, #E2E8F020)'
        }}
      />
      
      {/* Demo Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-800 mb-1">
              {isDemoMode ? 'Interactive Demo' : 'Theme Selected'}
            </h4>
            <p className="text-sm text-gray-600">
              {isDemoMode 
                ? `Showcasing ${currentTheme.label} perspective` 
                : `Click "Explore" to dive into ${currentTheme.label}`
              }
            </p>
          </div>
          {!isDemoMode && (
            <button
              onClick={() => onThemeSelect(currentTheme.id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
            >
              Explore Theme
            </button>
          )}
        </div>
      </div>

      {/* Theme Transition Indicator */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <div className="bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Transitioning to {currentTheme.label}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Demo Controls */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">
            {isDemoMode ? 'Demo Active' : 'Demo Paused'}
          </span>
        </div>
      </div>
    </div>
  );
}