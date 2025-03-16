import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Función para generar un array con los números de página a mostrar
  const getPageNumbers = () => {
    // Si hay 7 o menos páginas, mostrar todas
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Siempre mostrar la primera página, la última página y algunas en el medio
    if (currentPage <= 3) {
      // Si estamos cerca del inicio: 1, 2, 3, 4, 5, ..., totalPages
      return [1, 2, 3, 4, 5, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      // Si estamos cerca del final: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      // Si estamos en el medio: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 my-6">
      {/* Botón para ir a la primera página */}
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      {/* Botón para ir a la página anterior */}
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Números de página */}
      {pageNumbers.map((page, index) => (
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={`w-8 h-8 ${currentPage === page ? "bg-[#001C58] text-white" : ""}`}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      ))}
      
      {/* Botón para ir a la página siguiente */}
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Botón para ir a la última página */}
      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}