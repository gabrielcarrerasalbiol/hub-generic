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
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("all")}
        >
          Todas las categorías
        </Button>
        
        <Button
          variant={selectedCategory === "matches" ? "default" : "outline"}
          className={selectedCategory === "matches" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("matches")}
        >
          Partidos Recientes
        </Button>
        
        <Button
          variant={selectedCategory === "training" ? "default" : "outline"}
          className={selectedCategory === "training" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("training")}
        >
          Entrenamientos
        </Button>
        
        <Button
          variant={selectedCategory === "press" ? "default" : "outline"}
          className={selectedCategory === "press" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("press")}
        >
          Ruedas de prensa
        </Button>
        
        <Button
          variant={selectedCategory === "interviews" ? "default" : "outline"}
          className={selectedCategory === "interviews" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("interviews")}
        >
          Entrevistas
        </Button>
        
        <Button
          variant={selectedCategory === "players" ? "default" : "outline"}
          className={selectedCategory === "players" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("players")}
        >
          Historias de jugadores
        </Button>
        
        <Button
          variant={selectedCategory === "analysis" ? "default" : "outline"}
          className={selectedCategory === "analysis" 
            ? "bg-white text-[#001C58] border-[#FDBE11] font-semibold" 
            : "bg-white hover:bg-[#FDBE11]/10 text-[#001C58] border-[#FDBE11]/30"}
          onClick={() => onSelectCategory("analysis")}
        >
          Análisis tácticos
        </Button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
