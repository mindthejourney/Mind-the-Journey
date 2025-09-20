import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Header from "../components/Header";
import Footer from "../components/Footer";
import InteractiveGlobeDemo from "../components/InteractiveGlobeDemo";
import ThemeButton from "../components/ThemeButton";
import { useTranslation } from "../lib/i18n";

const themes = [
  {
    id: 'borderscapes',
    label: 'BorderScapes',
    color: '#D9CAB3',
    icon: '/icons/BS-icon.png',
    description: 'Administrative boundaries and political divisions that define nations, regions and communities',
    gradient: 'from-[#F0E6D6] to-[#F5F0E9]'
  },
  {
    id: 'wildrealms',
    label: 'Wild Realms',
    color: '#76A989',
    icon: '/icons/WR-icon.png',
    description: 'Natural areas, biodiversity hotspots and the extraordinary ecosystems of our planet',
    gradient: 'from-[#F8FDF8] to-[#F2F9F2]'
  },
  {
    id: 'livingtraditions',
    label: 'Living Traditions',
    color: '#8B2F2F', // Updated to Burgundy Red
    icon: '/icons/LT-icon.png',
    description: 'Cultural heritage, ancestral traditions and humanity\'s intangible heritage',
    gradient: 'from-[#FAF7F2] to-[#F5F1EA]'
  },
  {
    id: 'mindscapes',
    label: 'Mindscapes',
    color: '#AC97BC',
    icon: '/icons/MS-icon.png',
    description: 'Geological wonders, mysterious places and extraordinary natural phenomena',
    gradient: 'from-[#EFE8F2] to-[#F2EDF5]'
  }
];

export default function Home() {
  const [isDemoRunning, setIsDemoRunning] = useState(true);
  const [currentDemoTheme, setCurrentDemoTheme] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const demoTimerRef = useRef(null);
  const { t } = useTranslation();

  // Demo sequence management
  useEffect(() => {
    if (isDemoRunning) {
      demoTimerRef.current = setInterval(() => {
        setCurrentDemoTheme(prev => (prev + 1) % themes.length);
      }, 4000); // 4 seconds per theme
    }

    return () => {
      if (demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
      }
    };
  }, [isDemoRunning]);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('error');
    }
  };

  const handleThemeClick = (themeId) => {
    setIsDemoRunning(false);
    setSelectedTheme(themeId);
    
    // Future: Navigate to theme section
    console.log('Navigating to theme:', themeId);
    // window.location.href = `/themes/${themeId}`;
  };

  const handleExploreTheme = (themeId) => {
    // Future: Navigate to full theme experience
    console.log('Exploring theme:', themeId);
    alert(`Full ${themes.find(t => t.id === themeId)?.label} exploration coming soon!`);
  };

  const restartDemo = () => {
    setIsDemoRunning(true);
    setSelectedTheme(null);
    setCurrentDemoTheme(0);
  };

  const currentTheme = themes[currentDemoTheme];

  return (
    <>
      <Head>
        <title>Mind the Journey - {t('homepage.subtitle')}</title>
        <meta name="description" content="Interactive tourism platform with 3D globes exploring world through BorderScapes, Wild Realms, Living Traditions, and Mindscapes" />
        <meta name="keywords" content="tourism, travel, 3D globe, interactive, culture, nature, boundaries, mysteries" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Mind the Journey - Interactive Tourism Platform" />
        <meta property="og:description" content="Explore the world through four unique perspectives with interactive 3D globes" />
        <meta property="og:type" content="website" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>

      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FAFAF7' }}>
        {/* Subtle World Map Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E2E8F0' fill-opacity='0.05'%3E%3Cpath d='M20 20h80v80H20z'/%3E%3Ccircle cx='60' cy='60' r='3'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='90' cy='90' r='2'/%3E%3Ccircle cx='30' cy='90' r='1.5'/%3E%3Ccircle cx='90' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px'
          }}
        />

        <div className="relative z-10">
          <Header />

          {/* API Status Indicator */}
          {apiStatus !== 'connected' && (
            <div className={`w-full py-2 text-center text-sm ${
              apiStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {apiStatus === 'error' ? '⚠️ API Connection Error - Using Demo Mode' : '🔄 Checking API Connection...'}
            </div>
          )}

          {/* Hero Section */}
          <section className="text-center py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-playfair text-gray-800 mb-6 leading-tight">
                {t('homepage.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed italic font-light">
                {t('homepage.subtitle')}
              </p>
              
              {/* Call to Action */}
              <div className="mb-12">
                <p className="text-2xl font-playfair text-gray-700 mb-2">
                  {t('homepage.cta')}
                </p>
                {isDemoRunning && (
                  <p className="text-sm text-gray-500 italic">
                    {t('homepage.demoRunning')}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Interactive Demo Section */}
          <section className="px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              
              {/* Theme Selection Buttons */}
              <div className="flex justify-center gap-4 mb-12 flex-wrap">
                {themes.map((theme, index) => (
                  <ThemeButton
                    key={theme.id}
                    label={theme.label}
                    color={theme.color}
                    icon={theme.icon}
                    isActive={isDemoRunning ? index === currentDemoTheme : selectedTheme === theme.id}
                    isDemoMode={isDemoRunning}
                    onClick={() => handleThemeClick(theme.id)}
                    className={`transition-all duration-500 ${
                      isDemoRunning && index === currentDemoTheme 
                        ? 'animate-pulse shadow-2xl ring-4 ring-white/50 scale-110' 
                        : ''
                    }`}
                  />
                ))}
              </div>

              {/* Interactive Globe Demo */}
              <div className="flex justify-center">
                <div className="relative">
                  <InteractiveGlobeDemo
                    currentTheme={isDemoRunning ? currentTheme : themes.find(t => t.id === selectedTheme) || currentTheme}
                    isDemoMode={isDemoRunning}
                    onThemeSelect={handleExploreTheme}
                  />
                  
                  {/* Demo Controls */}
                  {isDemoRunning && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {themes.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                index === currentDemoTheme ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setIsDemoRunning(false)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                        >
                          {t('buttons.stopDemo')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Restart Demo Button */}
                  {!isDemoRunning && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
                      <button
                        onClick={restartDemo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <span>🔄</span>
                        {t('buttons.restartDemo')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Theme Info */}
              <div className="mt-8 text-center max-w-2xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src={currentTheme.icon} 
                      alt={currentTheme.label} 
                      className="w-8 h-8 mr-3"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <h3 
                      className="text-2xl font-playfair font-bold"
                      style={{ color: currentTheme.color }}
                    >
                      {currentTheme.label}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-light">
                    {currentTheme.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Cards */}
          <section className="py-20 px-6" style={{ backgroundColor: '#FAFAF7' }}>
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-playfair mb-8 text-gray-800">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                {t('cta.subtitle')}
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: '🗺️',
                    title: t('cta.cards.0.title'),
                    description: t('cta.cards.0.description'),
                    color: themes[0].color
                  },
                  {
                    icon: '🤝',
                    title: t('cta.cards.1.title'),
                    description: t('cta.cards.1.description'),
                    color: themes[1].color
                  },
                  {
                    icon: '🌱',
                    title: t('cta.cards.2.title'),
                    description: t('cta.cards.2.description'),
                    color: themes[2].color
                  }
                ].map((card, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="text-5xl mb-6">{card.icon}</div>
                    <h3 
                      className="text-2xl font-bold mb-4 font-playfair"
                      style={{ color: card.color }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-light">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-montserrat">
                  {t('cta.buttons.start')}
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200 font-montserrat">
                  {t('cta.buttons.learn')}
                </button>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </>
  );
}