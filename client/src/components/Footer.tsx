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
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-[#2A2040] dark:to-[#221A34] border-t border-gray-200 dark:border-gray-700 mt-auto pt-10 pb-6 w-full">
      <div className="w-full px-4 mx-auto">
        {/* Tres bloques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Bloque 1: Información y logo */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-[#2D2243] dark:to-[#251E36] shadow-sm space-y-4">
            <div className="flex items-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-[2px] bg-gradient-to-r from-yellow-100 to-purple-100 dark:from-yellow-900/20 dark:to-purple-900/30 opacity-70"></div>
                <img 
                  src="/images/logo-hubmadridista.png" 
                  alt={t('app.name') + ' Logo'} 
                  className="h-16 mr-2 relative z-10" 
                />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('footer.description')}
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
                <span className="text-sm">+34 667 976 076</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('footer.location')}</span>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://x.com/HubMadridistax" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#001C58] dark:hover:bg-[#FDBE11] hover:text-white dark:hover:text-gray-900 transform hover:scale-110 transition-all duration-200 shadow-sm"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://www.facebook.com/hubmadridista" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#001C58] dark:hover:bg-[#FDBE11] hover:text-white dark:hover:text-gray-900 transform hover:scale-110 transition-all duration-200 shadow-sm"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/hubmadridista" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#001C58] dark:hover:bg-[#FDBE11] hover:text-white dark:hover:text-gray-900 transform hover:scale-110 transition-all duration-200 shadow-sm"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.youtube.com/hubmadridista" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#001C58] dark:hover:bg-[#FDBE11] hover:text-white dark:hover:text-gray-900 transform hover:scale-110 transition-all duration-200 shadow-sm"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Bloque 2: Enlaces útiles */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-[#2D2243] dark:to-[#251E36] shadow-sm space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t('footer.usefulLinks')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm uppercase">{t('footer.navigation')}</h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('nav.home')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/tendencias" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('nav.trending')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/buscar" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.search')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/categorias" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('sidebar.categories')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/canales" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.channels')}
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm uppercase">{t('footer.information')}</h4>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/sobre-nosotros" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors text-sm">
                      {t('footer.aboutUs')}
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
          <div className="p-6 rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-[#2D2243] dark:to-[#251E36] shadow-sm space-y-4">
            <NewsletterSubscription />
          </div>
        </div>
        
        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
        
        {/* Copyright y créditos */}
        <div className="mt-8 py-5 px-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 dark:from-[#251E36] dark:to-[#2A2040] shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-[#1E3A8A] dark:text-[#4161AF] font-medium">{t('footer.rights')}</p>
            <p className="mt-2 md:mt-0 text-[#1E3A8A] dark:text-[#4161AF] font-medium">
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
