import { Link } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import NewsletterSubscription from './NewsletterSubscription';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-[#2A2040] border-t border-gray-200 dark:border-gray-700 mt-auto pt-10 pb-6">
      <div className="container mx-auto px-4">
        {/* Tres bloques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Bloque 1: Información y logo */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <img 
                src="/images/hub-madridista-logo-new.jpg" 
                alt="Hub Madridista Logo" 
                className="h-12 mr-2" 
              />
              <span className="font-bold text-xl">
                <span className="text-[#362C5A] dark:text-[#9D8FDD]">Hub</span>
                <span className="text-[#FFD700] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">Madridista</span>
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Tu plataforma definitiva para todo el contenido relacionado con el Real Madrid. 
              Vídeos, noticias y actualizaciones de tu equipo favorito.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:contacto@hubmadridista.com" className="text-sm hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors">
                  contacto@hubmadridista.com
                </a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+34 123 456 789</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Madrid, España</span>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <a href="https://twitter.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Bloque 2: Enlaces útiles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Enlaces útiles</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm uppercase">Navegación</h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link href="/tendencias" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Tendencias
                    </Link>
                  </li>
                  <li>
                    <Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Buscar
                    </Link>
                  </li>
                  <li>
                    <Link href="/categorias" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Categorías
                    </Link>
                  </li>
                  <li>
                    <Link href="/canales" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Canales
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm uppercase">Información</h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/sobre-nosotros" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      Sobre Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.terms')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.privacy')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.cookies')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.contact')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bloque 3: Newsletter */}
          <div className="space-y-4">
            <NewsletterSubscription />
          </div>
        </div>
        
        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
        
        {/* Copyright y créditos */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Hub Madridista. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0">
            No estamos afiliados oficialmente con el Real Madrid C.F.
          </p>
        </div>
      </div>
    </footer>
  );
}
