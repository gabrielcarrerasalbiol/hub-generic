import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Radio, 
  MessageSquare, 
  Trophy, 
  User, 
  Newspaper,
  Ticket,
  ChevronsRight,
  Users,
  ShieldCheck,
  Mic2
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilters({ selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  const { t } = useLanguage();
  
  const categories = [
    { id: "all", name: t('categories.all'), icon: <ChevronsRight className="h-4 w-4" /> },
    { id: "Partidos", name: t('categories.matches'), icon: <Radio className="h-4 w-4 text-[#FDBE11]" /> },
    { id: "Análisis", name: t('categories.analysis'), icon: <MessageSquare className="h-4 w-4" /> },
    { id: "Histórico", name: t('categories.history'), icon: <Trophy className="h-4 w-4 text-[#FDBE11]" /> },
    { id: "Jugadores", name: t('sidebar.players'), icon: <User className="h-4 w-4" /> },
    { id: "Noticias", name: t('categories.news'), icon: <Newspaper className="h-4 w-4" /> },
    { id: "Entrevistas", name: t('categories.interviews'), icon: <Mic2 className="h-4 w-4" /> },
    { id: "Afición", name: t('categories.fans'), icon: <Users className="h-4 w-4" /> },
    { id: "Institucional", name: t('categories.institutional', 'Institucional'), icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  return (
    <>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "flex items-center gap-1 border-slate-300",
            selectedCategory === category.id
              ? "bg-[#001C58] text-white hover:bg-[#001C58]/90"
              : "hover:bg-slate-100"
          )}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.icon}
          {category.name}
        </Button>
      ))}
    </>
  );
}