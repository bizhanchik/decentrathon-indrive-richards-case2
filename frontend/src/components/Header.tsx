import { useState } from 'react';
import type { HeaderProps } from '../types';
import { navigationItems, languages } from '../data/constants';

export function Header({ currentLanguage, onLanguageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold" style={{ color: '#141414' }}>
              in<span style={{ color: '#C1F21D' }}>Drive</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-75"
                style={{ color: '#141414' }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Language Selector & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium hover:opacity-75"
                style={{ color: '#141414' }}
              >
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.code.toUpperCase()}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        onLanguageChange(language);
                        setIsLanguageMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm hover:opacity-75"
                      style={{ color: '#141414' }}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button 
              className="px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: '#C1F21D', color: '#141414' }}
            >
              Download the app
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:opacity-75"
              style={{ color: '#141414' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#C1F21D' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium hover:opacity-75"
                  style={{ color: '#141414' }}
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: '#C1F21D' }}>
                <div className="px-3 py-2 text-sm font-medium" style={{ color: '#141414', opacity: 0.7 }}>Language</div>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      onLanguageChange(language);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium hover:opacity-75"
                    style={{ color: '#141414' }}
                  >
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Mobile CTA */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: '#C1F21D' }}>
                <button 
                  className="w-full px-6 py-3 rounded-lg text-base font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#C1F21D', color: '#141414' }}
                >
                  Download the app
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}