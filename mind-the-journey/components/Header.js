import Image from "next/image";
import { LanguageSwitcher, useTranslation } from "../lib/i18n";

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="w-full text-center py-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex justify-between items-center px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image 
            src="/MtJ-logoHP.png" 
            alt="Mind the Journey Logo" 
            width={60} 
            height={60}
            className="hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div 
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl hidden"
          >
            M
          </div>
        </div>

        {/* Site Title & Subtitle */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-playfair text-gray-800 mb-1">
            {t('homepage.title')}
          </h1>
          <p className="text-sm italic text-gray-600 font-lato">
            {t('homepage.subtitle')}
          </p>
        </div>

        {/* Social Icons & Language */}
        <div className="flex items-center gap-4">
          {/* Social Media Icons */}
          <div className="hidden md:flex gap-3">
            {[
              { name: 'Instagram', icon: '📷', url: '#' },
              { name: 'YouTube', icon: '📺', url: '#' },
              { name: 'TikTok', icon: '🎵', url: '#' },
              { name: 'Spotify', icon: '🎧', url: '#' }
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg transition-colors duration-200"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
          
          {/* Language Switcher */}
          <LanguageSwitcher className="ml-2" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="flex flex-wrap justify-center gap-8 font-montserrat text-sm font-medium">
          {[
            { key: 'home', href: '/' },
            { key: 'themes', href: '#', dropdown: true },
            { key: 'videos', href: '/videos' },
            { key: 'about', href: '/about' },
            { key: 'blog', href: '/blog' },
            { key: 'contact', href: '/contact' }
          ].map((item) => (
            <li key={item.key}>
              <a 
                href={item.href}
                className={`
                  relative px-3 py-2 rounded-md transition-all duration-200
                  hover:text-blue-600 hover:bg-blue-50
                  ${item.dropdown ? 'after:content-["▾"] after:ml-1 after:text-xs' : ''}
                `}
              >
                {t(`nav.${item.key}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu Toggle (for future mobile optimization) */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
        onClick={() => {
          // Future: Toggle mobile menu
          console.log('Mobile menu toggle');
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  );
}