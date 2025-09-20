import { useState, useRef } from 'react';
import { useTranslation } from '../lib/i18n';
import GlobeComponent from './GlobeComponent';
import MoreInfoPanel from './MoreInfoPanel';

// Category buttons with specific colors
const categoryButtons = [
  { id: 'must-see', label: 'Must See Places', color: '#D9CAB3', icon: '🏛️' },
  { id: 'natural', label: 'Natural Wonders', color: '#76A989', icon: '🌲' },
  { id: 'events', label: 'Unmissable Events', color: '#B8722C', icon: '🎭' },
  { id: 'experiences', label: 'Experiences to Live', color: '#2C5F7A', icon: '🎨' },
  { id: 'encounters', label: 'Authentic Encounters', color: '#8B2F2F', icon: '🤝' },
  { id: 'taste-trails', label: 'Taste Trails', color: '#7A8B2F', icon: '🍷' },
  { id: 'flavours', label: 'Flavours of the Land', color: '#8B5A2F', icon: '🍯' }
];

export default function ThemeSectionLayout({ theme, onBackToHome }) {
  const [currentLevel, setCurrentLevel] = useState('macroareas'); // 'macroareas' | 'countries'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [focusedArea, setFocusedArea] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(2);
  
  const { t } = useTranslation();
  const globeRef = useRef();

  // Theme-specific gradient background
  const getBackgroundGradient = (themeId) => {
    const gradients = {
      borderscapes: 'from-[#F0E6D6] to-[#F5F0E9]',
      wildrealms: 'from-[#F8FDF8] to-[#F2F9F2]',
      livingtraditions: 'from-[#FAF7F2] to-[#F5F1EA]',
      mindscapes: 'from-[#EFE8F2] to-[#F2EDF5]'
    };
    return gradients[themeId] || gradients.borderscapes;
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleLevel = () => {
    setCurrentLevel(prev => prev === 'macroareas' ? 'countries' : 'macroareas');
  };

  const handleAreaClick = (area) => {
    setFocusedArea(area);
    setIsLocked(true);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setFocusedArea(null);
  };

  const handleZoomChange = (newZoomLevel) => {
    setZoomLevel(newZoomLevel);
    // Trigger 2D map transition if zoom > 8 and focused on single country
    if (newZoomLevel > 8 && focusedArea && focusedArea.type === 'country') {
      // Future: Transition to 2D map
      console.log('Transitioning to 2D map for:', focusedArea.name);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient(theme.id)} relative`}>
      {/* Subtle World Map Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E8F0' fill-opacity='0.05'%3E%3Cpath d='M20 20h80v80H20z'/%3E%3Ccircle cx='60' cy='60' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      <div className="relative z-10">
        {/* Desktop Layout (>1024px) */}
        <div className="hidden lg:flex h-screen">
          {/* Left Sidebar */}
          <div className="w-80 bg-white/80 backdrop-blur border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <button
                  onClick={onBackToHome}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <img src={theme.icon} alt={theme.label} className="w-8 h-8" />
                  <h1 className="text-2xl font-playfair font-bold" style={{ color: theme.color }}>
                    {theme.label}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3 mb-8">
                <button 
                  className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: theme.color }}
                >
                  {t('buttons.whyGoing')}
                </button>
                <button 
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                  className="w-full py-3 px-4 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('buttons.moreInfo')}
                </button>
              </div>

              {/* Category Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Thematic Categories
                </h3>
                <div className="space-y-2">
                  {categoryButtons.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full py-3 px-4 text-left rounded-lg transition-all flex items-center gap-3 ${
                        selectedCategories.includes(category.id)
                          ? 'text-white shadow-lg'
                          : 'bg-white/50 hover:bg-white/80 text-gray-700'
                      }`}
                      style={{
                        backgroundColor: selectedCategories.includes(category.id) ? category.color : undefined
                      }}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-sm">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative">
            {/* Top Controls */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
              {/* Level Toggle */}
              <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrentLevel('macroareas')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                      currentLevel === 'macroareas' 
                        ? 'bg-white shadow text-gray-800' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Macroareas
                  </button>
                  <button
                    onClick={() => setCurrentLevel('countries')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                      currentLevel === 'countries' 
                        ? 'bg-white shadow text-gray-800' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Countries
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
                <input
                  type="text"
                  placeholder={currentLevel === 'macroareas' ? 'Search macroareas...' : 'Search countries...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Globe or More Info Panel */}
            {showMoreInfo ? (
              <MoreInfoPanel 
                theme={theme}
                focusedArea={focusedArea}
                onClose={() => setShowMoreInfo(false)}
              />
            ) : (
              <GlobeComponent
                ref={globeRef}
                selectedTheme={theme.id}
                currentLevel={currentLevel}
                selectedCategories={selectedCategories}
                focusedArea={focusedArea}
                isLocked={isLocked}
                searchQuery={searchQuery}
                onAreaClick={handleAreaClick}
                onUnlock={handleUnlock}
                onZoomChange={handleZoomChange}
                className="w-full h-full"
              />
            )}

            {/* Status Info */}
            {focusedArea && (
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{focusedArea.flag || '📍'}</span>
                  <h3 className="font-bold text-gray-800">{focusedArea.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {focusedArea.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleUnlock}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                  >
                    Unlock
                  </button>
                  <button
                    onClick={() => setShowMoreInfo(true)}
                    className="px-3 py-1 text-white rounded text-sm transition-colors"
                    style={{ backgroundColor: theme.color }}
                  >
                    More Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tablet/Mobile Responsive Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="bg-white/90 backdrop-blur border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <div className="flex items-center gap-2">
                <img src={theme.icon} alt={theme.label} className="w-6 h-6" />
                <h1 className="text-lg font-bold" style={{ color: theme.color }}>
                  {theme.label}
                </h1>
              </div>

              <button
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex gap-2 mb-4">
              <button 
                className="flex-1 py-2 px-3 text-white font-semibold rounded text-sm"
                style={{ backgroundColor: theme.color }}
              >
                Why Going
              </button>
              <button className="flex-1 py-2 px-3 border border-gray-300 font-semibold rounded text-sm">
                More Info
              </button>
            </div>

            {/* Mobile Level Toggle & Search */}
            <div className="flex gap-2 mb-4">
              <div className="flex bg-gray-100 rounded-lg p-1 flex-1">
                <button
                  onClick={() => setCurrentLevel('macroareas')}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all ${
                    currentLevel === 'macroareas' ? 'bg-white shadow text-gray-800' : 'text-gray-600'
                  }`}
                >
                  Macroareas
                </button>
                <button
                  onClick={() => setCurrentLevel('countries')}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all ${
                    currentLevel === 'countries' ? 'bg-white shadow text-gray-800' : 'text-gray-600'
                  }`}
                >
                  Countries
                </button>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Mobile Category Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {categoryButtons.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`py-2 px-3 text-left rounded-lg transition-all flex items-center gap-2 ${
                    selectedCategories.includes(category.id)
                      ? 'text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedCategories.includes(category.id) ? category.color : undefined
                  }}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span className="font-medium text-xs">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="relative" style={{ height: 'calc(100vh - 300px)' }}>
            {showMoreInfo ? (
              <MoreInfoPanel 
                theme={theme}
                focusedArea={focusedArea}
                onClose={() => setShowMoreInfo(false)}
                isMobile={true}
              />
            ) : (
              <GlobeComponent
                ref={globeRef}
                selectedTheme={theme.id}
                currentLevel={currentLevel}
                selectedCategories={selectedCategories}
                focusedArea={focusedArea}
                isLocked={isLocked}
                searchQuery={searchQuery}
                onAreaClick={handleAreaClick}
                onUnlock={handleUnlock}
                onZoomChange={handleZoomChange}
                isMobile={true}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}