import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Video } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Star, Loader2 } from "lucide-react";

export default function FeaturedVideosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fetchVideoCount, setFetchVideoCount] = useState<number>(20);
  const [isImportingFeatured, setIsImportingFeatured] = useState(false);

  // Consulta para obtener videos destacados
  const {
    data: featuredVideos = [],
    isLoading,
    isFetching
  } = useQuery({
    queryKey: ['/api/videos/featured'],
    queryFn: getQueryFn<Video[]>({ on401: 'returnNull' }),
  });

  // Mutación para importar videos destacados
  const importFeaturedVideosMutation = useMutation({
    mutationFn: (maxPerChannel: number) => {
      setIsImportingFeatured(true);
      return apiRequest('/api/videos/import-featured', {
        method: 'POST',
        body: JSON.stringify({ maxPerChannel })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
      toast({
        title: "Importación de videos destacados completada",
        description: `${data.addedVideos} nuevos vídeos añadidos de ${data.totalVideos} encontrados en ${data.processedChannels} de ${data.totalChannels} canales`,
      });
      setIsImportingFeatured(false);
    },
    onError: (error: any) => {
      console.error("Error importing featured videos:", error);
      toast({
        title: "Error",
        description: error?.details || "No se pudieron importar videos destacados. Verifica las claves de API.",
        variant: "destructive",
      });
      setIsImportingFeatured(false);
    }
  });

  return (
    <>
      <Helmet>
        <title>Videos Destacados | Hub Madridista</title>
      </Helmet>
      
      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#001C58]">Videos Destacados</h1>
          
          {user && user.role === "admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  disabled={isImportingFeatured}
                >
                  {isImportingFeatured ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      <span>Importar Videos Destacados</span>
                    </>
                  )}
                </Button>
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
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Importar Videos Destacados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-video" />
                <div className="p-3">
                  <Skeleton className="h-5 w-full mb-3" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-2" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredVideos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border-2 border-[#FDBE11] p-6 text-center">
            <p className="text-[#001C58]">No hay videos destacados disponibles en este momento.</p>
            {user && user.role === "admin" && (
              <Button 
                onClick={() => importFeaturedVideosMutation.mutate(fetchVideoCount)} 
                className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={isImportingFeatured}
              >
                {isImportingFeatured ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Importar Videos Destacados
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </main>
    </>
  );
}