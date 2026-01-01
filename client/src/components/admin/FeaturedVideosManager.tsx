import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Search, Trash, ArrowUpDown } from "lucide-react";

export default function FeaturedVideosManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("publishedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);

  // Obtener todos los videos
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', { limit: 500 }],
  });

  // Para importar videos destacados (opcional)
  const importFeaturedMutation = useMutation({
    mutationFn: async (data: { query: string, limit: number }) => {
      return apiRequest('/api/videos/import-featured', { method: 'POST', data });
    },
    onSuccess: () => {
      toast({
        title: "Videos importados",
        description: "Los videos destacados han sido importados correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al importar videos destacados",
        variant: "destructive",
      });
    }
  });

  // Actualizar el estado de destacado de un video
  const updateFeaturedMutation = useMutation({
    mutationFn: async ({ videoId, featured }: { videoId: number, featured: boolean }) => {
      return apiRequest('PUT', `/api/videos/${videoId}`, { featured });
    },
    onSuccess: () => {
      toast({
        title: "Video actualizado",
        description: "El estado destacado del video ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el video",
        variant: "destructive",
      });
    }
  });

  // Actualizar múltiples videos como destacados
  const updateMultipleFeaturedMutation = useMutation({
    mutationFn: async ({ videoIds, featured }: { videoIds: number[], featured: boolean }) => {
      return apiRequest('POST', `/api/videos/featured/batch`, { videoIds, featured });
    },
    onSuccess: () => {
      toast({
        title: "Videos actualizados",
        description: "Los videos seleccionados han sido actualizados",
      });
      setSelectedVideos([]);
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar los videos",
        variant: "destructive",
      });
    }
  });

  // Filtrar videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.channelTitle && video.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Ordenar videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    let aValue: any = a[sortField as keyof Video];
    let bValue: any = b[sortField as keyof Video];
    
    // Manejar fechas
    if (sortField === "publishedAt") {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    // Manejar valores numéricos
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    // Manejar strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Manejar nulos
    if (aValue === null) return sortDirection === "asc" ? -1 : 1;
    if (bValue === null) return sortDirection === "asc" ? 1 : -1;
    
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Manejar selección de videos
  const handleSelectVideo = (videoId: number) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  // Seleccionar todos los videos mostrados
  const handleSelectAll = () => {
    if (selectedVideos.length === sortedVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(sortedVideos.map(video => video.id));
    }
  };

  // Marcar múltiples videos como destacados
  const handleMarkMultipleFeatured = (featured: boolean) => {
    if (selectedVideos.length === 0) {
      toast({
        title: "Selecciona videos",
        description: "Debes seleccionar al menos un video para realizar esta acción",
        variant: "destructive",
      });
      return;
    }
    
    updateMultipleFeaturedMutation.mutate({ videoIds: selectedVideos, featured });
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Videos Destacados</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar videos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Botones para la gestión de videos destacados */}
          <Button 
            onClick={() => handleMarkMultipleFeatured(true)}
            disabled={selectedVideos.length === 0}
            variant="default"
            className="whitespace-nowrap"
          >
            <Star className="mr-2 h-4 w-4" />
            Destacar seleccionados
          </Button>
          
          <Button 
            onClick={() => handleMarkMultipleFeatured(false)}
            disabled={selectedVideos.length === 0}
            variant="outline"
            className="whitespace-nowrap"
          >
            <Trash className="mr-2 h-4 w-4" />
            Quitar destacados
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="p-6">
          <div className="text-center">Cargando videos...</div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedVideos.length === sortedVideos.length && sortedVideos.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead className="w-12">
                      {/* Columna para icono destacado */}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>
                      <div className="flex items-center">
                        Título
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("channelTitle")}>
                      <div className="flex items-center">
                        Canal
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("publishedAt")}>
                      <div className="flex items-center">
                        Fecha
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("platform")}>
                      <div className="flex items-center">
                        Plataforma
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No se encontraron videos. Ajusta los criterios de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedVideos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedVideos.includes(video.id)}
                            onCheckedChange={() => handleSelectVideo(video.id)}
                            aria-label={`Seleccionar ${video.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          {video.featured && (
                            <Star className="h-4 w-4 text-brand-secondary" />
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate font-medium">
                          {video.title}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {video.channelTitle}
                        </TableCell>
                        <TableCell>
                          {formatDate(video.publishedAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {video.platform.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={video.featured ? "outline" : "default"}
                            size="sm"
                            onClick={() => updateFeaturedMutation.mutate({ 
                              videoId: video.id, 
                              featured: !video.featured
                            })}
                            disabled={updateFeaturedMutation.isPending}
                          >
                            {video.featured ? (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                Quitar destacado
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Destacar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
          
          <div className="text-sm text-gray-500">
            Mostrando {sortedVideos.length} de {videos.length} videos
            {selectedVideos.length > 0 && (
              <span className="ml-2 font-semibold">
                ({selectedVideos.length} seleccionados)
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}