import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderImage {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  images: SliderImage[];
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  autoplaySpeed?: number; // en ms
  height?: string;
}

const HeroSlider = ({
  images,
  title,
  subtitle,
  buttonText,
  buttonLink,
  autoplaySpeed = 6000,
  height = 'h-96'
}: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Función para avanzar al siguiente slide
  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      setTimeout(() => setIsTransitioning(false), 500); // Matching transition duration
    }
  };

  // Función para retroceder al slide anterior
  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      setTimeout(() => setIsTransitioning(false), 500); // Matching transition duration
    }
  };

  // Auto-rotación del slider
  useEffect(() => {
    if (images.length > 1) {
      timerRef.current = setInterval(nextSlide, autoplaySpeed);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [images.length, autoplaySpeed]);

  // Resetear el timer cuando se cambia manualmente
  const handleManualChange = (fn: () => void) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    fn();
    timerRef.current = setInterval(nextSlide, autoplaySpeed);
  };

  // Precarga todas las imágenes para una transición más suave
  useEffect(() => {
    images.forEach(image => {
      const img = new Image();
      img.src = image.src;
    });
  }, [images]);

  return (
    <div 
      className={`relative w-full ${height} overflow-hidden rounded-xl shadow-lg bg-[#001C58]/5`}
      ref={slidesContainerRef}
    >
      {/* Imágenes */}
      <div className="absolute inset-0 w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0'
            }`}
            aria-hidden={index !== currentIndex}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Overlay de gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001C58]/80 via-[#001C58]/60 to-transparent z-20"></div>

      {/* Contenido */}
      <div className="relative z-30 h-full flex flex-col justify-center">
        <div className="text-white p-8 md:p-12 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-shadow-lg">{title}</h1>
          <p className="text-lg md:text-xl mb-8 text-shadow-sm max-w-lg">{subtitle}</p>
          <Link href={buttonLink}>
            <Button className="bg-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/90 font-semibold px-6 py-2 text-lg shadow-lg transform transition hover:scale-105">
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-30 shadow-lg"
            onClick={() => !isTransitioning && handleManualChange(prevSlide)}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} className="text-shadow" />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-30 shadow-lg"
            onClick={() => !isTransitioning && handleManualChange(nextSlide)}
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={24} className="text-shadow" />
          </button>
        </>
      )}

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`h-3 w-3 rounded-full transition-all shadow-md ${
              idx === currentIndex 
                ? 'bg-[#FDBE11] w-5 scale-110' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
            onClick={() => {
              if (!isTransitioning) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                setIsTransitioning(true);
                setCurrentIndex(idx);
                setTimeout(() => setIsTransitioning(false), 500);
                timerRef.current = setInterval(nextSlide, autoplaySpeed);
              }
            }}
            aria-label={`Ir a la imagen ${idx + 1}`}
            aria-current={idx === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;