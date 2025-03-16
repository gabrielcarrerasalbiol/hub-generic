import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Youtube, 
  Twitter, 
  Disc, 
  PieChart,
  Film
} from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import TwitchIcon from "@/components/icons/TwitchIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface PlatformFiltersProps {
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export default function PlatformFilters({ selectedPlatform, onSelectPlatform }: PlatformFiltersProps) {
  const platforms = [
    { id: "all", name: "Todas", icon: <PieChart className="h-4 w-4" /> },
    { id: "youtube", name: "YouTube", icon: <Youtube className="h-4 w-4 text-red-500" /> },
    { id: "twitch", name: "Twitch", icon: <TwitchIcon className="h-4 w-4 text-purple-500" /> },
    { id: "tiktok", name: "TikTok", icon: <TikTokIcon className="h-4 w-4" /> },
    { id: "twitter", name: "Twitter", icon: <Twitter className="h-4 w-4 text-blue-400" /> },
    { id: "instagram", name: "Instagram", icon: <InstagramIcon className="h-4 w-4 text-pink-500" /> },
  ];

  return (
    <>
      {platforms.map((platform) => (
        <Button
          key={platform.id}
          variant={selectedPlatform === platform.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-1 border-slate-300",
            selectedPlatform === platform.id
              ? "bg-[#001C58] text-white hover:bg-[#001C58]/90"
              : "hover:bg-slate-100"
          )}
          onClick={() => onSelectPlatform(platform.id)}
        >
          {platform.icon}
          {platform.name}
        </Button>
      ))}
    </>
  );
}