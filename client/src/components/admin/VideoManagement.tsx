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
import { Loader2, Star, Plus, Search, RefreshCw, Trash2, Edit, Eye, ArrowUpDown } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

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

  // Obtener todos los videos
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    refetch: refetchVideos
  } = useQuery({
    queryKey: ['/api/videos'],
    staleTime: 1000 * 60 * 5, // 5 minutos
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
  
  // Mutación para buscar y añadir nuevos videos
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

  // Filtrar videos por búsqueda
  const filteredVideos = Array.isArray(videos) ? videos.filter((video: Video) => {
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

  // Renderizado del componente
  return (
    <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Vídeos</h2>

      <div className="flex flex-col space-y-4 mb-6">
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="btn-madrid-outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Disponibilidad
              </Button>
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default"
                className="btn-madrid-gold"
                disabled={isRecategorizingAll}
              >
                {isRecategorizingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recategorizar Todo
                  </>
                )}
              </Button>
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="secondary"
                className="btn-madrid-gold"
                disabled={isFetchingNewVideos}
              >
                {isFetchingNewVideos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Nuevos Videos
                  </>
                )}
              </Button>
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
        </div>
      </div>

      {isLoadingVideos ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando vídeos...</span>
        </div>
      ) : (
        <Table>
          <TableCaption>Total de vídeos: {filteredVideos.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center" onClick={() => handleSort('title')}>
                  Título
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
              sortedVideos.map((video: Video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium line-clamp-2">
                    {video.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {video.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {video.categoryIds?.map((catId) => (
                        <Badge key={catId} className="mr-1 mb-1">
                          {getCategoryName(catId)}
                        </Badge>
                      ))}
                      {(!video.categoryIds || video.categoryIds.length === 0) && (
                        <span className="text-muted-foreground text-sm">Sin categorías</span>
                      )}
                    </div>
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
                                          <RefreshCw className="mr-2 h-4 w-4" />
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No se encontraron vídeos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}