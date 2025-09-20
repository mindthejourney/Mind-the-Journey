import '../styles/globals.css'
import { LanguageProvider } from '../lib/i18n'
import { useEffect } from 'react'

// Error boundary for better error handling
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== 'undefined') {
      // Log page load performance
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
      });
      
      // Add global error handling
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
      });
      
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
      });
    }
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App error:', error, errorInfo);
      }}
    >
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default MyApp