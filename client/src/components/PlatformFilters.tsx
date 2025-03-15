import { Button } from "@/components/ui/button";
import { PlatformType } from "@shared/schema";
import { Layers, Youtube, Twitter, Instagram } from 'lucide-react';
import { TikTokIcon } from './icons/TikTokIcon';
import { TwitchIcon } from './icons/TwitchIcon';

interface PlatformFiltersProps {
  selectedPlatform: PlatformType;
  onSelectPlatform: (platform: PlatformType) => void;
}

export default function PlatformFilters({ selectedPlatform, onSelectPlatform }: PlatformFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedPlatform === "all" ? "default" : "outline"}
        className={selectedPlatform === "all" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("all")}
      >
        <Layers className="h-4 w-4 mr-2 text-[#FDBE11]" /> Todas
      </Button>
      
      <Button
        variant={selectedPlatform === "youtube" ? "default" : "outline"}
        className={selectedPlatform === "youtube" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("youtube")}
      >
        <Youtube className="h-4 w-4 mr-2 text-red-500" /> YouTube
      </Button>
      
      <Button
        variant={selectedPlatform === "tiktok" ? "default" : "outline"}
        className={selectedPlatform === "tiktok" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("tiktok")}
      >
        <TikTokIcon className="h-4 w-4 mr-2" /> TikTok
      </Button>
      
      <Button
        variant={selectedPlatform === "twitter" ? "default" : "outline"}
        className={selectedPlatform === "twitter" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("twitter")}
      >
        <Twitter className="h-4 w-4 mr-2 text-blue-400" /> Twitter
      </Button>
      
      <Button
        variant={selectedPlatform === "instagram" ? "default" : "outline"}
        className={selectedPlatform === "instagram" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("instagram")}
      >
        <Instagram className="h-4 w-4 mr-2 text-pink-500" /> Instagram
      </Button>
      
      <Button
        variant={selectedPlatform === "twitch" ? "default" : "outline"}
        className={selectedPlatform === "twitch" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectPlatform("twitch")}
      >
        <TwitchIcon className="h-4 w-4 mr-2 text-purple-500" /> Twitch
      </Button>
    </div>
  );
}
