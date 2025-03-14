import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, resetAuthStorage } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';
import { useLanguage } from '@/hooks/use-language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  User, 
  ChevronDown, 
  Shield,
  Heart,
  LogOut,
  Settings,
  Bell,
  Rss,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Optimización: usar selectores específicos para evitar re-renders innecesarios
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const token = useAuth((state) => state.token);
  
  // Calcular estos valores a partir del estado actual
  const isAuthenticated = !!token;
  const userIsAdmin = user?.role === 'admin';

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        description: t('general.search'),
      });
      return;
    }
    
    // Navigate to search results
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    toast({
      title: t('toast.success'),
      description: t('nav.logout'),
    });
    navigate('/');
  };
  
  // Reiniciar almacenamiento de autenticación (para errores de token)
  const handleResetAuth = () => {
    toast({
      title: t('toast.info'),
      description: t('toast.info'),
    });
    resetAuthStorage();
  };

  return (
    <header className="bg-white dark:bg-[#2A2040] dark:text-white shadow-md sticky top-0 z-50 border-b-4 border-[#FDBE11]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/images/hub-madridista-logo-new.jpg" 
                alt="Hub Madridista Logo" 
                className="h-14" 
              />
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-10">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="text"
                placeholder={t('general.search')}
                className="w-full py-2 px-4 pr-10 rounded-full border border-[#FDBE11] focus:ring-[#001C58] focus:border-[#001C58]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#001C58]"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                        {user?.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name || user.username} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <span className="hidden md:inline font-medium">
                        {user?.name || user?.username || 'Usuario'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {t('nav.profile')}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="w-full cursor-pointer">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-red-500" />
                          {t('nav.favorites')}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscriptions" className="w-full cursor-pointer">
                        <span className="flex items-center">
                          <Rss className="h-4 w-4 mr-2 text-orange-500" />
                          {t('nav.subscriptions')}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="w-full cursor-pointer">
                        <span className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-blue-500" />
                          Notificaciones
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        <span className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-gray-500" />
                          Ajustes
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    {userIsAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full cursor-pointer">
                            <span className="flex items-center text-red-600">
                              <Shield className="h-4 w-4 mr-2" />
                              Panel de Admin
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" className="text-[#001C58] dark:text-white hover:text-[#001C58]/80 dark:hover:text-white/80 hover:bg-[#FDBE11]/10">
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#FDBE11] to-[#FFC72C] text-[#001C58] hover:from-[#FDC731] hover:to-[#FFD74C] border-none">
                  <Link href="/register">{t('nav.register')}</Link>
                </Button>
              </div>
            )}
            
            {/* Botón de reinicio solo para usuarios administradores */}
            {userIsAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                onClick={handleResetAuth}
                title="Reiniciar autenticación si hay problemas con la sesión"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Reiniciar sesión</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Buscar..."
              className="w-full py-2 px-4 pr-10 rounded-full border border-[#FDBE11] focus:ring-[#001C58] focus:border-[#001C58]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#001C58]"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
