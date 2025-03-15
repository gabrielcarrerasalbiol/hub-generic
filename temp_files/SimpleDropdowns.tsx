import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, RefreshCcw, FileText, Download, MoreHorizontal, PlayCircle, FileWarning } from 'lucide-react';

export function ActionMenus() {
  return (
    <>
      {/* Grupo de acciones para gestión de videos */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="btn-madrid-outline">
            <FileWarning className="mr-2 h-4 w-4" />
            Gestión de Videos
            <MoreHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Acciones de Video</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Verificar Disponibilidad
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Recategorizar Todo
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            Generar Resúmenes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Grupo de acciones para importación */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="btn-madrid-gold text-white">
            <Download className="mr-2 h-4 w-4" />
            Importar Contenido
            <MoreHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Importar Videos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem>
            <Search className="mr-2 h-4 w-4" />
            Buscar Nuevos Videos
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar Todo
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <PlayCircle className="mr-2 h-4 w-4" />
            Importar por Plataforma
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}