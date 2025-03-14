import { Button } from "@/components/ui/button";
import { Languages, Globe } from 'lucide-react';

interface LanguageFiltersProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

export default function LanguageFilters({ selectedLanguage, onSelectLanguage }: LanguageFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedLanguage === "all" ? "default" : "outline"}
        className={selectedLanguage === "all" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectLanguage("all")}
      >
        <Globe className="h-4 w-4 mr-2 text-[#FDBE11]" /> Todos
      </Button>
      
      <Button
        variant={selectedLanguage === "es" ? "default" : "outline"}
        className={selectedLanguage === "es" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectLanguage("es")}
      >
        <Languages className="h-4 w-4 mr-2 text-red-500" /> Español
      </Button>
      
      <Button
        variant={selectedLanguage === "en" ? "default" : "outline"}
        className={selectedLanguage === "en" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectLanguage("en")}
      >
        <Languages className="h-4 w-4 mr-2 text-blue-500" /> Inglés
      </Button>
      
      <Button
        variant={selectedLanguage === "fr" ? "default" : "outline"}
        className={selectedLanguage === "fr" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectLanguage("fr")}
      >
        <Languages className="h-4 w-4 mr-2 text-green-500" /> Francés
      </Button>
      
      <Button
        variant={selectedLanguage === "pt" ? "default" : "outline"}
        className={selectedLanguage === "pt" 
          ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
          : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
        onClick={() => onSelectLanguage("pt")}
      >
        <Languages className="h-4 w-4 mr-2 text-yellow-500" /> Portugués
      </Button>
    </div>
  );
}