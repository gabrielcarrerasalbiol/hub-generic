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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Función para avanzar al siguiente slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  // Función para retroceder al slide anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
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

  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-xl shadow-lg`}>
      {/* Imágenes */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001C58]/80 to-transparent flex items-center">
            <div className="text-white p-8 md:p-12 max-w-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              <p className="text-lg md:text-xl mb-6">{subtitle}</p>
              <Link href={buttonLink}>
                <Button className="bg-[#FDBE11] text-[#001C58] hover:bg-[#FDBE11]/90 font-semibold">
                  {buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            onClick={() => handleManualChange(prevSlide)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            onClick={() => handleManualChange(nextSlide)}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-[#FDBE11]' : 'bg-white/50'
            }`}
            onClick={() => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              setCurrentIndex(idx);
              timerRef.current = setInterval(nextSlide, autoplaySpeed);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;