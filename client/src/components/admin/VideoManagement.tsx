import { useState, useEffect } from 'react';
import { Video, Category } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import './admin-styles.css';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Star, Plus, Search, RefreshCcw, Trash2, Edit, Eye, ArrowUpDown, FileText, Youtube, Twitter, Filter, Download, MoreHorizontal, PlayCircle, FileDown, FileWarning } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { AdminActionMenus } from './AdminActionMenus';

export default function VideoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const [isRecategorizingAll, setIsRecategorizingAll] = useState(false);
  const [isFetchingNewVideos, setIsFetchingNewVideos] = useState(false);
  const [sortField, setSortField] = useState<string>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [fetchVideoCount, setFetchVideoCount] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("youtube");
  const [isImportingByPlatform, setIsImportingByPlatform] = useState(false);
  const [isImportingFeatured, setIsImportingFeatured] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  
  // Estado para paginación
  const [visibleVideos, setVisibleVideos] = useState(20);
  const VIDEOS_PER_PAGE = 20;
  
  // Obtener todos los videos con Header para indicar que es una solicitud admin
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    refetch: refetchVideos
  } = useQuery({
    queryKey: ['/api/videos'],
    staleTime: 1000 * 60 * 5, // 5 minutos
    queryFn: async () => {
      return await apiRequest('/api/videos', {
        headers: {
          'X-Admin-Request': 'true'
        }
      });
    }
  });

  // Obtener todas las categorías
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Mutación para actualizar un video
  const updateVideoMutation = useMutation({
    mutationFn: (videoData: Partial<Video> & { id: number }) => {
      return apiRequest(`/api/videos/${videoData.id}`, {
        method: 'PUT',
        body: JSON.stringify(videoData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Vídeo actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      setEditingVideo(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el vídeo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Mutación para recategorizar un video
  const recategorizeVideoMutation = useMutation({
    mutationFn: (videoId: number) => {
      setIsRecategorizing(true);
      return apiRequest(`/api/videos/${videoId}/recategorize`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Recategorización exitosa",
        description: "El vídeo ha sido recategorizado correctamente mediante IA",
      });
      setIsRecategorizing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo recategorizar el vídeo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsRecategorizing(false);
    }
  });

  // Mutación para recategorizar todos los videos
  const recategorizeAllVideosMutation = useMutation({
    mutationFn: () => {
      setIsRecategorizingAll(true);
      return apiRequest('/api/videos/recategorize/all', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Recategorización masiva completada",
        description: `${data.success} de ${data.total} vídeos recategorizados correctamente`,
      });
      setIsRecategorizingAll(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar la recategorización masiva.",
        variant: "destructive",
      });
      setIsRecategorizingAll(false);
    }
  });

  // Mutación para verificar la disponibilidad de videos
  const verifyVideosAvailabilityMutation = useMutation({
    mutationFn: () => {
      return apiRequest('/api/videos/verify', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Verificación completada",
        description: `${data.removed} vídeos no disponibles han sido eliminados`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar la verificación de disponibilidad.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para buscar y añadir nuevos videos de canales premium
  const fetchNewVideosMutation = useMutation({
    mutationFn: (count: number) => {
      setIsFetchingNewVideos(true);
      return apiRequest('/api/videos/fetch-new', {
        method: 'POST',
        body: JSON.stringify({ maxResults: count })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Búsqueda completada",
        description: `${data.added} nuevos vídeos añadidos de ${data.total} encontrados`,
      });
      setIsFetchingNewVideos(false);
    },
    onError: (error: any) => {
      console.error("Error fetching new videos:", error);
      toast({
        title: "Error",
        description: error?.details || "No se pudieron buscar nuevos vídeos. Verifica las claves de API.",
        variant: "destructive",
      });
      setIsFetchingNewVideos(false);
    }
  });
  
  // Mutación para buscar todo el contenido nuevo relacionado con el Real Madrid
  const fetchAllNewContentMutation = useMutation({
    mutationFn: (count: number) => {
      setIsFetchingNewVideos(true);
      return apiRequest('/api/videos/fetch-all-content', {
        method: 'POST',
        body: JSON.stringify({ maxResults: count })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Actualización de contenido completada",
        description: `${data.added} nuevos vídeos sobre el Real Madrid añadidos de ${data.total} encontrados`,
      });
      setIsFetchingNewVideos(false);
    },
    onError: (error: any) => {
      console.error("Error fetching all new content:", error);
      toast({
        title: "Error",
        description: error?.details || "No se pudo actualizar el contenido relacionado con el Real Madrid. Verifica las claves de API.",
        variant: "destructive",
      });
      setIsFetchingNewVideos(false);
    }
  });
  
  // Mutación para eliminar un video individual
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: number) => {
      setIsDeletingVideo(true);
      return apiRequest(`/api/videos/${videoId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente",
      });
      setIsDeletingVideo(false);
    },
    onError: (error) => {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vídeo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsDeletingVideo(false);
    }
  });
  
  // Mutación para eliminar múltiples videos
  const deleteMultipleVideosMutation = useMutation({
    mutationFn: (videoIds: number[]) => {
      setIsDeletingMultiple(true);
      return apiRequest('/api/videos', {
        method: 'DELETE',
        body: JSON.stringify({ ids: videoIds })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Videos eliminados",
        description: `${data.deleted} de ${data.total} videos han sido eliminados correctamente`,
      });
      setSelectedVideos([]);
      setIsDeletingMultiple(false);
    },
    onError: (error) => {
      console.error("Error deleting multiple videos:", error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los vídeos seleccionados. Inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsDeletingMultiple(false);
    }
  });

  // Mutación para generar resúmenes para todos los videos
  const generateSummariesMutation = useMutation({
    mutationFn: () => {
      setIsGeneratingSummaries(true);
      return apiRequest('/api/videos/generate-summaries/all', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Generación de resúmenes completada",
        description: `${data.success} de ${data.total} videos procesados correctamente`,
      });
      setIsGeneratingSummaries(false);
    },
    onError: (error) => {
      console.error("Error generating summaries:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar los resúmenes de los videos. Verifica las claves de API de IA.",
        variant: "destructive",
      });
      setIsGeneratingSummaries(false);
    }
  });
  
  // Mutación para importar videos por plataforma específica
  const importByPlatformMutation = useMutation({
    mutationFn: ({ platform, maxResults }: { platform: string; maxResults: number }) => {
      setIsImportingByPlatform(true);
      return apiRequest('/api/videos/import-by-platform', {
        method: 'POST',
        body: JSON.stringify({ platform, maxResults })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: `Importación de ${selectedPlatform} completada`,
        description: `${data.added} nuevos vídeos añadidos de ${data.total} encontrados`,
      });
      setIsImportingByPlatform(false);
    },
    onError: (error: any) => {
      console.error(`Error importing videos from ${selectedPlatform}:`, error);
      toast({
        title: "Error",
        description: error?.details || `No se pudieron importar videos de ${selectedPlatform}. Verifica las claves de API.`,
        variant: "destructive",
      });
      setIsImportingByPlatform(false);
    }
  });
  
  // Mutación para importar videos de canales destacados
  const importFeaturedVideosMutation = useMutation({
    mutationFn: (maxPerChannel: number) => {
      setIsImportingFeatured(true);
      return apiRequest('/api/videos/import-featured', {
        method: 'POST',
        body: JSON.stringify({ maxPerChannel })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Importación de canales destacados completada",
        description: `${data.addedVideos} nuevos vídeos añadidos de ${data.totalVideos} encontrados en ${data.processedChannels} de ${data.totalChannels} canales`,
      });
      setIsImportingFeatured(false);
    },
    onError: (error: any) => {
      console.error("Error importing featured channel videos:", error);
      toast({
        title: "Error",
        description: error?.details || "No se pudieron importar videos de canales destacados. Verifica las claves de API.",
        variant: "destructive",
      });
      setIsImportingFeatured(false);
    }
  });

  // Preparar datos para edición
  useEffect(() => {
    if (editingVideo) {
      // Convertir categoryIds a números para garantizar integridad
      const numericCategoryIds = (editingVideo.categoryIds || []).map(id => 
        typeof id === 'string' ? parseInt(id, 10) : id
      ).filter(id => !isNaN(id));
      
      setSelectedCategoryIds(numericCategoryIds);
    } else {
      setSelectedCategoryIds([]);
    }
  }, [editingVideo]);

  // Función para manejar edición de video
  const handleEditVideo = (video: Video) => {
    setEditingVideo({ ...video });
  };

  // Función para guardar cambios
  const handleSaveChanges = () => {
    if (!editingVideo) return;
    
    updateVideoMutation.mutate({
      id: editingVideo.id,
      title: editingVideo.title,
      description: editingVideo.description,
      featured: editingVideo.featured,
      categoryIds: selectedCategoryIds.map(id => id.toString())
    });
  };

  // Filtrar videos por búsqueda y plataforma
  const filteredVideos = Array.isArray(videos) ? videos.filter((video: Video) => {
    // Filtro por plataforma
    if (platformFilter !== 'all' && video.platform !== platformFilter) {
      return false;
    }
    
    // Filtro por videos destacados
    if (showFeaturedOnly && !video.featured) {
      return false;
    }
    
    // Filtro por texto de búsqueda
    if (!searchQuery) return true;
    return (
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      video.platform.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  // Ordenar videos
  const sortedVideos = [...filteredVideos].sort((a: Video, b: Video) => {
    let valueA: any = a[sortField as keyof Video];
    let valueB: any = b[sortField as keyof Video];
    
    // Manejar campos específicos
    if (sortField === 'categoryIds') {
      valueA = a.categoryIds?.length || 0;
      valueB = b.categoryIds?.length || 0;
    }
    
    if (valueA === valueB) return 0;
    
    // Ordenar
    const compareResult = valueA > valueB ? 1 : -1;
    return sortOrder === 'asc' ? compareResult : -compareResult;
  });

  // Función para cambiar el orden
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Función para obtener el nombre de una categoría por ID
  const getCategoryName = (categoryId: string | number) => {
    const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
    const category = Array.isArray(categories) 
      ? categories.find((cat: Category) => cat.id === id)
      : null;
    return category ? category.name : 'Desconocida';
  };

  // Función para alternar la selección de categoría
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Función para manejar la selección de un video
  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };
  
  // Función para seleccionar/deseleccionar todos los videos
  const toggleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(v => v.id));
    }
  };
  
  // Renderizado del componente
  return (
    <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Vídeos</h2>

      <div className="flex flex-col space-y-4 mb-6">
        {/* Filtros de búsqueda y plataforma */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Buscar vídeos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plataformas</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div className="flex items-center space-x-2">
              <Label htmlFor="featured-filter" className="text-sm">Destacados</Label>
              <Switch 
                id="featured-filter" 
                checked={showFeaturedOnly}
                onCheckedChange={setShowFeaturedOnly}
              />
            </div>
          </div>

          <AdminActionMenus
            isRecategorizingAll={isRecategorizingAll}
            isFetchingNewVideos={isFetchingNewVideos}
            isGeneratingSummaries={isGeneratingSummaries}
            isImportingByPlatform={isImportingByPlatform}
            isImportingFeatured={isImportingFeatured}
            selectedVideos={selectedVideos}
            selectedPlatform={selectedPlatform}
            fetchVideoCount={fetchVideoCount}
            isDeletingMultiple={isDeletingMultiple}
            setSelectedPlatform={setSelectedPlatform}
            setFetchVideoCount={setFetchVideoCount}
            verifyVideosAvailabilityMutation={verifyVideosAvailabilityMutation}
            recategorizeAllVideosMutation={recategorizeAllVideosMutation}
            generateSummariesMutation={generateSummariesMutation}
            fetchNewVideosMutation={fetchNewVideosMutation}
            fetchAllNewContentMutation={fetchAllNewContentMutation}
            importByPlatformMutation={importByPlatformMutation}
            importFeaturedVideosMutation={importFeaturedVideosMutation}
            deleteMultipleVideosMutation={deleteMultipleVideosMutation}
          />
        </div>
      </div>

      {isLoadingVideos ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando vídeos...</span>
        </div>
      ) : (
        <>
          <Table>
            <TableCaption>Total de vídeos: {filteredVideos.length}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    id="select-all-header"
                    checked={selectedVideos.length > 0 && selectedVideos.length === filteredVideos.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[250px]">
                  <div className="flex items-center" onClick={() => handleSort('title')}>
                    Título
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center" onClick={() => handleSort('channelTitle')}>
                    Canal
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center" onClick={() => handleSort('platform')}>
                    Plataforma
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center" onClick={() => handleSort('categoryIds')}>
                    Categorías
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center" onClick={() => handleSort('featured')}>
                    Destacado
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center" onClick={() => handleSort('viewCount')}>
                    Vistas
                    <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVideos.length > 0 ? (
                // Calcular qué videos mostrar en la página actual
                sortedVideos
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((video: Video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <Checkbox
                        id={`video-${video.id}`}
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => toggleVideoSelection(video.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[250px]" title={video.title}>
                        {video.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[180px]" title={video.channelTitle}>
                        {video.channelTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {video.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {video.categoryIds && video.categoryIds.length > 0
                          ? video.categoryIds.map(catId => getCategoryName(catId)).join(', ')
                          : 'Sin categorías'
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {video.featured ? (
                        <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {video.viewCount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEditVideo(video)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {editingVideo && editingVideo.id === video.id && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Editar Video</DialogTitle>
                                <DialogDescription>
                                  Modifica la información del video y presiona guardar para actualizar.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Tabs defaultValue="general">
                                <TabsList className="mb-4">
                                  <TabsTrigger value="general">General</TabsTrigger>
                                  <TabsTrigger value="categories">Categorías</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="general">
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="title" className="text-right">Título</Label>
                                      <Input 
                                        id="title" 
                                        value={editingVideo.title} 
                                        onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="description" className="text-right">Descripción</Label>
                                      <Input 
                                        id="description" 
                                        value={editingVideo.description || ''} 
                                        onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                                        className="col-span-3" 
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="platform" className="text-right">Plataforma</Label>
                                      <Input 
                                        id="platform" 
                                        value={editingVideo.platform} 
                                        disabled
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="featured" className="text-right">Destacado</Label>
                                      <div className="flex items-center space-x-2 col-span-3">
                                        <Switch
                                          id="featured"
                                          checked={editingVideo.featured || false}
                                          onCheckedChange={(checked) => setEditingVideo({...editingVideo, featured: checked})}
                                        />
                                        <Label htmlFor="featured">Marcar como destacado</Label>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="categories">
                                  <div className="py-4">
                                    <div className="mb-4 flex justify-between">
                                      <h3 className="text-sm font-medium">Selecciona las categorías para este video</h3>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="btn-madrid-outline"
                                        onClick={() => recategorizeVideoMutation.mutate(editingVideo.id)}
                                        disabled={isRecategorizing}
                                      >
                                        {isRecategorizing ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                          </>
                                        ) : (
                                          <>
                                            <RefreshCcw className="mr-2 h-4 w-4" />
                                            Recategorizar con IA
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      {isLoadingCategories ? (
                                        <div className="col-span-2 flex justify-center py-4">
                                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                      ) : (
                                        Array.isArray(categories) && categories.map((category: Category) => (
                                          <div key={category.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                            <Checkbox 
                                              id={`category-${category.id}`}
                                              checked={selectedCategoryIds.includes(category.id)}
                                              onCheckedChange={() => toggleCategory(category.id)}
                                            />
                                            <Label htmlFor={`category-${category.id}`}>
                                              {category.name}
                                            </Label>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                              
                              <DialogFooter>
                                <Button variant="outline" className="btn-madrid-outline" onClick={() => setEditingVideo(null)}>Cancelar</Button>
                                <Button className="btn-madrid-gold" onClick={handleSaveChanges} disabled={updateVideoMutation.isPending}>
                                  {updateVideoMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Guardando...
                                    </>
                                  ) : 'Guardar cambios'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(`/videos/${video.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar video</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que deseas eliminar este video?
                                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                  <p className="font-medium">{video.title}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{video.platform} • {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'Fecha desconocida'}</p>
                                </div>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteVideoMutation.mutate(video.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isDeletingVideo ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                  </>
                                ) : 'Eliminar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No se encontraron vídeos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Agregar un checkbox para seleccionar todos en la cabecera */}
          <div className="flex justify-between items-center mt-6 mb-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all"
                checked={selectedVideos.length > 0 && selectedVideos.length === filteredVideos.length}
                onCheckedChange={toggleSelectAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer">
                {selectedVideos.length === 0 ? 'Seleccionar todos' : 
                 selectedVideos.length === filteredVideos.length ? 'Deseleccionar todos' : 
                 `Seleccionados ${selectedVideos.length} de ${filteredVideos.length}`}
              </Label>
            </div>
            
            {selectedVideos.length > 0 && (
              <Button 
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setSelectedVideos([])}
              >
                Limpiar selección
              </Button>
            )}
          </div>
          
          {/* Paginación */}
          {sortedVideos.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {Math.min((currentPage * itemsPerPage), sortedVideos.length) - ((currentPage - 1) * itemsPerPage)} de {sortedVideos.length} videos
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1); // Resetear a primera página cuando se cambia el número de items
                  }}
                >
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="20 por página" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                    <SelectItem value="100">100 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {Math.ceil(sortedVideos.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedVideos.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(sortedVideos.length / itemsPerPage)}
                >
                  Siguiente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.ceil(sortedVideos.length / itemsPerPage))}
                  disabled={currentPage >= Math.ceil(sortedVideos.length / itemsPerPage)}
                >
                  Última
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}