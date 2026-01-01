import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Ban, 
  Bell, 
  CheckCircle, 
  Crown, 
  History, 
  LineChart, 
  Star, 
  Trophy, 
  Tv, 
  UserCircle, 
  UserPlus,
  Home,
  Flame,
  Heart,
  Users,
  Sparkles
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/useAuth";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function AboutPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Referencia al carrusel
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Función para avanzar al siguiente slide automáticamente
  const autoAdvanceSlide = useCallback(() => {
    if (carouselRef.current) {
      const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
      setCurrentSlideIndex(nextIndex);
      // El componente Carousel gestiona internamente el cambio visual
    }
  }, [currentSlideIndex]);
  
  // Efecto para el autoplay del carrusel
  useEffect(() => {
    // Iniciar el autoplay
    autoplayIntervalRef.current = setInterval(() => {
      autoAdvanceSlide();
    }, 7000); // Cambiar cada 7 segundos
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [autoAdvanceSlide]);
  
  // Carrusel mejorado con imágenes reales del Real Madrid
  const heroSlides = [
    {
      title: t("about.heroSlider.home.title"),
      subtitle: t("about.heroSlider.home.subtitle"),
      bgColor: "bg-[#1E3A8A]",
      textColor: "text-white",
      icon: <Trophy className="inline-block mr-3 h-10 w-10 text-brand-secondary" />,
      image: "/images/real-madrid-hero.jpg"
    },
    {
      title: t("about.heroSlider.passion.title"),
      subtitle: t("about.heroSlider.passion.subtitle"),
      bgColor: "bg-gray-200",
      textColor: "text-[#1E3A8A]",
      icon: <Flame className="inline-block mr-3 h-8 w-8 text-[#1E3A8A]" />,
      image: "/images/real-madrid-fans-singing.jpg"
    },
    {
      title: t("about.heroSlider.feeling.title"),
      subtitle: t("about.heroSlider.feeling.subtitle"),
      bgColor: "bg-brand-secondary",
      textColor: "text-[#1E3A8A]",
      icon: <Heart className="inline-block mr-3 h-8 w-8 text-[#1E3A8A]" />,
      image: "/images/real-madrid-fans-stadium-view.jpg"
    },
    {
      title: t("about.heroSlider.fans.title"),
      subtitle: t("about.heroSlider.fans.subtitle"),
      bgColor: "bg-gradient-to-r from-[#1E3A8A] to-[#2C2152]",
      textColor: "text-white",
      icon: <Users className="inline-block mr-3 h-8 w-8" />,
      image: "/images/real-madrid-fans-stadium.jpg"
    }
  ];

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] overflow-y-auto">
      {/* Hero Banner - Simplificado con colores del Real Madrid */}
      <section className="relative w-full overflow-hidden">
        <Carousel 
          className="w-full" 
          opts={{ loop: true }}
          onSelect={(index) => setCurrentSlideIndex(index)}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index} className="w-full">
                <div 
                  className={`w-full h-[30rem] bg-cover bg-center flex items-center justify-center relative ${slide.bgColor}`}
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  {/* Overlay de color semitransparente */}
                  <div className={`absolute inset-0 ${slide.bgColor} opacity-20`}></div>
                  
                  <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${slide.textColor}`}>{slide.icon}{slide.title}</h1>
                    <p className={`text-xl md:text-2xl opacity-90 ${slide.textColor}`}>{slide.subtitle}</p>
                    
                    {index === 0 && (
                      <div className="mt-6">
                        <Link href="/register">
                          <Button className="bg-brand-secondary hover:bg-brand-secondary/80 text-[#1E3A8A] font-bold px-6 py-2 text-lg rounded-lg shadow-md">
                            {t("about.registerButton")}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2 z-50">
            {heroSlides.map((_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlideIndex === index 
                    ? 'bg-brand-secondary scale-125' 
                    : 'bg-gray-300/70'
                }`}
              />
            ))}
          </div>
          <CarouselPrevious className="left-4 bg-gray-300/30 hover:bg-gray-300/50 backdrop-blur border-none" />
          <CarouselNext className="right-4 bg-gray-300/30 hover:bg-gray-300/50 backdrop-blur border-none" />
        </Carousel>
      </section>
      
      {/* About Hub Madridista */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{t("about.whatIsHub.title")}</h2>
          <div className="w-20 h-1 bg-brand-secondary mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            {t("about.whatIsHub.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-brand-secondary/80 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">{t("about.features.curatedContent.title")}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("about.features.curatedContent.description")}
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-brand-secondary/80 rounded-full flex items-center justify-center">
              <div className="flex items-center">
                <Tv className="w-7 h-7 text-white" />
                <Smartphone className="w-5 h-5 text-white ml-1" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">{t("about.features.multiplatform.title")}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("about.features.multiplatform.description")}
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-brand-secondary/80 rounded-full flex items-center justify-center relative">
              <Bell className="w-8 h-8 text-white" />
              <Star className="w-4 h-4 text-white absolute top-2 right-2 animate-ping" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">{t("about.features.notifications.title")}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("about.features.notifications.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="bg-[#1E3A8A] dark:bg-[#362C5A] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.premium.title")}</h2>
            <div className="w-20 h-1 bg-brand-secondary mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              {t("about.premium.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-brand-secondary" />
              </div>
              <Star className="w-3 h-3 text-brand-secondary absolute top-4 right-4" />
              <Star className="w-3 h-3 text-brand-secondary absolute top-4 left-4" />
              <h3 className="text-xl font-semibold mb-2">{t("about.premium.benefits.exclusiveChannels.title")}</h3>
              <p className="text-gray-200">
                {t("about.premium.benefits.exclusiveChannels.description")}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("about.premium.benefits.noAds.title")}</h3>
              <p className="text-gray-200">
                {t("about.premium.benefits.noAds.description")}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-brand-secondary" />
              </div>
              <History className="w-3 h-3 text-white/30 absolute top-4 right-6" />
              <History className="w-3 h-3 text-white/30 absolute top-6 right-10" />
              <h3 className="text-xl font-semibold mb-2">{t("about.premium.benefits.history.title")}</h3>
              <p className="text-gray-200">
                {t("about.premium.benefits.history.description")}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <LineChart className="w-6 h-6 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("about.premium.benefits.analysis.title")}</h3>
              <p className="text-gray-200">
                {t("about.premium.benefits.analysis.description")}
              </p>
            </div>
          </div>

          <div className="text-center">
            {user ? (
              user.role === 'premium' ? (
                <div className="bg-white/20 backdrop-blur inline-block px-6 py-3 rounded-lg">
                  <CheckCircle className="inline-block text-brand-secondary h-5 w-5 mr-2" />
                  <span className="font-medium">{t("about.premium.alreadyPremium")}</span>
                </div>
              ) : (
                <Link href="/profile">
                  <Button className="bg-brand-secondary hover:bg-brand-secondary/80 text-[#1E3A8A] font-medium text-lg px-8 py-3 rounded-lg">
                    {t("about.premium.upgradeToPremium")}
                  </Button>
                </Link>
              )
            ) : (
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="bg-brand-secondary hover:bg-brand-secondary/80 text-[#1E3A8A] font-medium text-lg px-8 py-3 rounded-lg">
                    {t("about.registerButton")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur font-medium text-lg px-8 py-3 rounded-lg">
                    {t("about.loginButton")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{t("about.testimonials.title")}</h2>
          <div className="w-20 h-1 bg-brand-secondary mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Carlos+R&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">{t("about.testimonials.users.carlos.name")}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("about.testimonials.users.carlos.role")}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              {t("about.testimonials.users.carlos.quote")}
            </p>
            <div className="mt-4 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-brand-secondary mr-1" fill="#FDBE11" />
              ))}
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Laura+M&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">{t("about.testimonials.users.laura.name")}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("about.testimonials.users.laura.role")}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              {t("about.testimonials.users.laura.quote")}
            </p>
            <div className="mt-4 flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-brand-secondary mr-1" fill="#FDBE11" />
              ))}
              <Star className="w-5 h-5 text-brand-secondary mr-1" fill="#FDBE11" strokeWidth={3} />
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Miguel+S&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">{t("about.testimonials.users.miguel.name")}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("about.testimonials.users.miguel.role")}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              {t("about.testimonials.users.miguel.quote")}
            </p>
            <div className="mt-4 flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-brand-secondary mr-1" fill="#FDBE11" />
              ))}
              <Star className="w-5 h-5 text-brand-secondary/30 mr-1" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-secondary/10 dark:bg-brand-secondary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
            {t("about.cta.title")}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            {t("about.cta.description")}
          </p>
          
          {!user ? (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-medium text-lg px-8 py-3 rounded-lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    {t("about.registerNowButton")}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/home">
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-medium text-lg px-8 py-3 rounded-lg">
                {t("home.viewAllVideos")}
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer Branding */}
      <section className="bg-[#1E3A8A] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hub Madridista</h2>
          <p className="text-sm text-white/70 mb-4">La mejor plataforma de contenido para aficionados del Real Madrid</p>
          <div className="flex justify-center gap-6">
            <Link href="/terminos">
              <p className="text-sm text-white/70 hover:text-white transition">Términos y Condiciones</p>
            </Link>
            <Link href="/privacidad">
              <p className="text-sm text-white/70 hover:text-white transition">Política de Privacidad</p>
            </Link>
            <Link href="/contacto">
              <p className="text-sm text-white/70 hover:text-white transition">Contacto</p>
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/50">© 2025 Hub Madridista. Todos los derechos reservados.</p>
        </div>
      </section>
    </main>
  );
}