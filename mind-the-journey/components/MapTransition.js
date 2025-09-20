// components/MapTransition.js - Transizione da Globo 3D a Mappa 2D
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const Globe = dynamic(() => import('globe.gl'), { ssr: false });
const MapboxMap = dynamic(() => import('./MapboxMap'), { ssr: false });

export default function MapTransition({ 
  theme, 
  selectedRegion, 
  onRegionSelect, 
  onPointSelect 
}) {
  const [viewMode, setViewMode] = useState('globe'); // 'globe', 'transition', 'map'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [targetRegion, setTargetRegion] = useState(null);

  const handleRegionClick = (region) => {
    setTargetRegion(region);
    setViewMode('transition');
    
    // Inizia la transizione
    setTimeout(() => {
      setViewMode('map');
      onRegionSelect(region);
    }, 1500);
  };

  const handleBackToGlobe = () => {
    setViewMode('transition');
    setTimeout(() => {
      setViewMode('globe');
      setTargetRegion(null);
      onRegionSelect(null);
    }, 1000);
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden rounded-xl shadow-2xl">
      <AnimatePresence mode="wait">
        {viewMode === 'globe' && (
          <motion.div
            key="globe"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <GlobeView
              theme={theme}
              onRegionClick={handleRegionClick}
              onPointSelect={onPointSelect}
            />
          </motion.div>
        )}

        {viewMode === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800"
          >
            <TransitionAnimation targetRegion={targetRegion} />
          </motion.div>
        )}

        {viewMode === 'map' && selectedRegion && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <MapboxMap
              region={selectedRegion}
              theme={theme}
              onPointSelect={onPointSelect}
              onBackToGlobe={handleBackToGlobe}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controlli di Navigazione */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => viewMode === 'map' ? handleBackToGlobe() : null}
          className={`px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg
            ${viewMode === 'map' ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'}`}
          disabled={viewMode !== 'map'}
        >
          🌍 Torna al Globo
        </motion.button>
        
        <div className="text-sm bg-black/50 text-white px-3 py-1 rounded">
          {viewMode === 'globe' && 'Vista Globale'}
          {viewMode === 'transition' && 'Transizione...'}
          {viewMode === 'map' && `${selectedRegion?.name}`}
        </div>
      </div>
    </div>
  );
}

// Componente per l'animazione di transizione
function TransitionAnimation({ targetRegion }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"
        />
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-playfair mb-2"
        >
          Esplorando {targetRegion?.name}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/80"
        >
          Caricamento della mappa dettagliata...
        </motion.p>
      </div>
    </div>
  );
}

// components/MapboxMap.js - Mappa 2D con Mapbox
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxMap({ region, theme, onPointSelect, onBackToGlobe }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [region.lng, region.lat],
      zoom: 8,
      bearing: 0,
      pitch: 45
    });

    map.current.on('load', async () => {
      // Carica i punti di interesse per la regione
      try {
        const response = await fetch(
          `/api/globe/${theme.id}/region/${region.id}`
        );
        const data = await response.json();
        setPoints(data.points);
        
        // Aggiungi i punti alla mappa
        addPointsToMap(data.points);
        setLoading(false);
      } catch (error) {
        console.error('Error loading region data:', error);
        setLoading(false);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [region, theme]);

  const addPointsToMap = (points) => {
    if (!map.current) return;

    // Aggiungi source per i punti
    map.current.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: points.map(point => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          },
          properties: {
            id: point.id,
            name: point.name,
            description: point.description,
            type: point.type,
            rating: point.avg_rating || 0
          }
        }))
      }
    });

    // Layer per i punti
    map.current.addLayer({
      id: 'points-layer',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 8,
          12, 16,
          16, 24
        ],
        'circle-color': theme.color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Layer per le etichette
    map.current.addLayer({
      id: 'points-labels',
      type: 'symbol',
      source: 'points',
      layout: {
        'text-field': '{name}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#333333',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Click handler per i punti
    map.current.on('click', 'points-layer', (e) => {
      const point = e.features[0].properties;
      onPointSelect(point);
      
      // Centra la mappa sul punto
      map.current.flyTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: 12,
        duration: 1000
      });
    });

    // Cambia cursore sui punti
    map.current.on('mouseenter', 'points-layer', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'points-layer', () => {
      map.current.getCanvas().style.cursor = '';
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p>Caricamento mappa...</p>
          </div>
        </div>
      )}

      {/* Pannello laterale con informazioni */}
      <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b" style={{ backgroundColor: theme.color }}>
          <h3 className="text-white font-bold text-lg">{region.name}</h3>
          <p className="text-white/90 text-sm">{theme.name}</p>
        </div>
        
        <div className="p-4 overflow-y-auto h-full">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Punti di Interesse ({points.length})</h4>
            <div className="space-y-2">
              {points.slice(0, 5).map(point => (
                <div
                  key={point.id}
                  onClick={() => onPointSelect(point)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <h5 className="font-medium">{point.name}</h5>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {point.description}
                  </p>
                  {point.avg_rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm ml-1">{point.avg_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={onBackToGlobe}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Torna al Globo
          </button>
        </div>
      </div>

      {/* Controlli mappa */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => map.current?.zoomIn()}
          className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold"
        >
          −
        </button>
        <button
          onClick={() => {
            map.current?.flyTo({
              center: [region.lng, region.lat],
              zoom: 8,
              bearing: 0,
              pitch: 45
            });
          }}
          className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg shadow-lg flex items-center justify-center text-sm"
        >
          🏠
        </button>
      </div>
    </div>
  );
}

// components/ContributionForm.js - Form per contributi wiki-style
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ContributionForm({ theme, onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Aggiungi dati del form
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Aggiungi immagini
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image.file);
      });
      
      formData.append('theme_id', theme.id);
      
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        toast.success('Contributo inviato! Sarà recensito dal nostro team.');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Errore nell\'invio del contributo');
      }
      
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error('Errore di connessione');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36)
    }));
    
    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 immagini
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-playfair">Aggiungi un Contributo</h2>
          <p className="text-gray-600 mt-2">
            Condividi la tua conoscenza sulla categoria {theme.name}
          </p>
          
          {/* Progress bar */}
          <div className="flex items-center mt-4 space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Step 1: Informazioni Base */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Nome del Luogo *</label>
                <input
                  {...register('name', { required: 'Nome obbligatorio', minLength: 3 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="es. Lago di Como"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrizione Breve *</label>
                <textarea
                  {...register('description', { required: 'Descrizione obbligatoria', minLength: 20 })}
                  className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione concisa del luogo (20-200 caratteri)"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitudine *</label>
                  <input
                    type="number"
                    step="0.000001"
                    {...register('lat', { required: 'Latitudine obbligatoria' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="45.123456"
                  />
                  {errors.lat && <p className="text-red-500 text-sm mt-1">{errors.lat.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitudine *</label>
                  <input
                    type="number"
                    step="0.000001"
                    {...register('lng', { required: 'Longitudine obbligatoria' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="9.123456"
                  />
                  {errors.lng && <p className="text-red-500 text-sm mt-1">{errors.lng.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo di Luogo</label>
                <select
                  {...register('type')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona tipo</option>
                  <option value="city">Città</option>
                  <option value="natural_site">Sito Naturale</option>
                  <option value="historic_site">Sito Storico</option>
                  <option value="cultural_site">Sito Culturale</option>
                  <option value="religious_site">Sito Religioso</option>
                  <option value="national_park">Parco Nazionale</option>
                  <option value="museum">Museo</option>
                  <option value="monument">Monumento</option>
                  <option value="other">Altro</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Step 2: Dettagli e Contenuti */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Descrizione Dettagliata</label>
                <textarea
                  {...register('long_description')}
                  className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione completa del luogo, storia, caratteristiche particolari..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Significato/Importanza</label>
                <textarea
                  {...register('significance')}
                  className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                  placeholder="Perché questo luogo è importante? Cosa lo rende speciale?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sito Web (opzionale)</label>
                <input
                  type="url"
                  {...register('website_url')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tag (separati da virgola)</label>
                <input
                  {...register('tags')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="montagna, lago, storia, unesco, trekking"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Immagini e Revisione */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Immagini (max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">📝 Revisione Prima dell'Invio</h4>
                <div className="text-sm text-yellow-700">
                  <p><strong>Nome:</strong> {watch('name')}</p>
                  <p><strong>Posizione:</strong> {watch('lat')}, {watch('lng')}</p>
                  <p><strong>Tipo:</strong> {watch('type') || 'Non specificato'}</p>
                  <p><strong>Immagini:</strong> {images.length}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informazioni sul Processo</h4>
                <p className="text-sm text-blue-700">
                  Il tuo contributo verrà esaminato dal nostro team di moderatori entro 48-72 ore.
                  Ti invieremo una notifica via email quando sarà approvato e pubblicato.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Indietro
                </button>
              )}
            </div>
            
            <div className="space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Avanti →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  📤 Invia Contributo
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// components/OperatorDashboard.js - Dashboard per operatori turistici
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function OperatorDashboard({ user }) {
  const [operator, setOperator] = useState(null);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperatorData();
  }, []);

  const loadOperatorData = async () => {
    try {
      const response = await fetch('/api/operators/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOperator(data.operator);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading operator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (tier) => {
    try {
      const response = await fetch('/api/operators/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tier })
      });
      
      if (response.ok) {
        toast.success('Upgrade effettuato con successo!');
        loadOperatorData();
      } else {
        toast.error('Errore durante l\'upgrade');
      }
    } catch (error) {
      toast.error('Errore di connessione');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!operator) {
    return <OperatorRegistration onSuccess={loadOperatorData} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair mb-2">Dashboard Operatore</h1>
        <p className="text-gray-600">Gestisci la tua presenza su Mind the Journey</p>
      </div>

      {/* Subscription Status */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{operator.company_name}</h2>
            <p className="opacity-90">Piano: {operator.subscription_tier.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalViews || 0}</div>
            <div className="opacity-90">Visualizzazioni (30gg)</div>
          </div>
        </div>
        
        {operator.subscription_tier === 'free' && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="mb-3">Aggiorna il tuo piano per maggiore visibilità!</p>
            <div className="flex gap-3">
              <button
                onClick={() => upgradeSubscription('basic')}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Basic €29/mese
              </button>
              <button
                onClick={() => upgradeSubscription('premium')}
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-colors"
              >
                Premium €79/mese
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBookings || 0}</div>
          <div className="text-gray-600">Prenotazioni</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-green-600">{stats.avgRating || 0}</div>
          <div className="text-gray-600">Valutazione Media</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalReviews || 0}</div>
          <div className="text-gray-600">Recensioni</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="text-2xl font-bold text-orange-600">€{stats.totalRevenue || 0}</div>
          <div className="text-gray-600">Ricavi (30gg)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {[
              { id: 'overview', label: 'Panoramica' },
              { id: 'profile', label: 'Profilo' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'reviews', label: 'Recensioni' },
              { id: 'settings', label: 'Impostazioni' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab stats={stats} operator={operator} />}
          {activeTab === 'profile' && <ProfileTab operator={operator} onUpdate={loadOperatorData} />}
          {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
          {activeTab === 'reviews' && <ReviewsTab operatorId={operator.id} />}
          {activeTab === 'settings' && <SettingsTab operator={operator} onUpdate={loadOperatorData} />}
        </div>
      </div>
    </div>
  );
}

// Componente per registrazione nuovo operatore
function OperatorRegistration({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/operators/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Registrazione operatore completata!');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Errore nella registrazione');
      }
    } catch (error) {
      toast.error('Errore di connessione');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-playfair mb-6">Registra la tua Attività</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome Azienda *</label>
            <input
              {...register('company_name', { required: 'Nome azienda obbligatorio' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo di Attività *</label>
            <select
              {...register('business_type', { required: 'Tipo attività obbligatorio' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleziona tipo</option>
              <option value="hotel">Hotel/B&B</option>
              <option value="restaurant">Ristorante</option>
              <option value="tour_operator">Tour Operator</option>
              <option value="transport">Trasporti</option>
              <option value="experience">Esperienze</option>
              <option value="other">Altro</option>
            </select>
            {errors.business_type && <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrizione</label>
            <textarea
              {...register('description')}
              className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
              placeholder="Descrivi la tua attività..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Telefono</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sito Web</label>
              <input
                type="url"
                {...register('website')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Indirizzo</label>
            <textarea
              {...register('address')}
              className="w-full px-4 py-2 border rounded-lg h-20 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitudine</label>
              <input
                type="number"
                step="0.000001"
                {...register('lat')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Longitudine</label>
              <input
                type="number"
                step="0.000001"
                {...register('lng')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Registra Attività
          </button>
        </form>
      </div>
    </div>
  );
}