import { 
  Search, 
  FileX, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Star, 
  Heart, 
  Video, 
  Bell,
  MessageSquare
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  className?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  iconName = "search", 
  className = "" 
}: EmptyStateProps) {
  
  const getIcon = () => {
    switch (iconName.toLowerCase()) {
      case 'file':
        return <FileX className="h-12 w-12 text-gray-400" />;
      case 'alert':
        return <AlertTriangle className="h-12 w-12 text-gray-400" />;
      case 'info':
        return <Info className="h-12 w-12 text-gray-400" />;
      case 'sparkles':
        return <Sparkles className="h-12 w-12 text-gray-400" />;
      case 'star':
        return <Star className="h-12 w-12 text-gray-400" />;
      case 'heart':
        return <Heart className="h-12 w-12 text-gray-400" />;
      case 'video':
        return <Video className="h-12 w-12 text-gray-400" />;
      case 'bell':
        return <Bell className="h-12 w-12 text-gray-400" />;
      case 'comment':
        return <MessageSquare className="h-12 w-12 text-gray-400" />;
      case 'search':
      default:
        return <Search className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className={`text-center py-16 px-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 ${className}`}>
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">{description}</p>
    </div>
  );
}