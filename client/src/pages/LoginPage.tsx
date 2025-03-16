import { useEffect } from 'react';
import { useLocation } from 'wouter';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useTokenHandler } from '@/hooks/useAuth';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  // Usar selectores específicos para optimizar
  const user = useAuth((state) => state.user);
  const token = useAuth((state) => state.token);
  const { handleTokenFromUrl } = useTokenHandler();
  
  // Verificar si hay un token en la URL (por ejemplo, después de login con Google/Apple)
  // Este useEffect solo se ejecuta una vez
  useEffect(() => {
    handleTokenFromUrl();
  }, []);
  
  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (user || token) {
      setLocation('/');
    }
  }, [user, token, setLocation]);

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-1/3 bg-white text-[#001C58] p-8 hidden lg:flex lg:flex-col border-r-2 border-[#FDBE11]">
        <div className="mb-8">
          <div className="relative mb-8 overflow-hidden rounded-lg shadow-md h-64 bg-[#001C58]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="w-28 h-28 text-[#FDBE11]" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#001C58] to-transparent p-4 text-center">
              <p className="text-white text-xl font-medium">{t('app.slogan')}</p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <img 
              src="/images/real-madrid-banner.png" 
              alt="Real Madrid" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">{t('auth.loginPage.benefits.title1')}</h3>
            <p className="text-[#001C58]">{t('auth.loginPage.benefits.desc1')}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">{t('auth.loginPage.benefits.title2')}</h3>
            <p className="text-[#001C58]">{t('auth.loginPage.benefits.desc2')}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-[#001C58]">{t('auth.loginPage.benefits.title3')}</h3>
            <p className="text-[#001C58]">{t('auth.loginPage.benefits.desc3')}</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-2/3 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-1">
              <span className="text-[#001C58]">{t('app.name').split(' ')[0]}</span>
              <span className="text-[#FDBE11]">{t('app.name').split(' ')[1] || ''}</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[#001C58] to-[#FDBE11] mx-auto mb-6"></div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}