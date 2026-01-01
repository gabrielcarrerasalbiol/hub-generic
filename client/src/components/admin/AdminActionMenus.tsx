import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, RefreshCcw, FileText, Download, MoreHorizontal, PlayCircle, FileWarning, Loader2, Star } from 'lucide-react';

interface AdminActionMenusProps {
  // Estados
  isRecategorizingAll: boolean;
  isFetchingNewVideos: boolean;
  isGeneratingSummaries: boolean;
  isImportingByPlatform: boolean;
  isImportingFeatured?: boolean;
  selectedVideos: number[];
  selectedPlatform: string;
  fetchVideoCount: number;
  isDeletingMultiple: boolean;
  
  // Funciones
  setSelectedPlatform: (platform: string) => void;
  setFetchVideoCount: (count: number) => void;
  
  // Mutaciones
  verifyVideosAvailabilityMutation: {
    mutate: () => void;
  };
  recategorizeAllVideosMutation: {
    mutate: () => void;
  };
  generateSummariesMutation: {
    mutate: () => void;
  };
  fetchNewVideosMutation: {
    mutate: (count: number) => void;
  };
  fetchAllNewContentMutation: {
    mutate: (count: number) => void;
  };
  importByPlatformMutation: {
    mutate: (params: {platform: string, maxResults: number}) => void;
  };
  importFeaturedVideosMutation?: {
    mutate: (count: number) => void;
  };
  deleteMultipleVideosMutation: {
    mutate: (videoIds: number[]) => void;
  };
}

export function AdminActionMenus({
  isRecategorizingAll,
  isFetchingNewVideos,
  isGeneratingSummaries,
  isImportingByPlatform,
  isImportingFeatured,
  selectedVideos,
  selectedPlatform,
  fetchVideoCount,
  isDeletingMultiple,
  setSelectedPlatform,
  setFetchVideoCount,
  verifyVideosAvailabilityMutation,
  recategorizeAllVideosMutation,
  generateSummariesMutation,
  fetchNewVideosMutation,
  fetchAllNewContentMutation,
  importByPlatformMutation,
  importFeaturedVideosMutation,
  deleteMultipleVideosMutation,
}: AdminActionMenusProps) {
  return (
    <div className="flex items-center space-x-2">
      {selectedVideos.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="gap-2"
            >
              <Loader2 className={`h-4 w-4 ${isDeletingMultiple ? "animate-spin" : "hidden"}`} />
              <Loader2 className={`h-4 w-4 mr-2 ${!isDeletingMultiple ? "" : "hidden"}`} />
              {isDeletingMultiple ? "Eliminando..." : `Eliminar (${selectedVideos.length})`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar múltiples videos</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar {selectedVideos.length} videos seleccionados?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMultipleVideosMutation.mutate(selectedVideos)}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar seleccionados
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
          
          {/* Verificar Disponibilidad */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Verificar Disponibilidad
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Verificar disponibilidad de vídeos</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción comprobará si todos los vídeos siguen disponibles en sus plataformas originales.
                  Los vídeos que ya no están disponibles serán eliminados de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => verifyVideosAvailabilityMutation.mutate()}
                  className="btn-madrid-gold"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Recategorizar Todo */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isRecategorizingAll}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isRecategorizingAll ? "Procesando..." : "Recategorizar Todo"}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recategorizar todos los vídeos</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción utilizará IA para recategorizar automáticamente todos los vídeos
                  basándose en su título, descripción y contenido. Este proceso puede tardar varios minutos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => recategorizeAllVideosMutation.mutate()}
                  className="btn-madrid-gold"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Generar Resúmenes */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isGeneratingSummaries}>
                <FileText className="mr-2 h-4 w-4" />
                {isGeneratingSummaries ? "Generando resúmenes..." : "Generar Resúmenes"}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generar resúmenes de videos</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción utilizará IA para generar resúmenes concisos para todos los videos que no tengan uno.
                  Los resúmenes ayudan a los usuarios a entender rápidamente el contenido de cada video.
                  Este proceso puede tardar varios minutos dependiendo de la cantidad de videos sin resumen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => generateSummariesMutation.mutate()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Generar Resúmenes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          
          {/* Buscar Nuevos Videos */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isFetchingNewVideos}>
                <Search className="mr-2 h-4 w-4" />
                {isFetchingNewVideos ? "Buscando..." : "Buscar Nuevos Videos"}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Buscar nuevos videos</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción buscará automáticamente nuevos videos relacionados con el Real Madrid en YouTube
                  y los añadirá a la base de datos con categorización automática mediante IA.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="videoCount">Cantidad de videos a buscar:</Label>
                  <div className="flex-1">
                    <Slider
                      id="videoCount"
                      min={5}
                      max={100}
                      step={5}
                      value={[fetchVideoCount]}
                      onValueChange={(values: number[]) => setFetchVideoCount(values[0])}
                    />
                  </div>
                  <div className="w-12 text-center">
                    <span className="text-lg font-medium">{fetchVideoCount}</span>
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => fetchNewVideosMutation.mutate(fetchVideoCount)}
                  className="btn-madrid-gold"
                >
                  Buscar Videos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Actualizar Todo */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isFetchingNewVideos}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isFetchingNewVideos ? "Actualizando..." : "Actualizar Todo"}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Actualizar todo el contenido del Real Madrid</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción buscará contenido reciente de todas las categorías relacionadas con el Real Madrid 
                  (partidos, entrevistas, ruedas de prensa, análisis, etc.) y lo añadirá a la plataforma.
                  Este proceso es más amplio y puede tardar varios minutos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="contentCount">Cantidad máxima de videos por categoría:</Label>
                  <div className="flex-1">
                    <Slider
                      id="contentCount"
                      min={5}
                      max={50}
                      step={5}
                      value={[fetchVideoCount]}
                      onValueChange={(values: number[]) => setFetchVideoCount(values[0])}
                    />
                  </div>
                  <div className="w-12 text-center">
                    <span className="text-lg font-medium">{fetchVideoCount}</span>
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => fetchAllNewContentMutation.mutate(fetchVideoCount)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Actualizar Contenido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Importar videos de canales destacados */}
          {importFeaturedVideosMutation && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isImportingFeatured}>
                  <Star className="mr-2 h-4 w-4" />
                  {isImportingFeatured ? "Importando destacados..." : "Importar de Destacados"}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Importar más videos de canales destacados</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción importará videos adicionales de los canales que ya tienen videos destacados en la plataforma.
                    Esto te permitirá mantener actualizada la sección de destacados con el contenido más reciente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="featuredImportCount">Máximo videos por canal:</Label>
                    <div className="flex-1">
                      <Slider
                        id="featuredImportCount"
                        min={5}
                        max={30}
                        step={5}
                        value={[fetchVideoCount]}
                        onValueChange={(values: number[]) => setFetchVideoCount(values[0])}
                      />
                    </div>
                    <div className="w-12 text-center">
                      <span className="text-lg font-medium">{fetchVideoCount}</span>
                    </div>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => importFeaturedVideosMutation.mutate(fetchVideoCount)}
                    className="bg-brand-secondary hover:bg-brand-secondary/90"
                  >
                    Importar Videos Destacados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {/* Importar por plataforma específica */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isImportingByPlatform}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {isImportingByPlatform ? "Importando..." : "Importar por Plataforma"}
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar videos por plataforma</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción buscará e importará videos del Real Madrid desde la plataforma seleccionada.
                  Selecciona la plataforma de origen y la cantidad de videos a importar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platformSelect">Plataforma:</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger id="platformSelect" className="w-full">
                      <SelectValue placeholder="Selecciona una plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <Label htmlFor="importCount">Cantidad de videos a importar:</Label>
                  <div className="flex-1">
                    <Slider
                      id="importCount"
                      min={5}
                      max={50}
                      step={5}
                      value={[fetchVideoCount]}
                      onValueChange={(values: number[]) => setFetchVideoCount(values[0])}
                    />
                  </div>
                  <div className="w-12 text-center">
                    <span className="text-lg font-medium">{fetchVideoCount}</span>
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => importByPlatformMutation.mutate({ platform: selectedPlatform, maxResults: fetchVideoCount })}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Importar Videos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}