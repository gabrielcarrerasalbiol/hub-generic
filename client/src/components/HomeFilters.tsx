import React from 'react';
import { Button } from "@/components/ui/button";
import { Layers, Instagram, Twitter } from "lucide-react";
import { Youtube } from "lucide-react";
import TikTokIcon from "./icons/TikTokIcon";
import TwitchIcon from "./icons/TwitchIcon";
import CategoryFilters from "./CategoryFilters";
import { PlatformType, CategoryType } from '@shared/schema';
import { useTranslation } from 'react-i18next';

// Props para el componente
interface HomeFiltersProps {
  platform: PlatformType;
  setPlatform: (platform: PlatformType) => void;
  category: CategoryType;
  setCategory: (category: CategoryType) => void;
  onFilterChange: () => void;
}

/**
 * Componente unificado de filtros para la página de inicio
 * Combina los filtros de plataforma y categoría
 */
export default function HomeFilters({
  platform,
  setPlatform,
  category,
  setCategory,
  onFilterChange
}: HomeFiltersProps) {
  const { t } = useTranslation();

  // Manejadores de eventos unificados
  const handlePlatformChange = (newPlatform: PlatformType) => {
    setPlatform(newPlatform);
    // Recargar inmediatamente
    onFilterChange();
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory as CategoryType);
    // Recargar inmediatamente
    onFilterChange();
  };

  return (
    <>
      {/* Filtros de plataforma */}
      <div className="mb-6 flex justify-center border-b border-[#FDBE11]/20 pb-4">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 max-w-3xl">
          <Button
            variant={platform === "all" ? "default" : "ghost"}
            className={`${platform === "all" 
              ? "bg-[#001C58] text-white border-[#FDBE11]" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("all" as PlatformType)}
          >
            <Layers className="h-4 w-4 mr-2" /> {t('home.all')}
          </Button>
          
          <Button
            variant={platform === "youtube" ? "default" : "ghost"}
            className={`${platform === "youtube" 
              ? "bg-red-600 text-white hover:bg-red-700" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("youtube" as PlatformType)}
          >
            <Youtube className="h-4 w-4 mr-2" /> YouTube
          </Button>
          
          <Button
            variant={platform === "twitch" ? "default" : "ghost"}
            className={`${platform === "twitch" 
              ? "bg-purple-600 text-white hover:bg-purple-700" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("twitch" as PlatformType)}
          >
            <TwitchIcon className="h-4 w-4 mr-2" /> Twitch
          </Button>
          
          <Button
            variant={platform === "twitter" ? "default" : "ghost"}
            className={`${platform === "twitter" 
              ? "bg-blue-500 text-white hover:bg-blue-600" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("twitter" as PlatformType)}
            disabled={true}
          >
            <Twitter className="h-4 w-4 mr-2" /> Twitter
          </Button>
          
          <Button
            variant={platform === "instagram" ? "default" : "ghost"}
            className={`${platform === "instagram" 
              ? "bg-pink-500 text-white hover:bg-pink-600" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("instagram" as PlatformType)}
            disabled={true}
          >
            <Instagram className="h-4 w-4 mr-2" /> Instagram
          </Button>
          
          <Button
            variant={platform === "tiktok" ? "default" : "ghost"}
            className={`${platform === "tiktok" 
              ? "bg-black text-white hover:bg-gray-900" 
              : "text-[#001C58] hover:bg-[#FDBE11]/10"}`}
            onClick={() => handlePlatformChange("tiktok" as PlatformType)}
            disabled={true}
          >
            <TikTokIcon className="h-4 w-4 mr-2" /> TikTok
          </Button>
        </div>
      </div>
            
      {/* Filtros de categoría para móvil */}
      <div className="block md:hidden mb-6">
        <h3 className="text-sm font-medium mb-2 text-[#001C58]">{t('home.filterByCategory')}</h3>
        <CategoryFilters 
          selectedCategory={category} 
          onSelectCategory={handleCategoryChange} 
        />
      </div>
      
      {/* Filtros de categoría para desktop */}
      <div className="hidden md:block mt-6 mb-4">
        <h3 className="text-sm font-medium mb-3 text-[#001C58] border-l-4 border-[#FDBE11] pl-3">{t('home.filterByCategory')}</h3>
        <div className="flex flex-wrap gap-2">
          <CategoryFilters 
            selectedCategory={category} 
            onSelectCategory={handleCategoryChange} 
          />
        </div>
      </div>
    </>
  );
}