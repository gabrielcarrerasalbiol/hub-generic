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

  const handleCategoryChange = (newCategory: CategoryType) => {
    setCategory(newCategory);
    // Recargar inmediatamente
    onFilterChange();
  };

  return (
    <>
      {/* Filtros de plataforma */}
      <div className="mb-6 flex justify-center border-b border-brand-secondary/20 pb-4">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 max-w-3xl">
          <Button
            variant={platform === "all" ? "default" : "ghost"}
            className={`${platform === "all" 
              ? "bg-brand-primary text-white border-brand-secondary" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("all" as PlatformType)}
          >
            <Layers className="h-4 w-4 mr-2" /> {t('home.all')}
          </Button>
          
          <Button
            variant={platform === "youtube" ? "default" : "ghost"}
            className={`${platform === "youtube" 
              ? "bg-red-600 text-white hover:bg-red-700" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("youtube" as PlatformType)}
          >
            <Youtube className="h-4 w-4 mr-2" /> YouTube
          </Button>
          
          <Button
            variant={platform === "twitch" ? "default" : "ghost"}
            className={`${platform === "twitch" 
              ? "bg-purple-600 text-white hover:bg-purple-700" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("twitch" as PlatformType)}
          >
            <TwitchIcon className="h-4 w-4 mr-2" /> Twitch
          </Button>
          
          <Button
            variant={platform === "twitter" ? "default" : "ghost"}
            className={`${platform === "twitter" 
              ? "bg-blue-500 text-white hover:bg-blue-600" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("twitter" as PlatformType)}
            disabled={true}
          >
            <Twitter className="h-4 w-4 mr-2" /> Twitter
          </Button>
          
          <Button
            variant={platform === "instagram" ? "default" : "ghost"}
            className={`${platform === "instagram" 
              ? "bg-pink-500 text-white hover:bg-pink-600" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("instagram" as PlatformType)}
            disabled={true}
          >
            <Instagram className="h-4 w-4 mr-2" /> Instagram
          </Button>
          
          <Button
            variant={platform === "tiktok" ? "default" : "ghost"}
            className={`${platform === "tiktok" 
              ? "bg-black text-white hover:bg-gray-900" 
              : "text-brand-primary hover:bg-brand-secondary/10"}`}
            onClick={() => handlePlatformChange("tiktok" as PlatformType)}
            disabled={true}
          >
            <TikTokIcon className="h-4 w-4 mr-2" /> TikTok
          </Button>
        </div>
      </div>
            
      {/* Filtros de categoría para móvil */}
      <div className="block md:hidden mb-6">
        <h3 className="text-sm font-medium mb-2 text-brand-primary">{t('home.filterByCategory')}</h3>
        <CategoryFilters 
          selectedCategory={category} 
          onSelectCategory={handleCategoryChange} 
        />
      </div>
      
      {/* Filtros de categoría para desktop */}
      <div className="hidden md:block mt-6 mb-4">
        <h3 className="text-sm font-medium mb-3 text-brand-primary border-l-4 border-brand-secondary pl-3">{t('home.filterByCategory')}</h3>
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