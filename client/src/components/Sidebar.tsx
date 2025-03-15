import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Channel } from "@shared/schema";
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, TrendingUp, Star, Rss, History, 
  Youtube, Twitter, Instagram, 
  Radio, MessageSquare, Trophy, User, Newspaper,
  Crown, Shield
} from "lucide-react";
import { TikTokIcon } from "./icons/TikTokIcon";

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const isPremium = useAuth(state => state.isPremium());
  const isAuthenticated = useAuth(state => state.checkAuth());

  // Fetch recommended channels for sidebar
  const { data: featuredChannels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['/api/channels/recommended', { limit: 3 }],
  });
  
  // Fetch premium channels for premium users
  const { data: premiumChannels = [], isLoading: isPremiumLoading } = useQuery<Channel[]>({
    queryKey: ['/api/premium-channels/list'],
    enabled: isPremium && isAuthenticated
  });

  // Helper function to determine if a link is active
  const isLinkActive = (path: string): boolean => {
    return location === path;
  };

  // Sidebar base classes
  const sidebarClasses = cn(
    "bg-white dark:bg-[#362C5A] dark:text-white w-64 flex-shrink-0 shadow-lg z-30 transition-all duration-300 ease-in-out overflow-y-auto border-r-2 border-[#FDBE11]",
    "md:block", // Always show on desktop
    isOpen 
      ? "fixed inset-0 w-full md:w-64 z-50 h-full" // Open state on mobile
      : "hidden", // Closed state on mobile
    "md:sticky md:top-16 md:h-[calc(100vh-4rem)]" // Sticky on desktop
  );

  return (
    <aside className={sidebarClasses}>
      <nav className="py-4">
        {/* Explore Section */}
        <div className="px-4 pb-4 border-b border-[#FDBE11]/50 dark:border-[#FDBE11]/25">
          <h3 className="font-semibold text-[#001C58] dark:text-[#FDBE11] uppercase text-xs tracking-wide">{t('sidebar.explore')}</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}>
                  <Home className={cn(
                    "mr-3 h-4 w-4",
                    isLinkActive("/") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                  )} />
                  {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href="/trending" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/trending") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}>
                <TrendingUp className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/trending") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                )} />
                {t('nav.trending')}
              </Link>
            </li>
            <li>
              <Link href="/favorites" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/favorites") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}>
                  <Star className={cn(
                    "mr-3 h-4 w-4",
                    isLinkActive("/favorites") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                  )} />
                  {t('nav.favorites')}
              </Link>
            </li>
            <li>
              <Link href="/subscriptions" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/subscriptions") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}>
                  <Rss className={cn(
                    "mr-3 h-4 w-4",
                    isLinkActive("/subscriptions") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                  )} />
                  Mis canales
              </Link>
            </li>
            <li>
              <Link 
                href="/history" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/history") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <History className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/history") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                )} />
                {t('sidebar.history')}
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Platforms Section */}
        <div className="px-4 py-4 border-b border-[#FDBE11]/50 dark:border-[#FDBE11]/25">
          <h3 className="font-semibold text-[#001C58] dark:text-[#FDBE11] uppercase text-xs tracking-wide">{t('sidebar.platforms')}</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link 
                href="/?platform=youtube" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=youtube" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Youtube className="mr-3 h-4 w-4 text-red-500" />
                YouTube
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=tiktok" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=tiktok" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <TikTokIcon className="mr-3 h-4 w-4 text-black dark:text-white" />
                TikTok
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700">Próximamente</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=twitter" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=twitter" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Twitter className="mr-3 h-4 w-4 text-blue-400" />
                Twitter
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700">Próximamente</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/?platform=instagram" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === "/?platform=instagram" 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Instagram className="mr-3 h-4 w-4 text-pink-500" />
                Instagram
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700">Próximamente</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Categories Section */}
        <div className="px-4 py-4 border-b border-[#FDBE11]/50 dark:border-[#FDBE11]/25">
          <h3 className="font-semibold text-[#001C58] dark:text-[#FDBE11] uppercase text-xs tracking-wide">{t('sidebar.categories')}</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <Link 
                href="/category/matches" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/matches") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Radio className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/category/matches") ? "text-[#FDBE11]" : "text-[#FDBE11]"
                )} />
                Partidos
              </Link>
            </li>
            <li>
              <Link 
                href="/category/analysis" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/analysis") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <MessageSquare className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/category/analysis") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                )} />
                Análisis
              </Link>
            </li>
            <li>
              <Link 
                href="/category/historic" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/historic") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Trophy className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/category/historic") ? "text-[#FDBE11]" : "text-[#FDBE11]"
                )} />
                Momentos Históricos
              </Link>
            </li>
            <li>
              <Link 
                href="/category/players" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/players") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <User className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/category/players") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                )} />
                Jugadores
              </Link>
            </li>
            <li>
              <Link 
                href="/category/press" 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isLinkActive("/category/press") 
                    ? "bg-[#FDBE11]/10 text-[#001C58] dark:text-[#FDBE11] border-l-4 border-[#FDBE11]" 
                    : "text-gray-700 dark:text-white hover:bg-[#FDBE11]/5 hover:text-[#001C58] dark:hover:text-[#FDBE11]"
                )}
              >
                <Newspaper className={cn(
                  "mr-3 h-4 w-4",
                  isLinkActive("/category/press") ? "text-[#FDBE11]" : "text-gray-500 dark:text-[#FDBE11]/70"
                )} />
                Noticias
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Featured Channels Section */}
        <div className="px-4 py-4 border-b border-[#FDBE11]/50 dark:border-[#FDBE11]/25">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#001C58] dark:text-[#FDBE11] uppercase text-xs tracking-wide">{t('sidebar.featured')}</h3>
            <Link 
              href="/featured-channels"
              className="text-xs text-[#001C58] dark:text-[#FDBE11] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          
          {isLoading ? (
            // Loading skeleton for featured channels
            <>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center mt-3 p-2">
                  <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-700" />
                  <div className="ml-2">
                    <Skeleton className="h-4 w-24 mb-1 dark:bg-gray-700" />
                    <Skeleton className="h-3 w-16 dark:bg-gray-700" />
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
                className="flex items-center mt-3 hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20 rounded-md p-2 cursor-pointer"
              >
                <img 
                  src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=32`} 
                  alt={channel.title} 
                  className="w-8 h-8 rounded-full border border-[#FDBE11]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=32`;
                  }}
                />
                <div className="ml-2">
                  <p className="text-sm font-medium text-[#001C58] dark:text-white">{channel.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {channel.platform === 'YouTube' && t('sidebar.youtube_channel')}
                    {channel.platform === 'TikTok' && t('sidebar.tiktok_channel')}
                    {channel.platform === 'Twitter' && t('sidebar.twitter_account')}
                    {channel.platform === 'Instagram' && t('sidebar.instagram_account')}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            // No channels available
            <p className="text-sm text-[#001C58]/70 dark:text-gray-400 mt-3 text-center">
              {t('sidebar.no_featured')}
            </p>
          )}
        </div>
        
        {/* Premium Channels Section - Only for premium users */}
        {isPremium && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <h3 className="font-semibold text-[#001C58] dark:text-[#FDBE11] uppercase text-xs tracking-wide mr-2">
                  Canales Premium
                </h3>
                <Crown className="w-4 h-4 text-[#FDBE11]" />
              </div>
              <Link 
                href="/premium-channels"
                className="text-xs text-[#001C58] dark:text-[#FDBE11] hover:underline"
              >
                Ver todos
              </Link>
            </div>
            
            {isPremiumLoading ? (
              // Loading skeleton for premium channels
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center mt-3 p-2">
                    <Skeleton className="w-8 h-8 rounded-full dark:bg-gray-700" />
                    <div className="ml-2">
                      <Skeleton className="h-4 w-24 mb-1 dark:bg-gray-700" />
                      <Skeleton className="h-3 w-16 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </>
            ) : premiumChannels && premiumChannels.length > 0 ? (
              // Render premium channels
              premiumChannels.map((channel: Channel) => (
                <Link 
                  key={channel.id} 
                  href={`/channel/${channel.id}`}
                  className="flex items-center mt-3 hover:bg-[#FDBE11]/10 dark:hover:bg-[#FDBE11]/20 rounded-md p-2 cursor-pointer"
                >
                  <div className="relative">
                    <img 
                      src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=32`} 
                      alt={channel.title} 
                      className="w-8 h-8 rounded-full border border-[#FDBE11]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=32`;
                      }}
                    />
                    <span className="absolute -top-1 -right-1 bg-[#FDBE11] rounded-full w-4 h-4 flex items-center justify-center">
                      <Crown className="w-3 h-3 text-[#001C58]" />
                    </span>
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-[#001C58] dark:text-white flex items-center">
                      {channel.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {channel.platform === 'YouTube' && t('sidebar.youtube_channel')}
                      {channel.platform === 'TikTok' && t('sidebar.tiktok_channel')}
                      {channel.platform === 'Twitter' && t('sidebar.twitter_account')}
                      {channel.platform === 'Instagram' && t('sidebar.instagram_account')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              // No premium channels available
              <div className="mt-3 p-2 text-center">
                <p className="text-sm text-[#001C58]/70 dark:text-gray-400">
                  No hay canales premium disponibles
                </p>
              </div>
            )}
            
            {!isPremium && (
              <div className="mt-4 p-3 bg-[#FDBE11]/10 dark:bg-[#FDBE11]/5 rounded-md border border-[#FDBE11]/30">
                <p className="text-sm text-[#001C58] dark:text-white flex items-center mb-2">
                  <Crown className="w-4 h-4 text-[#FDBE11] mr-2" />
                  Acceso Premium
                </p>
                <p className="text-xs text-[#001C58]/80 dark:text-gray-300">
                  Actualiza a premium para acceder a canales exclusivos con el mejor contenido del Real Madrid.
                </p>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
