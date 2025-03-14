import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CategoryType } from "@shared/schema";

interface CategoryFiltersProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export default function CategoryFilters({ selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  return (
    <ScrollArea className="whitespace-nowrap mb-6">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          className={selectedCategory === "all" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("all")}
        >
          Todas
        </Button>
        
        <Button
          variant={selectedCategory === "matches" ? "default" : "outline"}
          className={selectedCategory === "matches" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("matches")}
        >
          Partidos
        </Button>
        
        <Button
          variant={selectedCategory === "transfers" ? "default" : "outline"}
          className={selectedCategory === "transfers" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("transfers")}
        >
          Fichajes
        </Button>
        
        <Button
          variant={selectedCategory === "tactics" ? "default" : "outline"}
          className={selectedCategory === "tactics" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("tactics")}
        >
          Tácticas
        </Button>
        
        <Button
          variant={selectedCategory === "interviews" ? "default" : "outline"}
          className={selectedCategory === "interviews" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("interviews")}
        >
          Entrevistas
        </Button>
        
        <Button
          variant={selectedCategory === "history" ? "default" : "outline"}
          className={selectedCategory === "history" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("history")}
        >
          Historia
        </Button>
        
        <Button
          variant={selectedCategory === "fan_content" ? "default" : "outline"}
          className={selectedCategory === "fan_content" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("fan_content")}
        >
          Aficionados
        </Button>
        
        <Button
          variant={selectedCategory === "news" ? "default" : "outline"}
          className={selectedCategory === "news" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold dark:bg-[#3E355F] dark:text-white" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30 dark:bg-[#3E355F] dark:text-white dark:border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("news")}
        >
          Noticias
        </Button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
