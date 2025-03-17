import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Radio, 
  MessageSquare, 
  Trophy, 
  Newspaper,
  ChevronsRight,
  Users,
  ShieldCheck,
  Mic2
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { CategoryType } from '@shared/schema';

interface CategoryFiltersProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export default function CategoryFilters({ selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  const { t } = useLanguage();
  
  const categories = [
    { id: "all" as CategoryType, name: t('categories.all'), icon: <ChevronsRight className="h-4 w-4" /> },
    { id: "matches" as CategoryType, name: t('categories.matches'), icon: <Radio className="h-4 w-4 text-[#FDBE11]" /> },
    { id: "tactics" as CategoryType, name: t('categories.analysis'), icon: <MessageSquare className="h-4 w-4" /> },
    { id: "history" as CategoryType, name: t('categories.history'), icon: <Trophy className="h-4 w-4 text-[#FDBE11]" /> },
    { id: "news" as CategoryType, name: t('categories.news'), icon: <Newspaper className="h-4 w-4" /> },
    { id: "interviews" as CategoryType, name: t('categories.interviews'), icon: <Mic2 className="h-4 w-4" /> },
    { id: "fan_content" as CategoryType, name: t('categories.fans'), icon: <Users className="h-4 w-4" /> },
    { id: "transfers" as CategoryType, name: t('categories.transfers', 'Fichajes'), icon: <ShieldCheck className="h-4 w-4" /> },
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