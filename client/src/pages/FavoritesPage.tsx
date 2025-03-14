import { useQuery } from "@tanstack/react-query";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Video } from "@shared/schema";

export default function FavoritesPage() {
  // Fetch user's favorite videos
  const { 
    data: favorites = [], // Proporcionar un valor predeterminado de array vacío
    isLoading, 
    error,
    isError
  } = useQuery<Video[]>({
    queryKey: ['/api/favorites'],
  });

  return (
    <main className="flex-1 bg-gray-100 dark:bg-[#2C2152] p-4 md:p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Mis Favoritos</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Aquí encontrarás todos tus videos favoritos del Real Madrid guardados en un solo lugar.
        </p>
      </div>

      {/* Display loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
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
      )}

      {/* Display error state */}
      {isError && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="dark:text-gray-300">No se pudieron cargar tus videos favoritos. Por favor, intenta de nuevo más tarde.</p>
        </div>
      )}

      {/* Display empty state */}
      {!isLoading && !isError && favorites && favorites.length === 0 && (
        <div className="bg-white dark:bg-[#3E355F] rounded-lg shadow-md p-8 text-center">
          <i className="far fa-star text-5xl text-gray-400 dark:text-[#FDBE11]/70 mb-4"></i>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No tienes favoritos guardados</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Cuando marques videos como favoritos, aparecerán aquí para que puedas verlos fácilmente.
          </p>
          <Link href="/" className="px-6 py-3 bg-[#1E3A8A] text-white rounded-md font-medium hover:bg-blue-800 transition duration-200 inline-block">
            Explorar videos
          </Link>
        </div>
      )}

      {/* Display favorites */}
      {!isLoading && !isError && favorites && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </main>
  );
}
