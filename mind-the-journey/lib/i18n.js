// lib/i18n.js - Complete multilingual system V2
import { useState, useEffect, createContext, useContext } from 'react';

// Complete translation data for V2
const translations = {
  en: {
    // Homepage & Demo
    homepage: {
      title: "Mind the Journey",
      subtitle: "Where wandering becomes wondering",
      cta: "Choose a theme and start your journey.",
      demoRunning: "Interactive demo running - click any theme to explore"
    },
    
    // Main Action Buttons
    buttons: {
      whyGoing: "Why Going",
      moreInfo: "More Info", 
      backToGlobe: "Back to Globe",
      changeTheme: "Change Theme",
      stopDemo: "Stop Demo",
      restartDemo: "Restart Demo",
      exploreTheme: "Explore Theme"
    },

    // 7 Thematic Categories
    categories: {
      mustSee: "Must See Places",
      natural: "Natural Wonders", 
      events: "Unmissable Events",
      experiences: "Experiences to Live",
      encounters: "Authentic Encounters",
      tasteTrails: "Taste Trails",
      flavours: "Flavours of the Land"
    },

    // Globe Levels & Controls
    levels: {
      macroareas: "Macroareas",
      countries: "Countries",
      searchMacroarea: "Search macroareas...",
      searchCountry: "Search countries...",
      search: "Search...",
      levelToggle: "Toggle Level",
      unlock: "Unlock",
      locked: "Locked"
    },

    // More Info Sections
    moreInfo: {
      whyGoing: "Why Going",
      whenGo: "When Should You Go",
      transports: "Transports", 
      security: "Security Issues",
      booksMovies: "Books & Movies",
      backToGlobe: "Back to Globe",
      
      // Content Headers
      whyVisit: "Why Visit",
      keyHighlights: "Key Highlights",
      uniqueFeatures: "Unique Features", 
      bestTime: "Best Time to Visit",
      seasonalGuide: "Seasonal Guide",
      climateOverview: "Climate Overview",
      gettingTo: "Getting to",
      safetyTitle: "Safety & Security in",
      culturalContext: "Cultural Context for",
      recommendedBooks: "Recommended Books",
      moviesDocumentaries: "Movies & Documentaries",
      
      // Safety
      generallySafe: "Generally Safe",
      safetyTips: "Safety Tips",
      emergencyContacts: "Emergency Contacts",
      
      // Seasonal
      recommended: "Recommended",
      spring: "Spring",
      summer: "Summer", 
      autumn: "Autumn",
      winter: "Winter",
      
      // Transport
      flight: "Flight",
      train: "Train",
      car: "Car",
      duration: "Duration", 
      cost: "Cost"
    },

    // Themes (Updated with V2 colors)
    themes: {
      borderscapes: {
        name: "BorderScapes",
        description: "Administrative boundaries and political divisions that define nations, regions and communities",
        features: [
          "Capitals and centers of power",
          "International boundaries", 
          "Enclaves and special territories",
          "Administrative history"
        ]
      },
      wildrealms: {
        name: "Wild Realms", 
        description: "Natural areas, biodiversity hotspots and the extraordinary ecosystems of our planet",
        features: [
          "National parks",
          "Nature reserves",
          "Unique ecosystems",
          "Wildlife sanctuaries"
        ]
      },
      livingtraditions: {
        name: "Living Traditions",
        description: "Cultural heritage, ancestral traditions and humanity's intangible heritage",
        features: [
          "Local traditions",
          "UNESCO heritage",
          "Traditional crafts", 
          "Cultural festivals"
        ]
      },
      mindscapes: {
        name: "Mindscapes",
        description: "Geological wonders, mysterious places and extraordinary natural phenomena",
        features: [
          "Geological phenomena",
          "Mysterious places",
          "Geographic curiosities",
          "Unique landscapes"
        ]
      }
    },

    // Navigation
    nav: {
      home: "Home",
      themes: "Themes",
      videos: "Videos",
      about: "About", 
      blog: "Blog",
      contact: "Contact Us",
      language: "Language"
    },

    // Globe Interactions
    globe: {
      loading: "Loading globe...",
      loadingDemo: "Loading Interactive Demo...",
      preparingGlobe: "Preparing globe experience", 
      error: "Error loading",
      instructions: {
        title: "How to interact:",
        drag: "Drag to rotate",
        scroll: "Scroll to zoom",
        click: "Click points for details",
        controls: "Use controls (top-right)"
      },
      controls: {
        italy: "🇮🇹 Italy",
        auto: "Auto",
        demoActive: "Demo Active",
        demoPaused: "Demo Paused"
      },
      status: {
        showcasing: "Showcasing",
        perspective: "perspective",
        transitioningTo: "Transitioning to",
        interactiveDemo: "Interactive Demo",
        themeSelected: "Theme Selected"
      }
    },

    // Call to Action
    cta: {
      title: "Start your responsible journey",
      subtitle: "Discover authentic places, support local communities and travel sustainably",
      cards: [
        {
          title: "Explore",
          description: "Navigate through thousands of unique destinations via our interactive 3D globes"
        },
        {
          title: "Contribute",
          description: "Add your travel experiences and enrich the community's knowledge"
        },
        {
          title: "Support", 
          description: "Support local operators and sustainable tourism initiatives in your area"
        }
      ],
      buttons: {
        start: "🚀 Start Exploration",
        learn: "📚 Learn More"
      }
    },

    // Footer
    footer: {
      newsletter: "Subscribe to explore new routes, stories, and maps",
      sections: {
        navigation: "Navigation",
        about: "About",
        legal: "Legal", 
        connect: "Connect"
      },
      links: {
        project: "The Project",
        team: "Editorial Team", 
        collaborations: "Collaborations",
        contacts: "Contacts",
        privacy: "Privacy Policy",
        terms: "Terms of Use",
        cookies: "Cookie Policy",
        accessibility: "Accessibility"
      },
      copyright: "© 2025 Mind the Journey · All rights reserved",
      social: "Follow us:"
    },

    // Error Messages
    errors: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Try again",
      loadingError: "Error loading content",
      networkError: "Network connection error",
      retry: "Retry"
    }
  },
  
  it: {
    // Homepage & Demo 
    homepage: {
      title: "Mind the Journey",
      subtitle: "Dove il viaggiare diventa scoprire", 
      cta: "Scegli un tema e inizia il tuo viaggio.",
      demoRunning: "Demo interattivo in corso - clicca su un tema per esplorare"
    },

    // Main Action Buttons
    buttons: {
      whyGoing: "Perché Andare",
      moreInfo: "Maggiori Info",
      backToGlobe: "Torna al Globo", 
      changeTheme: "Cambia Tema",
      stopDemo: "Ferma Demo",
      restartDemo: "Riavvia Demo",
      exploreTheme: "Esplora Tema"
    },

    // 7 Thematic Categories
    categories: {
      mustSee: "Luoghi Imperdibili", 
      natural: "Meraviglie Naturali",
      events: "Eventi da Non Perdere",
      experiences: "Esperienze da Vivere",
      encounters: "Incontri Autentici",
      tasteTrails: "Percorsi del Gusto",
      flavours: "Sapori del Territorio"
    },

    // Globe Levels & Controls
    levels: {
      macroareas: "Macroaree",
      countries: "Paesi",
      searchMacroarea: "Cerca macroaree...",
      searchCountry: "Cerca paesi...", 
      search: "Cerca...",
      levelToggle: "Cambia Livello",
      unlock: "Sblocca",
      locked: "Bloccato"
    },

    // More Info Sections
    moreInfo: {
      whyGoing: "Perché Andare",
      whenGo: "Quando Andare", 
      transports: "Trasporti",
      security: "Sicurezza",
      booksMovies: "Libri e Film",
      backToGlobe: "Torna al Globo",

      // Content Headers
      whyVisit: "Perché Visitare",
      keyHighlights: "Punti Salienti",
      uniqueFeatures: "Caratteristiche Uniche",
      bestTime: "Periodo Migliore per Visitare", 
      seasonalGuide: "Guida Stagionale",
      climateOverview: "Panoramica Climatica",
      gettingTo: "Come Arrivare a",
      safetyTitle: "Sicurezza in",
      culturalContext: "Contesto Culturale per",
      recommendedBooks: "Libri Consigliati",
      moviesDocumentaries: "Film e Documentari",

      // Safety
      generallySafe: "Generalmente Sicuro",
      safetyTips: "Consigli di Sicurezza", 
      emergencyContacts: "Contatti di Emergenza",

      // Seasonal
      recommended: "Consigliato",
      spring: "Primavera",
      summer: "Estate",
      autumn: "Autunno", 
      winter: "Inverno",

      // Transport
      flight: "Volo",
      train: "Treno", 
      car: "Auto",
      duration: "Durata",
      cost: "Costo"
    },

    // Themes (Italian)
    themes: {
      borderscapes: {
        name: "BorderScapes",
        description: "Confini amministrativi e divisioni politiche che definiscono nazioni, regioni e comunità",
        features: [
          "Capitali e centri di potere",
          "Confini internazionali",
          "Enclavi e territori speciali", 
          "Storia amministrativa"
        ]
      },
      wildrealms: {
        name: "Wild Realms",
        description: "Aree naturali protette, hotspot di biodiversità e straordinari ecosistemi del pianeta", 
        features: [
          "Parchi nazionali",
          "Riserve naturali",
          "Ecosistemi unici",
          "Santuari della fauna"
        ]
      },
      livingtraditions: {
        name: "Living Traditions",
        description: "Patrimonio culturale, tradizioni ancestrali e patrimonio immateriale dell'umanità",
        features: [
          "Tradizioni locali",
          "Patrimonio UNESCO", 
          "Artigianato tradizionale",
          "Festival culturali"
        ]
      },
      mindscapes: {
        name: "Mindscapes",
        description: "Meraviglie geologiche, luoghi misteriosi e fenomeni naturali straordinari",
        features: [
          "Fenomeni geologici",
          "Luoghi misteriosi",
          "Curiosità geografiche",
          "Paesaggi unici"
        ]
      }
    },

    // Navigation
    nav: {
      home: "Home",
      themes: "Temi", 
      videos: "Video",
      about: "Chi Siamo",
      blog: "Blog",
      contact: "Contattaci",
      language: "Lingua"
    },

    // Globe Interactions
    globe: {
      loading: "Caricamento globo...",
      loadingDemo: "Caricamento Demo Interattivo...",
      preparingGlobe: "Preparazione esperienza globo",
      error: "Errore nel caricamento",
      instructions: {
        title: "Come interagire:",
        drag: "Trascina per ruotare", 
        scroll: "Scroll per zoom",
        click: "Clicca sui punti per dettagli",
        controls: "Usa i controlli (in alto a destra)"
      },
      controls: {
        italy: "🇮🇹 Italia",
        auto: "Auto",
        demoActive: "Demo Attivo",
        demoPaused: "Demo in Pausa"
      },
      status: {
        showcasing: "Mostrando",
        perspective: "prospettiva", 
        transitioningTo: "Passando a",
        interactiveDemo: "Demo Interattivo",
        themeSelected: "Tema Selezionato"
      }
    },

    // Call to Action
    cta: {
      title: "Inizia il tuo viaggio responsabile",
      subtitle: "Scopri luoghi autentici, supporta le comunità locali e viaggia in modo sostenibile",
      cards: [
        {
          title: "Esplora",
          description: "Naviga tra migliaia di destinazioni uniche attraverso i nostri globi 3D interattivi"
        },
        {
          title: "Contribuisci",
          description: "Aggiungi le tue esperienze di viaggio e arricchisci la conoscenza della community"
        },
        {
          title: "Sostieni",
          description: "Supporta operatori locali e iniziative di turismo sostenibile nella tua zona"
        }
      ],
      buttons: {
        start: "🚀 Inizia Esplorazione",
        learn: "📚 Scopri di Più"
      }
    },

    // Footer
    footer: {
      newsletter: "Iscriviti per esplorare nuovi percorsi, storie e mappe",
      sections: {
        navigation: "Navigazione",
        about: "Chi Siamo", 
        legal: "Legale",
        connect: "Connettiti"
      },
      links: {
        project: "Il Progetto",
        team: "Team Editoriale",
        collaborations: "Collaborazioni",
        contacts: "Contatti",
        privacy: "Privacy Policy", 
        terms: "Termini d'Uso",
        cookies: "Cookie Policy",
        accessibility: "Accessibilità"
      },
      copyright: "© 2025 Mind the Journey · Tutti i diritti riservati",
      social: "Seguici:"
    },

    // Error Messages
    errors: {
      somethingWentWrong: "Qualcosa è andato storto",
      tryAgain: "Riprova",
      loadingError: "Errore nel caricamento contenuto", 
      networkError: "Errore di connessione",
      retry: "Riprova"
    }
  }
};

// Language context
const LanguageContext = createContext();

// Enhanced language provider with V2 features
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check for saved language preference
        const saved = localStorage.getItem('mtj-language');
        if (saved && ['en', 'it'].includes(saved)) {
          setLanguage(saved);
        } else {
          // Detect browser language
          const browserLang = navigator.language.split('-')[0];
          if (browserLang === 'it') {
            setLanguage('it');
            localStorage.setItem('mtj-language', 'it');
          } else {
            localStorage.setItem('mtj-language', 'en');
          }
        }
      } catch (error) {
        console.warn('Error initializing language:', error);
        setLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = (newLang) => {
    if (['en', 'it'].includes(newLang) && newLang !== language) {
      setLanguage(newLang);
      localStorage.setItem('mtj-language', newLang);
      
      // Trigger page refresh for complete language switch (optional)
      // window.location.reload();
    }
  };

  const t = (key) => {
    try {
      const keys = key.split('.');
      let value = translations[language];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  // Provide loading state
  const contextValue = {
    language,
    changeLanguage,
    t,
    isLoading,
    isEnglish: language === 'en',
    isItalian: language === 'it',
    availableLanguages: ['en', 'it']
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Enhanced hook with error handling
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Enhanced language switcher with V2 styling
export const LanguageSwitcher = ({ className = "" }) => {
  const { language, changeLanguage, isLoading } = useLanguage();

  if (isLoading) {
    return (
      <div className={`w-16 h-8 bg-gray-200 rounded animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white/90 backdrop-blur border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:border-gray-400"
      >
        <option value="en">🇬🇧 EN</option>
        <option value="it">🇮🇹 IT</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="fill-current h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

// Utility hook for translations with enhanced features
export const useTranslation = () => {
  const { t, language, isLoading, isEnglish, isItalian } = useLanguage();
  
  return {
    t,
    language,
    isLoading,
    isEnglish,
    isItalian,
    // Helper functions
    formatNumber: (num) => {
      return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US').format(num);
    },
    formatDate: (date) => {
      return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date));
    },
    formatCurrency: (amount, currency = 'EUR') => {
      return new Intl.NumberFormat(language === 'it' ? 'it-IT' : 'en-US', {
        style: 'currency',
        currency
      }).format(amount);
    }
  };
};