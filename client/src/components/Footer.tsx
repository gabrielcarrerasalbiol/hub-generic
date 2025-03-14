import { Link } from 'wouter';
import { useLanguage } from '@/hooks/use-language';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-[#2A2040] border-t border-gray-200 dark:border-gray-700 mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/images/hub-madridista-logo-new.jpg" 
              alt="Hub Madridista Logo" 
              className="h-10 mr-2" 
            />
            <span className="text-gray-700 dark:text-gray-200 font-bold text-lg">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/sobre-nosotros" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              Sobre Nosotros
            </Link>
            <Link href="/terminos" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              {t('footer.terms')}
            </Link>
            <Link href="/privacidad" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              {t('footer.privacy')}
            </Link>
            <Link href="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              {t('footer.cookies')}
            </Link>
            <Link href="/contacto" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              {t('footer.contact')}
            </Link>
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://twitter.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://facebook.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/realmadrid" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#001C58] dark:hover:text-[#FDBE11] transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10a2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
