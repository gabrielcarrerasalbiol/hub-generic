import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const { user } = useAuth();
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usamos imágenes disponibles en el proyecto
    setCarouselImages([
      "/images/real-madrid-stadium.jpg",
      "/images/RealMadridTracker-Replit.png",
      "/images/RealMadridTracker-Replit(1).png",
      "/images/RealMadridTracker-Replit(2).png",
    ]);
    setLoading(false);
  }, []);

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] overflow-y-auto">
      {/* Hero Banner */}
      <section className="relative w-full h-[500px] overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Cargando imágenes...</p>
          </div>
        ) : (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="w-full h-[500px]">
                  <div 
                    className="w-full h-full bg-cover bg-center relative" 
                    style={{ backgroundImage: `url(${image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white max-w-2xl">
                      <h1 className="text-4xl md:text-5xl font-bold mb-3">Hub Madridista</h1>
                      <p className="text-xl md:text-2xl">Tu portal exclusivo al universo del Real Madrid</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        )}
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
              <i className="fas fa-video text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Contenido Curado</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Accede a los mejores vídeos, noticias y actualizaciones del Real Madrid, seleccionados y categorizados automáticamente para ti.
            </p>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-[#FDBE11]/80 rounded-full flex items-center justify-center">
              <i className="fas fa-globe text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Multiplataforma</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Contenido de YouTube, Twitter, TikTok y más, todo en un solo lugar para que nunca te pierdas nada importante.
            </p>
          </div>

          <div className="bg-white dark:bg-[#3E355F] rounded-xl shadow-md p-6 text-center hover:shadow-lg transition duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A8A] dark:bg-[#FDBE11]/80 rounded-full flex items-center justify-center">
              <i className="fas fa-bell text-white text-2xl"></i>
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
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300">
              <i className="fas fa-crown text-[#FDBE11] text-3xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Canales Exclusivos</h3>
              <p className="text-gray-200">
                Acceso a canales premium con contenido exclusivo y análisis en profundidad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300">
              <i className="fas fa-ad text-[#FDBE11] text-3xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Sin Publicidad</h3>
              <p className="text-gray-200">
                Disfruta de una experiencia sin interrupciones publicitarias en toda la plataforma.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300">
              <i className="fas fa-history text-[#FDBE11] text-3xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Archivo Histórico</h3>
              <p className="text-gray-200">
                Accede a nuestro archivo completo de momentos históricos del Real Madrid.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition duration-300">
              <i className="fas fa-chart-line text-[#FDBE11] text-3xl mb-4"></i>
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
                  <i className="fas fa-check-circle text-[#FDBE11] mr-2"></i>
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
            <div className="mt-4 text-[#FDBE11]">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
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
            <div className="mt-4 text-[#FDBE11]">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
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
            <div className="mt-4 text-[#FDBE11]">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="far fa-star"></i>
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
          
          {!user && (
            <div className="space-x-4">
              <Link href="/register">
                <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white font-medium text-lg px-8 py-3 rounded-lg">
                  Registrarse Ahora
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="bg-transparent border-[#1E3A8A] text-[#1E3A8A] dark:border-white dark:text-white hover:bg-[#1E3A8A]/10 font-medium text-lg px-8 py-3 rounded-lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}