import { Link } from 'wouter';
import { Channel } from '@shared/schema';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  // Helper functions
  const formatCount = (count: number | null): string => {
    if (!count) return "0";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getChannelBgColor = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'bg-red-500';
      case 'tiktok':
        return 'bg-black';
      case 'twitter':
        return 'bg-blue-400';
      case 'instagram':
        return 'bg-pink-500';
      default:
        return 'bg-[#1E3A8A]';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Channel Banner */}
      <div 
        className={`h-24 ${getChannelBgColor(channel.platform)}`}
        style={channel.bannerUrl ? { backgroundImage: `url(${channel.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      ></div>
      
      {/* Channel Info */}
      <div className="px-4 pt-0 pb-4 relative">
        <div className="flex flex-col items-center">
          <img 
            src={channel.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`} 
            alt={channel.title} 
            className="w-16 h-16 rounded-full border-4 border-white -mt-8 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title)}&background=random&color=fff&size=128`;
            }}
          />
          <h3 className="mt-2 font-bold text-center">{channel.title}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {channel.platform === 'YouTube' && 'Canal de YouTube'}
            {channel.platform === 'TikTok' && 'Canal de TikTok'}
            {channel.platform === 'Twitter' && 'Cuenta de Twitter'}
            {channel.platform === 'Instagram' && 'Cuenta de Instagram'}
          </p>
          <div className="flex items-center text-sm text-gray-600 space-x-3">
            <span className="flex items-center">
              <i className="fas fa-users mr-1"></i> {formatCount(channel.subscriberCount)}
            </span>
            <span className="flex items-center">
              <i className="fas fa-video mr-1"></i> {formatCount(channel.videoCount)}
            </span>
          </div>
          <Link href={`/channel/${channel.id}`} className="mt-3 px-4 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-full text-sm font-medium transition duration-200 inline-block">
            Ver canal
          </Link>
        </div>
      </div>
    </div>
  );
}
