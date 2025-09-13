import { useState, useEffect } from 'react';
import { Highlight } from './Highlight';
import type { HeroProps } from '../types';

export function Hero({ slides, autoplayInterval = 5000 }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoplayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        <img
          src={currentSlideData.image}
          alt={currentSlideData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: '#141414', opacity: 0.4 }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h2 className="text-sm font-semibold mb-2 tracking-wide uppercase" style={{ color: '#C1F21D' }}>
            {currentSlideData.subtitle}
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Join a <Highlight>fair journey</Highlight>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#FFFEEB' }}>
            Where people agree and <Highlight>challenge injustice</Highlight>
          </h2>
          <p className="text-xl mb-8 max-w-lg" style={{ color: '#FFFEEB', opacity: 0.9 }}>
            {currentSlideData.description}
          </p>
          <a
            href={currentSlideData.ctaHref}
            className="inline-block px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#C1F21D', color: '#141414' }}
          >
            {currentSlideData.ctaText}
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}