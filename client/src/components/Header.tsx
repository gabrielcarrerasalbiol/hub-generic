import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
        description: "Por favor, ingresa un término de búsqueda",
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
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="Hub Madridista Logo" 
                className="h-12" 
              />
              <h1 className="text-xl font-bold text-[#1E3A8A]">
                Hub<span className="text-[#FFD700] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">Madridista</span>
              </h1>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-10">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="text"
                placeholder="Buscar canales, videos o contenido..."
                className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:ring-[#1E3A8A]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
              >
                <i className="fas fa-search"></i>
              </Button>
            </form>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="text-gray-700 hover:text-[#1E3A8A]">
                  <i className="fas fa-bell text-xl"></i>
                </button>
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
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <span className="hidden md:inline font-medium">
                        {user?.name || user?.username || 'Usuario'}
                      </span>
                      <i className="fas fa-chevron-down text-sm"></i>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">Mi perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="w-full cursor-pointer">Mis favoritos</Link>
                    </DropdownMenuItem>
                    {userIsAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full cursor-pointer">
                            <span className="flex items-center text-red-600">
                              <i className="fas fa-shield-alt mr-2"></i>
                              Panel de Admin
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Buscar..."
              className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:ring-[#1E3A8A]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1E3A8A]"
            >
              <i className="fas fa-search"></i>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
