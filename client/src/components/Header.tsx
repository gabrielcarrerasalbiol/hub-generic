import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png" 
                alt="Real Madrid Logo" 
                className="h-10 w-10" 
              />
              <h1 className="text-xl font-bold text-[#1E3A8A]">
                RealMadrid<span className="text-[#FEF08A]">Hub</span>
              </h1>
            </a>
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
            <button className="text-gray-700 hover:text-[#1E3A8A]">
              <i className="fas fa-bell text-xl"></i>
            </button>
            <div className="relative group">
              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                  <i className="fas fa-user"></i>
                </div>
                <span className="hidden md:inline font-medium">Usuario</span>
                <i className="fas fa-chevron-down text-sm"></i>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mi perfil</a>
                <Link href="/favorites">
                  <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Mis favoritos</a>
                </Link>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Configuración</a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Cerrar sesión</a>
              </div>
            </div>
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
