import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Channel } from "@shared/schema";

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();

  // Fetch recommended channels for sidebar
  const { data: featuredChannels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['/api/channels/recommended', { limit: 3 }],
  });

  // Helper function to determine if a link is active
  const isLinkActive = (path: string): boolean => {
    return location === path;
  };

  // Sidebar base classes
  const sidebarClasses = cn(
    "bg-white w-64 flex-shrink-0 shadow-lg z-30 transition-all duration-300 ease-in-out overflow-y-auto h-[calc(100vh-4rem)] border-r-2 border-[#FDBE11]",
    "md:block", // Always show on desktop
    isOpen 
      ? "fixed inset-0 w-full md:w-64 z-50" // Open state on mobile
      : "hidden", // Closed state on mobile
  );

  return (
    <aside className={sidebarClasses}>
      <nav className="py-4">
        {/* Explore Section */}
        <div className="px-4 pb-4 border-b border-[#FDBE11]/50">
          <h3 className="font-semibold text-[#001C58] uppercase text-xs tracking-wide">Explorar</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}>
                  <i className={cn(
                    "fas fa-home mr-3",
                    isLinkActive("/") ? "text-[#FDBE11]" : "text-gray-500"
                  )}></i>
                  Inicio
              </Link>
            </li>
            <li>
              <Link href="/trending" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/trending") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}>
                <i className={cn(
                  "fas fa-fire mr-3",
                  isLinkActive("/trending") ? "text-[#FDBE11]" : "text-gray-500"
                )}></i>
                Tendencias
              </Link>
            </li>
            <li>
              <Link href="/favorites" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/favorites") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}>
                  <i className={cn(
                    "fas fa-star mr-3",
                    isLinkActive("/favorites") ? "text-[#FDBE11]" : "text-gray-500"
                  )}></i>
                  Mis Favoritos
              </Link>
            </li>
            <li>
              <Link href="/subscriptions" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/subscriptions") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}>
                  <i className={cn(
                    "fas fa-rss mr-3",
                    isLinkActive("/subscriptions") ? "text-[#FDBE11]" : "text-gray-500"
                  )}></i>
                  Mis canales
              </Link>
            </li>
            <li>
              <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]">
                <i className="fas fa-history mr-3 text-gray-500"></i>
                Historial
              </a>
            </li>
          </ul>
        </div>
        
        {/* Platforms Section */}
        <div className="px-4 py-4 border-b border-[#FDBE11]/50">
          <h3 className="font-semibold text-[#001C58] uppercase text-xs tracking-wide">Plataformas</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link 
                href="/?platform=youtube" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=youtube" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className="fab fa-youtube mr-3 text-red-500"></i>
                YouTube
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=tiktok" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=tiktok" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className="fab fa-tiktok mr-3 text-black"></i>
                TikTok
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 text-amber-600 rounded border border-amber-200">Próximamente</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=twitter" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=twitter" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className="fab fa-twitter mr-3 text-blue-400"></i>
                Twitter
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 text-amber-600 rounded border border-amber-200">Próximamente</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=instagram" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=instagram" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className="fab fa-instagram mr-3 text-pink-500"></i>
                Instagram
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 text-amber-600 rounded border border-amber-200">Próximamente</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Categories Section */}
        <div className="px-4 py-4 border-b border-[#FDBE11]/50">
          <h3 className="font-semibold text-[#001C58] uppercase text-xs tracking-wide">Categorías</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link 
                href="/category/matches" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/matches") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className={cn(
                  "fas fa-futbol mr-3",
                  isLinkActive("/category/matches") ? "text-[#FDBE11]" : "text-[#FDBE11]"
                )}></i>
                Partidos
              </Link>
            </li>
            <li>
              <Link 
                href="/category/analysis" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/analysis") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className={cn(
                  "fas fa-comments mr-3",
                  isLinkActive("/category/analysis") ? "text-[#FDBE11]" : "text-gray-500"
                )}></i>
                Análisis
              </Link>
            </li>
            <li>
              <Link 
                href="/category/historic" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/historic") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className={cn(
                  "fas fa-trophy mr-3",
                  isLinkActive("/category/historic") ? "text-[#FDBE11]" : "text-[#FDBE11]"
                )}></i>
                Momentos Históricos
              </Link>
            </li>
            <li>
              <Link 
                href="/category/players" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/players") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className={cn(
                  "fas fa-user mr-3",
                  isLinkActive("/category/players") ? "text-[#FDBE11]" : "text-gray-500"
                )}></i>
                Jugadores
              </Link>
            </li>
            <li>
              <Link 
                href="/category/press" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/press") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 hover:bg-[#FDBE11]/5 hover:text-[#001C58]"
                )}
              >
                <i className={cn(
                  "fas fa-newspaper mr-3",
                  isLinkActive("/category/press") ? "text-[#FDBE11]" : "text-gray-500"
                )}></i>
                Noticias
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Featured Channels Section */}
        <div className="px-4 py-4">
          <h3 className="font-semibold text-[#001C58] uppercase text-xs tracking-wide">Canales Destacados</h3>
          
          {isLoading ? (
            // Loading skeleton for featured channels
            <>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center mt-3 p-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="ml-2">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </>
          ) : featuredChannels && featuredChannels.length > 0 ? (
            // Render actual featured channels
            featuredChannels.map((channel: Channel) => (
              <Link 
                key={channel.id} 
                href={`/channel/${channel.id}`}
                className="flex items-center mt-3 hover:bg-[#FDBE11]/10 rounded-md p-2 cursor-pointer"
              >
                <img 
                  src={channel.thumbnailUrl || 'https://via.placeholder.com/32'} 
                  alt={channel.title} 
                  className="w-8 h-8 rounded-full border border-[#FDBE11]" 
                />
                <div className="ml-2">
                  <p className="text-sm font-medium text-[#001C58]">{channel.title}</p>
                  <p className="text-xs text-gray-500">
                    {channel.platform === 'YouTube' && 'Canal de YouTube'}
                    {channel.platform === 'TikTok' && 'Canal de TikTok'}
                    {channel.platform === 'Twitter' && 'Cuenta de Twitter'}
                    {channel.platform === 'Instagram' && 'Cuenta de Instagram'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            // No channels available
            <p className="text-sm text-[#001C58]/70 mt-3 text-center">
              No hay canales destacados disponibles
            </p>
          )}
        </div>
      </nav>
    </aside>
  );
}
