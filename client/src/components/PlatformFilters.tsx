import { Button } from "@/components/ui/button";
import { PlatformType } from "@shared/schema";

interface PlatformFiltersProps {
  selectedPlatform: PlatformType;
  onSelectPlatform: (platform: PlatformType) => void;
}

export default function PlatformFilters({ selectedPlatform, onSelectPlatform }: PlatformFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedPlatform === "all" ? "default" : "outline"}
        className={selectedPlatform === "all" ? "bg-[#1E3A8A] text-white" : "bg-white text-gray-800"}
        onClick={() => onSelectPlatform("all")}
      >
        Todos
      </Button>
      
      <Button
        variant={selectedPlatform === "youtube" ? "default" : "outline"}
        className={selectedPlatform === "youtube" 
          ? "bg-[#1E3A8A] text-white" 
          : "bg-white hover:bg-gray-100 text-gray-800"}
        onClick={() => onSelectPlatform("youtube")}
      >
        <i className="fab fa-youtube mr-2 text-red-500"></i> YouTube
      </Button>
      
      <Button
        variant={selectedPlatform === "tiktok" ? "default" : "outline"}
        className={selectedPlatform === "tiktok" 
          ? "bg-[#1E3A8A] text-white" 
          : "bg-white hover:bg-gray-100 text-gray-800"}
        onClick={() => onSelectPlatform("tiktok")}
      >
        <i className="fab fa-tiktok mr-2"></i> TikTok
      </Button>
      
      <Button
        variant={selectedPlatform === "twitter" ? "default" : "outline"}
        className={selectedPlatform === "twitter" 
          ? "bg-[#1E3A8A] text-white" 
          : "bg-white hover:bg-gray-100 text-gray-800"}
        onClick={() => onSelectPlatform("twitter")}
      >
        <i className="fab fa-twitter mr-2 text-blue-400"></i> Twitter
      </Button>
      
      <Button
        variant={selectedPlatform === "instagram" ? "default" : "outline"}
        className={selectedPlatform === "instagram" 
          ? "bg-[#1E3A8A] text-white" 
          : "bg-white hover:bg-gray-100 text-gray-800"}
        onClick={() => onSelectPlatform("instagram")}
      >
        <i className="fab fa-instagram mr-2 text-pink-500"></i> Instagram
      </Button>
    </div>
  );
}
