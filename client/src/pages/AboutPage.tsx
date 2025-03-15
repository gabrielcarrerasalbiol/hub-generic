import { useState } from "react";
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

export default function AboutPage() {
  const { user } = useAuth();

  // Texto para el carrusel con colores de Real Madrid
  const heroSlides = [
    {
      title: "Hub Madridista",
      subtitle: "El hogar digital para todos los madridistas",
      bgColor: "bg-[#1E3A8A]",
      textColor: "text-white",
      icon: <Home className="inline-block mr-3 h-8 w-8" />
    },
    {
      title: "La Pasión Blanca",
      subtitle: "Vive cada momento con la misma intensidad",
      bgColor: "bg-white",
      textColor: "text-[#1E3A8A]",
      icon: <Flame className="inline-block mr-3 h-8 w-8 text-[#1E3A8A]" />
    },
    {
      title: "El Sentimiento",
      subtitle: "Unidos por los colores que nos representan",
      bgColor: "bg-[#FDBE11]",
      textColor: "text-[#1E3A8A]",
      icon: <Heart className="inline-block mr-3 h-8 w-8 text-[#1E3A8A]" />
    },
    {
      title: "La Afición Madridista",
      subtitle: "El corazón que late en cada estadio",
      bgColor: "bg-gradient-to-r from-[#1E3A8A] to-[#2C2152]",
      textColor: "text-white",
      icon: <Users className="inline-block mr-3 h-8 w-8" />
    }
  ];

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] overflow-y-auto">
      {/* Hero Banner - Simplificado con colores del Real Madrid */}
      <section className="relative w-full overflow-hidden">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index} className="w-full">
                <div className={`w-full py-16 ${slide.bgColor}`}>
                  <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${slide.textColor}`}>{slide.icon}{slide.title}</h1>
                    <p className={`text-xl md:text-2xl opacity-90 ${slide.textColor}`}>{slide.subtitle}</p>
                    
                    {index === 0 && (
                      <div className="mt-6">
                        <Link href="/register">
                          <Button className="bg-[#FDBE11] hover:bg-[#FDBE11]/80 text-[#1E3A8A] font-bold px-6 py-2 text-lg rounded-lg shadow-md">
                            Registrarse
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
                className="w-3 h-3 rounded-full bg-white/50 transition-all duration-300"
              />
            ))}
          </div>
          <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 backdrop-blur border-none" />
          <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 backdrop-blur border-none" />
        </Carousel>
      </section>
      
      {/* Botón "Si eres socio, accede ya" */}
      <section className="bg-[#FDBE11]/10 py-6 mb-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link href={user ? "/home" : "/login"}>
            <Button className="bg-[#FDBE11] hover:bg-[#FDBE11]/80 text-[#1E3A8A] font-bold px-6 py-3 rounded-lg shadow-md">
              <UserCircle className="mr-2 h-5 w-5" />
              {user ? "Ir a mi cuenta" : "Si eres socio, accede ya"}
            </Button>
          </Link>
        </div>
      </section>

      {/* About Hub Madridista */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">¿Qué es Hub Madridista?</h2>
          <div className="w-20 h-1 bg-[#FDBE11] mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Hub Madridista es la plataforma definitiva para los aficionados del Real Madrid, 
            ofreciendo una experiencia inmersiva y personalizada con todo el contenido relacionado 
            con el club más laureado del mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-[#FDBE11]/80 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Contenido Curado</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Accede a los mejores vídeos, noticias y actualizaciones del Real Madrid, seleccionados y categorizados automáticamente para ti.
            </p>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-[#FDBE11]/80 rounded-full flex items-center justify-center">
              <div className="flex items-center">
                <Tv className="w-7 h-7 text-white" />
                <Smartphone className="w-5 h-5 text-white ml-1" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Multiplataforma</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Contenido de YouTube, Twitter, TikTok y más, todo en un solo lugar para que nunca te pierdas nada importante.
            </p>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-[#FDBE11]/80 rounded-full flex items-center justify-center relative">
              <Bell className="w-8 h-8 text-white" />
              <Star className="w-4 h-4 text-white absolute top-2 right-2 animate-ping" />
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Notificaciones</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Mantente al día con alertas personalizadas sobre nuevos contenidos de tus canales y categorías favoritas.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="bg-[#1E3A8A] dark:bg-[#362C5A] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Beneficios Premium</h2>
            <div className="w-20 h-1 bg-[#FDBE11] mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              Desbloquea todo el potencial de Hub Madridista con nuestra suscripción premium
              y disfruta de ventajas exclusivas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#FDBE11]" />
              </div>
              <Star className="w-3 h-3 text-[#FDBE11] absolute top-4 right-4" />
              <Star className="w-3 h-3 text-[#FDBE11] absolute top-4 left-4" />
              <h3 className="text-xl font-semibold mb-2">Canales Exclusivos</h3>
              <p className="text-gray-200">
                Acceso a canales premium con contenido exclusivo y análisis en profundidad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-[#FDBE11]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sin Publicidad</h3>
              <p className="text-gray-200">
                Disfruta de una experiencia sin interrupciones publicitarias en toda la plataforma.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#FDBE11]" />
              </div>
              <History className="w-3 h-3 text-white/30 absolute top-4 right-6" />
              <History className="w-3 h-3 text-white/30 absolute top-6 right-10" />
              <h3 className="text-xl font-semibold mb-2">Archivo Histórico</h3>
              <p className="text-gray-200">
                Accede a nuestro archivo completo de momentos históricos del Real Madrid.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300 relative">
              <div className="w-14 h-14 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <LineChart className="w-6 h-6 text-[#FDBE11]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Análisis Avanzado</h3>
              <p className="text-gray-200">
                Estadísticas detalladas y análisis tácticos exclusivos de cada partido.
              </p>
            </div>
          </div>

          <div className="text-center">
            {user ? (
              user.role === 'premium' ? (
                <div className="bg-white/20 backdrop-blur inline-block px-6 py-3 rounded-lg">
                  <CheckCircle className="inline-block text-[#FDBE11] h-5 w-5 mr-2" />
                  <span className="font-medium">¡Ya disfrutas de los beneficios premium!</span>
                </div>
              ) : (
                <Link href="/profile">
                  <Button className="bg-[#FDBE11] hover:bg-[#FDBE11]/80 text-[#1E3A8A] font-medium text-lg px-8 py-3 rounded-lg">
                    Actualizar a Premium
                  </Button>
                </Link>
              )
            ) : (
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="bg-[#FDBE11] hover:bg-[#FDBE11]/80 text-[#1E3A8A] font-medium text-lg px-8 py-3 rounded-lg">
                    Registrarse
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur font-medium text-lg px-8 py-3 rounded-lg">
                    Iniciar Sesión
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Lo que dicen nuestros usuarios</h2>
          <div className="w-20 h-1 bg-[#FDBE11] mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Carlos+R&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Carlos Rodríguez</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuario Premium</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "Hub Madridista ha cambiado la forma en que sigo al Real Madrid. Toda la información en un solo lugar y categorizada perfectamente. ¡Increíble servicio!"
            </p>
            <div className="mt-4 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#FDBE11] mr-1" fill="#FDBE11" />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Laura+M&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Laura Martínez</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuario Premium</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "Las notificaciones personalizadas son geniales, nunca me pierdo contenido nuevo de mis canales favoritos. La suscripción premium es totalmente recomendable."
            </p>
            <div className="mt-4 flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#FDBE11] mr-1" fill="#FDBE11" />
              ))}
              <Star className="w-5 h-5 text-[#FDBE11] mr-1" fill="#FDBE11" strokeWidth={3} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                <img src="https://ui-avatars.com/api/?name=Miguel+S&background=random" alt="Avatar" />
              </div>
              <div>
                <h4 className="font-semibold dark:text-white">Miguel Sánchez</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usuario Free</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "Incluso la versión gratuita es excepcional. La interfaz es intuitiva y encuentro todo el contenido relevante rápidamente. Definitivamente voy a actualizar a Premium."
            </p>
            <div className="mt-4 flex">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#FDBE11] mr-1" fill="#FDBE11" />
              ))}
              <Star className="w-5 h-5 text-[#FDBE11]/30 mr-1" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#FDBE11]/10 dark:bg-[#FDBE11]/5 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
            Únete a la comunidad madridista
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Más de 50,000 aficionados ya disfrutan de la mejor experiencia 
            para seguir y disfrutar de todo el contenido relacionado con el 
            Real Madrid. ¡Sé parte de nuestra comunidad hoy mismo!
          </p>
          
          {!user ? (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-medium text-lg px-8 py-3 rounded-lg">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Registrarse Ahora
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/home">
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-medium text-lg px-8 py-3 rounded-lg">
                Explorar Contenido
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