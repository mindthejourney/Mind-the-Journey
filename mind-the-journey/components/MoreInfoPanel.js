import { useState } from 'react';
import { useTranslation } from '../lib/i18n';

const moreInfoSections = [
  { id: 'back-globe', label: 'Back to Globe', icon: '🌍', isPrimary: true },
  { id: 'why-going', label: 'Why Going', icon: '✨', isDefault: true },
  { id: 'when-go', label: 'When Should You Go', icon: '📅' },
  { id: 'transports', label: 'Transports', icon: '🚌' },
  { id: 'security', label: 'Security Issues', icon: '🛡️' },
  { id: 'books-movies', label: 'Books & Movies', icon: '📚' }
];

export default function MoreInfoPanel({ theme, focusedArea, onClose, isMobile = false }) {
  const [activeSection, setActiveSection] = useState('why-going');
  const { t } = useTranslation();

  const handleSectionClick = (sectionId) => {
    if (sectionId === 'back-globe') {
      onClose();
      return;
    }
    setActiveSection(sectionId);
  };

  const renderContent = () => {
    const areaName = focusedArea?.name || 'this destination';
    
    switch (activeSection) {
      case 'why-going':
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-playfair font-bold mb-4" style={{ color: theme.color }}>
                Why Visit {areaName}?
              </h3>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {getWhyGoingContent(theme.id, focusedArea)}
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Key Highlights</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {getHighlights(theme.id, focusedArea).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Unique Features</h4>
                    <div className="space-y-3">
                      {getUniqueFeatures(theme.id, focusedArea).map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-2xl">{feature.icon}</span>
                          <span className="text-sm text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'when-go':
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-playfair font-bold mb-4" style={{ color: theme.color }}>
                Best Time to Visit {areaName}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Seasonal Guide</h4>
                  <div className="space-y-3">
                    {getSeasonalInfo(theme.id, focusedArea).map((season, index) => (
                      <div key={index} className={`p-3 rounded-lg ${season.recommended ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{season.icon}</span>
                          <span className="font-medium">{season.season}</span>
                          {season.recommended && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Recommended</span>}
                        </div>
                        <p className="text-sm text-gray-600">{season.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Climate Overview</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Average Temperature:</span>
                        <span className="font-medium">15°C - 28°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rainfall:</span>
                        <span className="font-medium">Moderate</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best months:</span>
                        <span className="font-medium">April - June, September - October</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'transports':
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-playfair font-bold mb-4" style={{ color: theme.color }}>
                Getting to {areaName}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {getTransportOptions(theme.id, focusedArea).map((transport, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-3">{transport.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-2">{transport.type}</h4>
                    <p className="text-sm text-gray-600 mb-3">{transport.description}</p>
                    <div className="text-xs text-gray-500">
                      <div>Duration: {transport.duration}</div>
                      <div>Cost: {transport.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-playfair font-bold mb-4" style={{ color: theme.color }}>
                Safety & Security in {areaName}
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium text-green-800">Generally Safe</span>
                  </div>
                  <p className="text-sm text-green-700">
                    This destination is considered safe for tourists with standard precautions.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Safety Tips</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Keep copies of important documents</li>
                      <li>• Stay aware of your surroundings</li>
                      <li>• Use official transportation</li>
                      <li>• Keep emergency contacts handy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Emergency Contacts</h4>
                    <div className="space-y-2 text-sm">
                      <div>Emergency: 112</div>
                      <div>Police: 113</div>
                      <div>Medical: 118</div>
                      <div>Fire: 115</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'books-movies':
        return (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-playfair font-bold mb-4" style={{ color: theme.color }}>
                Cultural Context for {areaName}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📚</span> Recommended Books
                  </h4>
                  <div className="space-y-3">
                    {getRecommendedBooks(theme.id, focusedArea).map((book, index) => (
                      <div key={index} className="border-l-4 border-blue-400 pl-3">
                        <h5 className="font-medium text-gray-800">{book.title}</h5>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-xs text-gray-500 mt-1">{book.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎬</span> Movies & Documentaries
                  </h4>
                  <div className="space-y-3">
                    {getRecommendedMovies(theme.id, focusedArea).map((movie, index) => (
                      <div key={index} className="border-l-4 border-red-400 pl-3">
                        <h5 className="font-medium text-gray-800">{movie.title}</h5>
                        <p className="text-sm text-gray-600">{movie.year} • {movie.director}</p>
                        <p className="text-xs text-gray-500 mt-1">{movie.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Content for {activeSection}</div>;
    }
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'h-full'} overflow-y-auto`}>
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="h-full flex">
          {/* Sidebar Navigation */}
          <div className="w-80 bg-white/80 backdrop-blur border-r border-gray-200 p-6">
            <div className="space-y-2">
              {moreInfoSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full py-3 px-4 text-left rounded-lg transition-all flex items-center gap-3 ${
                    section.id === 'back-globe'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : activeSection === section.id
                      ? 'text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/80 text-gray-700'
                  }`}
                  style={{
                    backgroundColor: section.id !== 'back-globe' && activeSection === section.id ? theme.color : undefined
                  }}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div>
          {/* Mobile Navigation */}
          <div className="bg-white/90 backdrop-blur rounded-lg p-2 mb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {moreInfoSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                    section.id === 'back-globe'
                      ? 'bg-gray-600 text-white'
                      : activeSection === section.id
                      ? 'text-white shadow-lg'
                      : 'bg-white/50 text-gray-700'
                  }`}
                  style={{
                    backgroundColor: section.id !== 'back-globe' && activeSection === section.id ? theme.color : undefined
                  }}
                >
                  <span className="text-sm">{section.icon}</span>
                  <span className="font-medium text-xs">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Content */}
          <div>
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions to generate content based on theme and area
function getWhyGoingContent(themeId, area) {
  const defaultContent = {
    borderscapes: "Explore the fascinating world of political boundaries and administrative divisions that shape our modern world.",
    wildrealms: "Discover pristine natural environments and witness the incredible biodiversity that makes our planet unique.",
    livingtraditions: "Immerse yourself in authentic cultural experiences and witness living traditions passed down through generations.",
    mindscapes: "Uncover the geological mysteries and natural phenomena that continue to puzzle and amaze scientists and visitors alike."
  };
  
  return area?.significance || defaultContent[themeId] || "A unique destination worth exploring.";
}

function getHighlights(themeId, area) {
  const defaultHighlights = {
    borderscapes: ["Unique administrative structure", "Historical significance", "Political importance", "Cultural diversity"],
    wildrealms: ["Rich biodiversity", "Protected ecosystems", "Rare wildlife", "Conservation success"],
    livingtraditions: ["Authentic cultural experiences", "Traditional crafts", "Local festivals", "Intangible heritage"],
    mindscapes: ["Unique geological features", "Natural phenomena", "Scientific interest", "Unexplained mysteries"]
  };
  
  return area?.features || defaultHighlights[themeId] || ["Unique characteristics", "Historical importance", "Cultural value"];
}

function getUniqueFeatures(themeId, area) {
  const defaultFeatures = {
    borderscapes: [{icon: "🏛️", text: "Administrative heritage"}, {icon: "📜", text: "Historical documents"}, {icon: "🗳️", text: "Democratic processes"}],
    wildrealms: [{icon: "🌿", text: "Endemic species"}, {icon: "🦅", text: "Wildlife sanctuary"}, {icon: "🌍", text: "Ecosystem services"}],
    livingtraditions: [{icon: "🎭", text: "Cultural festivals"}, {icon: "🏺", text: "Traditional crafts"}, {icon: "🎵", text: "Folk music"}],
    mindscapes: [{icon: "🔬", text: "Scientific phenomena"}, {icon: "🌋", text: "Geological activity"}, {icon: "❓", text: "Unexplained mysteries"}]
  };
  
  return defaultFeatures[themeId] || [{icon: "✨", text: "Unique characteristics"}];
}

function getSeasonalInfo(themeId, area) {
  return [
    {season: "Spring", icon: "🌸", description: "Mild temperatures, blooming nature", recommended: true},
    {season: "Summer", icon: "☀️", description: "Warm weather, peak season", recommended: false},
    {season: "Autumn", icon: "🍂", description: "Pleasant temperatures, fewer crowds", recommended: true},
    {season: "Winter", icon: "❄️", description: "Cool weather, indoor activities", recommended: false}
  ];
}

function getTransportOptions(themeId, area) {
  return [
    {type: "Flight", icon: "✈️", description: "Fastest option to major airports", duration: "2-8 hours", cost: "€100-500"},
    {type: "Train", icon: "🚄", description: "Comfortable overland travel", duration: "4-12 hours", cost: "€50-200"},
    {type: "Car", icon: "🚗", description: "Flexible self-drive option", duration: "6-15 hours", cost: "€100-300"}
  ];
}

function getRecommendedBooks(themeId, area) {
  const defaultBooks = {
    borderscapes: [
      {title: "The Power of Geography", author: "Tim Marshall", description: "How geography shapes politics and international relations"},
      {title: "Prisoners of Geography", author: "Tim Marshall", description: "Understanding geopolitics through geographical constraints"}
    ],
    wildrealms: [
      {title: "The Hidden Life of Trees", author: "Peter Wohlleben", description: "Fascinating insights into forest ecosystems"},
      {title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", description: "Indigenous wisdom and plant knowledge"}
    ],
    livingtraditions: [
      {title: "The Cultural Map", author: "Erin Meyer", description: "Understanding cultural differences across the globe"},
      {title: "Sapiens", author: "Yuval Noah Harari", description: "The story of human cultural evolution"}
    ],
    mindscapes: [
      {title: "The Hidden Reality", author: "Brian Greene", description: "Parallel universes and deep laws of the cosmos"},
      {title: "Wonders of the Universe", author: "Brian Cox", description: "Exploring the mysteries of space and time"}
    ]
  };
  
  return defaultBooks[themeId] || [{title: "Travel Guide", author: "Local Expert", description: "Comprehensive guide to the region"}];
}

function getRecommendedMovies(themeId, area) {
  const defaultMovies = {
    borderscapes: [
      {title: "The Battle of Algiers", year: "1966", director: "Gillo Pontecorvo", description: "Political thriller about colonial independence"},
      {title: "Hotel Rwanda", year: "2004", director: "Terry George", description: "Drama about borders and human rights"}
    ],
    wildrealms: [
      {title: "Planet Earth", year: "2006", director: "Alastair Fothergill", description: "Stunning BBC nature documentary series"},
      {title: "March of the Penguins", year: "2005", director: "Luc Jacquet", description: "Documentary about Antarctic wildlife"}
    ],
    livingtraditions: [
      {title: "Coco", year: "2017", director: "Lee Unkrich", description: "Animated film celebrating Mexican traditions"},
      {title: "Departures", year: "2008", director: "Yojiro Takita", description: "Japanese film about cultural rituals"}
    ],
    mindscapes: [
      {title: "Interstellar", year: "2014", director: "Christopher Nolan", description: "Science fiction exploring space mysteries"},
      {title: "Cave of Forgotten Dreams", year: "2010", director: "Werner Herzog", description: "Documentary about ancient cave paintings"}
    ]
  };
  
  return defaultMovies[themeId] || [{title: "Local Documentary", year: "Recent", director: "Regional Filmmaker", description: "Exploring the local area"}];
}