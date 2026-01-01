import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from 'lucide-react';

export default function LanguageSelector() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    setIsOpen(false);
    
    // Mostrar notificación del cambio de idioma
    toast({
      title: t('toast.languageUpdated'),
      description: language === 'es' ? t('toast.languageChanged') : t('toast.languageChangedEn'),
    });
  };

  // Determinar qué bandera mostrar según el idioma actual
  const getFlagEmoji = () => {
    return currentLanguage === 'es' ? '🇪🇸' : '🇬🇧';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          aria-label={t('language.select')}
          className="px-2 rounded-full hover:bg-transparent hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"
        >
          <span className="text-base mr-1">{getFlagEmoji()}</span>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('es')}
          className={`${currentLanguage === 'es' ? 'font-bold bg-slate-100 dark:bg-slate-800' : ''} cursor-pointer`}
        >
          <span className="mr-2">🇪🇸</span>
          {t('language.spanish')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={`${currentLanguage === 'en' ? 'font-bold bg-slate-100 dark:bg-slate-800' : ''} cursor-pointer`}
        >
          <span className="mr-2">🇬🇧</span>
          {t('language.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}